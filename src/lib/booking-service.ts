import { db } from '@/lib/db'
import { BookingStatus, PaymentStatus, UserRole } from '@prisma/client'
import { format, addDays, isWeekend, isSameDay } from 'date-fns'
import { ar } from 'date-fns/locale'

export interface BookingServiceConfig {
  maxConcurrentBookings: number
  maxDaysInAdvance: number
  workingHours: {
    start: string
    end: string
    weekends: number[]
  }
  bufferTime: number // minutes between bookings
}

export class BookingService {
  private static instance: BookingService
  private config: BookingServiceConfig

  private constructor() {
    this.config = {
      maxConcurrentBookings: 3,
      maxDaysInAdvance: 30,
      workingHours: {
        start: '09:00',
        end: '17:00',
        weekends: [0, 6] // Sunday, Saturday
      },
      bufferTime: 15
    }
  }

  static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService()
    }
    return BookingService.instance
  }

  // Test Drive Booking Methods
  async createTestDriveBooking(data: {
    vehicleId: string
    date: Date
    timeSlot: string
    customerInfo: {
      name: string
      email: string
      phone: string
      licenseNumber: string
    }
    message?: string
  }) {
    // Validate vehicle availability
    const vehicle = await this.validateVehicleAvailability(data.vehicleId, data.date)
    
    // Check for conflicting bookings
    await this.checkTestDriveConflicts(data.vehicleId, data.date, data.timeSlot)
    
    // Create or find customer
    const customer = await this.findOrCreateCustomer(data.customerInfo)
    
    // Create booking
    const booking = await db.testDriveBooking.create({
      data: {
        customerId: customer.id,
        vehicleId: data.vehicleId,
        date: data.date,
        timeSlot: data.timeSlot,
        notes: data.message ? `${data.message}\n\nرخصة القيادة: ${data.customerInfo.licenseNumber}` : `رخصة القيادة: ${data.customerInfo.licenseNumber}`,
        status: BookingStatus.PENDING
      },
      include: {
        customer: true,
        vehicle: true
      }
    })

    // Schedule reminder
    await this.scheduleBookingReminder(booking.id, 'TEST_DRIVE')

    return booking
  }

  // Service Booking Methods
  async createServiceBooking(data: {
    vehicleId?: string
    serviceTypeIds: string[]
    date: Date
    timeSlot: string
    customerInfo: {
      name: string
      email: string
      phone: string
      licenseNumber?: string
    }
    vehicleInfo?: {
      licensePlate?: string
      vin?: string
      mileage?: number
    }
    message?: string
    urgency?: 'LOW' | 'MEDIUM' | 'HIGH' | 'EMERGENCY'
  }) {
    // Validate service types
    const serviceTypes = await this.validateServiceTypes(data.serviceTypeIds)
    
    // Check for conflicts
    await this.checkServiceConflicts(data.serviceTypeIds, data.date, data.timeSlot)
    
    // Create or find customer
    const customer = await this.findOrCreateCustomer(data.customerInfo)
    
    // Calculate total price
    const totalPrice = serviceTypes.reduce((sum, st) => sum + (st.price || 0), 0)
    
    // Create bookings for each service type
    const bookings = await Promise.all(
      data.serviceTypeIds.map(serviceTypeId => 
        db.serviceBooking.create({
          data: {
            customerId: customer.id,
            vehicleId: data.vehicleId,
            serviceTypeId,
            date: data.date,
            timeSlot: data.timeSlot,
            notes: this.buildServiceNotes(data.message, data.vehicleInfo, data.urgency),
            totalPrice: serviceTypes.find(st => st.id === serviceTypeId)?.price || null,
            status: BookingStatus.PENDING,
            paymentStatus: totalPrice > 0 ? PaymentStatus.PENDING : PaymentStatus.COMPLETED
          },
          include: {
            customer: true,
            vehicle: true,
            serviceType: true
          }
        })
      )
    )

    // Schedule reminders
    await Promise.all(
      bookings.map(booking => this.scheduleBookingReminder(booking.id, 'SERVICE'))
    )

    return { bookings, totalPrice }
  }

  // Availability Checking Methods
  async getTestDriveAvailability(vehicleId: string, date: Date) {
    const timeSlots = this.generateTimeSlots(date)
    const bookings = await db.testDriveBooking.findMany({
      where: {
        vehicleId,
        date,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
        }
      }
    })

    return timeSlots.map(slot => ({
      time: slot,
      available: !bookings.some(booking => booking.timeSlot === slot)
    }))
  }

  async getServiceAvailability(serviceTypeIds: string[], date: Date) {
    const timeSlots = this.generateTimeSlots(date)
    const availability = await Promise.all(
      timeSlots.map(async (slot) => {
        const conflictingBookings = await db.serviceBooking.count({
          where: {
            serviceTypeId: { in: serviceTypeIds },
            date,
            timeSlot: slot,
            status: {
              in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
            }
          }
        })
        
        return {
          time: slot,
          available: conflictingBookings < this.config.maxConcurrentBookings
        }
      })
    )

    return availability
  }

  // Booking Management Methods
  async updateBookingStatus(bookingId: string, status: BookingStatus, type: 'TEST_DRIVE' | 'SERVICE') {
    if (type === 'TEST_DRIVE') {
      return await db.testDriveBooking.update({
        where: { id: bookingId },
        data: { status }
      })
    } else {
      return await db.serviceBooking.update({
        where: { id: bookingId },
        data: { status }
      })
    }
  }

  async cancelBooking(bookingId: string, type: 'TEST_DRIVE' | 'SERVICE', reason?: string) {
    const booking = await this.updateBookingStatus(bookingId, BookingStatus.CANCELLED, type)
    
    // Add cancellation reason to notes
    if (reason) {
      const notes = booking.notes || ''
      const updatedNotes = `${notes}\n\nتم الإلغاء: ${reason}`
      
      if (type === 'TEST_DRIVE') {
        await db.testDriveBooking.update({
          where: { id: bookingId },
          data: { notes: updatedNotes }
        })
      } else {
        await db.serviceBooking.update({
          where: { id: bookingId },
          data: { notes: updatedNotes }
        })
      }
    }

    return booking
  }

  // Calendar and Scheduling Methods
  async getBookingsCalendar(startDate: Date, endDate: Date) {
    const testDriveBookings = await db.testDriveBooking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
        }
      },
      include: {
        customer: true,
        vehicle: true
      }
    })

    const serviceBookings = await db.serviceBooking.findMany({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
        }
      },
      include: {
        customer: true,
        vehicle: true,
        serviceType: true
      }
    })

    return {
      testDriveBookings: testDriveBookings.map(booking => ({
        id: booking.id,
        title: `قيادة تجريبية - ${booking.vehicle.make} ${booking.vehicle.model}`,
        start: `${format(booking.date, 'yyyy-MM-dd')}T${booking.timeSlot}`,
        end: this.calculateEndTime(booking.timeSlot, 45), // 45 minutes for test drive
        type: 'TEST_DRIVE',
        status: booking.status,
        customer: booking.customer.name,
        vehicle: `${booking.vehicle.make} ${booking.vehicle.model}`
      })),
      serviceBookings: serviceBookings.map(booking => ({
        id: booking.id,
        title: `خدمة - ${booking.serviceType.name}`,
        start: `${format(booking.date, 'yyyy-MM-dd')}T${booking.timeSlot}`,
        end: this.calculateEndTime(booking.timeSlot, booking.serviceType.duration),
        type: 'SERVICE',
        status: booking.status,
        customer: booking.customer.name,
        service: booking.serviceType.name,
        vehicle: booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : 'غير محدد'
      }))
    }
  }

  // Analytics and Reporting Methods
  async getBookingStats(startDate: Date, endDate: Date) {
    const testDriveStats = await db.testDriveBooking.groupBy({
      by: ['status'],
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })

    const serviceStats = await db.serviceBooking.groupBy({
      by: ['status'],
      where: {
        date: {
          gte: startDate,
          lte: endDate
        }
      },
      _count: {
        id: true
      }
    })

    const popularServices = await db.serviceBooking.groupBy({
      by: ['serviceTypeId'],
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        status: BookingStatus.COMPLETED
      },
      _count: {
        id: true
      },
      orderBy: {
        _count: {
          id: 'desc'
        }
      },
      take: 5
    })

    return {
      testDriveBookings: testDriveStats.reduce((acc, stat) => ({
        ...acc,
        [stat.status]: stat._count.id
      }), {} as Record<string, number>),
      serviceBookings: serviceStats.reduce((acc, stat) => ({
        ...acc,
        [stat.status]: stat._count.id
      }), {} as Record<string, number>),
      popularServices: popularServices
    }
  }

  // Helper Methods
  private async validateVehicleAvailability(vehicleId: string, date: Date) {
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      throw new Error('المركبة غير موجودة')
    }

    if (vehicle.status !== 'AVAILABLE') {
      throw new Error('المركبة غير متاحة للقيادة التجريبية')
    }

    return vehicle
  }

  private async checkTestDriveConflicts(vehicleId: string, date: Date, timeSlot: string) {
    const conflictingBooking = await db.testDriveBooking.findFirst({
      where: {
        vehicleId,
        date,
        timeSlot,
        status: {
          in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
        }
      }
    })

    if (conflictingBooking) {
      throw new Error('يوجد حجز آخر في نفس الوقت لهذه المركبة')
    }
  }

  private async checkServiceConflicts(serviceTypeIds: string[], date: Date, timeSlot: string) {
    for (const serviceTypeId of serviceTypeIds) {
      const conflictingBookings = await db.serviceBooking.count({
        where: {
          serviceTypeId,
          date,
          timeSlot,
          status: {
            in: [BookingStatus.PENDING, BookingStatus.CONFIRMED]
          }
        }
      })

      if (conflictingBookings >= this.config.maxConcurrentBookings) {
        throw new Error('تم الوصول إلى الحد الأقصى للحجوزات للخدمة المطلوبة في هذا الوقت')
      }
    }
  }

  private async validateServiceTypes(serviceTypeIds: string[]) {
    const serviceTypes = await db.serviceType.findMany({
      where: {
        id: { in: serviceTypeIds },
        isActive: true
      }
    })

    if (serviceTypes.length !== serviceTypeIds.length) {
      throw new Error('بعض أنواع الخدمات غير موجودة أو غير نشطة')
    }

    return serviceTypes
  }

  private async findOrCreateCustomer(customerInfo: {
    name: string
    email: string
    phone: string
    licenseNumber?: string
  }) {
    let customer = await db.user.findUnique({
      where: { email: customerInfo.email }
    })

    if (!customer) {
      customer = await db.user.create({
        data: {
          email: customerInfo.email,
          name: customerInfo.name,
          phone: customerInfo.phone,
          role: UserRole.CUSTOMER
        }
      })
    } else {
      // Update customer info if needed
      customer = await db.user.update({
        where: { id: customer.id },
        data: {
          name: customerInfo.name,
          phone: customerInfo.phone
        }
      })
    }

    return customer
  }

  private buildServiceNotes(message?: string, vehicleInfo?: {
    licensePlate?: string
    vin?: string
    mileage?: number
  }, urgency?: string): string {
    const notes = []
    
    if (message) {
      notes.push(message)
    }
    
    if (vehicleInfo) {
      const vehicleNotes = []
      if (vehicleInfo.licensePlate) vehicleNotes.push(`لوحة المركبة: ${vehicleInfo.licensePlate}`)
      if (vehicleInfo.vin) vehicleNotes.push(`VIN: ${vehicleInfo.vin}`)
      if (vehicleInfo.mileage) vehicleNotes.push(`المسافة: ${vehicleInfo.mileage} كم`)
      
      if (vehicleNotes.length > 0) {
        notes.push(`معلومات المركبة:\n${vehicleNotes.join('\n')}`)
      }
    }
    
    if (urgency && urgency !== 'LOW') {
      notes.push(`الأولوية: ${urgency}`)
    }
    
    return notes.join('\n\n')
  }

  private generateTimeSlots(date: Date): string[] {
    const slots: string[] = []
    const { start, end } = this.config.workingHours
    
    if (isWeekend(date)) {
      return slots // No slots on weekends
    }
    
    const [startHour, startMinute] = start.split(':').map(Number)
    const [endHour, endMinute] = end.split(':').map(Number)
    
    let currentHour = startHour
    let currentMinute = startMinute
    
    while (currentHour < endHour || (currentHour === endHour && currentMinute < endMinute)) {
      const timeSlot = `${currentHour.toString().padStart(2, '0')}:${currentMinute.toString().padStart(2, '0')}`
      slots.push(timeSlot)
      
      // Add 30 minutes for next slot
      currentMinute += 30
      if (currentMinute >= 60) {
        currentMinute = 0
        currentHour++
      }
    }
    
    return slots
  }

  private calculateEndTime(timeSlot: string, durationMinutes: number): string {
    const [hours, minutes] = timeSlot.split(':').map(Number)
    const totalMinutes = hours * 60 + minutes + durationMinutes
    const endHours = Math.floor(totalMinutes / 60)
    const endMinutes = totalMinutes % 60
    
    return `${endHours.toString().padStart(2, '0')}:${endMinutes.toString().padStart(2, '0')}`
  }

  private async scheduleBookingReminder(bookingId: string, type: 'TEST_DRIVE' | 'SERVICE') {
    // This would integrate with a notification system
    // For now, we'll just create a notification record
    try {
      await db.notification.create({
        data: {
          type: 'BOOKING_REMINDER',
          title: 'تذكير بالحجز',
          message: `تذكير بحجز ${type === 'TEST_DRIVE' ? 'قيادة تجريبية' : 'خدمة'} قادم`,
          status: 'PENDING',
          channel: 'EMAIL',
          recipient: 'admin@elhamd-cars.com', // This would be dynamic
          metadata: {
            bookingId,
            bookingType: type
          }
        }
      })
    } catch (error) {
      console.error('Failed to schedule reminder:', error)
    }
  }
}