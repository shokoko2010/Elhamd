// API-based services for booking management
import { BookingStatus } from '@prisma/client'
import { db } from '@/lib/db'

// Re-export BookingStatus from Prisma for consistency
export { BookingStatus } from '@prisma/client'

export interface TestDriveBooking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleName: string
  vehicleMake: string
  vehicleModel: string
  date: Date
  timeSlot: string
  status: BookingStatus
  notes?: string
  createdAt: Date
}

export interface ServiceBooking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  serviceName: string
  serviceCategory: string
  vehicleName?: string
  vehicleMake?: string
  vehicleModel?: string
  date: Date
  timeSlot: string
  status: BookingStatus
  notes?: string
  totalPrice?: number
  paymentStatus: string
  createdAt: Date
}

export interface CustomerInfo {
  name: string
  email: string
  phone: string
  licenseNumber?: string
}

export interface Vehicle {
  id: string
  make: string
  model: string
  year: number
}

export interface ServiceType {
  id: string
  name: string
  category: string
  duration: number
  price: number
}

export interface Booking {
  id: string
  date: Date
  timeSlot: string
  status: BookingStatus
  paymentStatus: 'PENDING' | 'PAID' | 'REFUNDED'
  totalPrice: number
  customer: CustomerInfo
  vehicle?: Vehicle
  serviceType: ServiceType
}

export interface CreateServiceBookingResult {
  bookings: Booking[]
  totalPrice: number
}

// Main BookingService class
export class BookingService {
  private static instance: BookingService

  private constructor() { }

  static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService()
    }
    return BookingService.instance
  }

  // Service availability methods
  async getServiceAvailability(serviceTypeIds: string[], date: Date): Promise<any[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Get all defined time slots
    let timeSlots = await db.timeSlot.findMany({
      where: { isActive: true },
      orderBy: { startTime: 'asc' }
    })

    if (timeSlots.length === 0) {
      // Auto-seed default business hours (Sat-Thu, 9 AM - 5 PM)
      const slots = []
      const workDays = [0, 1, 2, 3, 4, 6] // Sun, Mon, Tue, Wed, Thu, Sat

      for (const day of workDays) {
        for (let hour = 9; hour < 17; hour++) {
          const startTime = `${hour.toString().padStart(2, '0')}:00`
          const endTime = `${(hour + 1).toString().padStart(2, '0')}:00`

          slots.push({
            dayOfWeek: day,
            startTime,
            endTime,
            maxBookings: 2, // Allow 2 concurrent bookings
            isActive: true
          })
        }
      }

      try {
        await db.timeSlot.createMany({ data: slots })

        // Re-fetch after seeding
        timeSlots = await db.timeSlot.findMany({
          where: { isActive: true },
          orderBy: { startTime: 'asc' }
        })
      } catch (error) {
        console.error('Failed to auto-seed time slots:', error)
        // Continue with empty slots to avoid crash, though booking won't work
      }
    }

    if (timeSlots.length === 0) {
      // Fallback if still empty
      return []
    }

    // Get existing bookings
    const existingBookings = await db.serviceBooking.findMany({
      where: {
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: BookingStatus.CANCELLED
        }
      }
    })

    // Map slots to availability
    return timeSlots.map(slot => {
      const bookingsForSlot = existingBookings.filter(b => b.timeSlot === slot.startTime)
      return {
        id: slot.id,
        time: slot.startTime,
        available: bookingsForSlot.length < slot.maxBookings
      }
    })
  }

  // Service booking methods
  async createServiceBooking(data: {
    vehicleId?: string
    serviceTypeIds: string[]
    date: Date
    timeSlot: string
    customerInfo: CustomerInfo
    message?: string
    urgency?: string
  }): Promise<CreateServiceBookingResult> {
    // Determine vehicle
    let vehicleId = data.vehicleId

    // If customer doesn't exist, create partial user or use guest logic? 
    // consistently use existing or create new. For now, find user by email
    let user = await db.user.findUnique({
      where: { email: data.customerInfo.email }
    })

    if (!user) {
      // Create guest/lead user
      user = await db.user.create({
        data: {
          email: data.customerInfo.email,
          name: data.customerInfo.name,
          phone: data.customerInfo.phone,
          password: '', // No password for auto-created
          role: 'CUSTOMER'
        }
      })
    }

    // Create the booking
    const booking = await db.serviceBooking.create({
      data: {
        customerId: user.id,
        vehicleId: vehicleId,
        serviceTypeId: data.serviceTypeIds[0], // Assuming single service for now
        date: data.date,
        timeSlot: data.timeSlot,
        status: BookingStatus.PENDING,
        notes: data.message
      },
      include: {
        serviceType: true,
        vehicle: true,
        customer: {
          select: { name: true, email: true, phone: true }
        }
      }
    })

    // Map to Booking interface
    // ... logic to return CreateServiceBookingResult ...
    const resultBooking: Booking = {
      id: booking.id,
      date: booking.date,
      timeSlot: booking.timeSlot,
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      totalPrice: booking.serviceType.price || 0,
      customer: {
        name: booking.customer.name || '',
        email: booking.customer.email,
        phone: booking.customer.phone || ''
      },
      vehicle: booking.vehicle ? {
        id: booking.vehicle.id,
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year
      } : undefined,
      serviceType: {
        id: booking.serviceType.id,
        name: booking.serviceType.name,
        category: booking.serviceType.category,
        duration: booking.serviceType.duration,
        price: booking.serviceType.price || 0
      }
    }

    return {
      bookings: [resultBooking],
      totalPrice: resultBooking.totalPrice
    }
  }

  // Test drive availability methods
  async getTestDriveAvailability(vehicleId: string, date: Date): Promise<any[]> {
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    // Generate standard slots (e.g. 9 AM to 5 PM)
    const slots = []
    for (let i = 9; i <= 17; i++) {
      slots.push(`${i.toString().padStart(2, '0')}:00`)
    }

    // Get existing bookings for this vehicle
    const existingBookings = await db.testDriveBooking.findMany({
      where: {
        vehicleId: vehicleId,
        date: {
          gte: startOfDay,
          lte: endOfDay
        },
        status: {
          not: BookingStatus.CANCELLED
        }
      }
    })

    // Return objects { time: string, available: boolean }
    return slots.map(time => {
      const isBooked = existingBookings.some(b => b.timeSlot === time)
      return {
        time,
        available: !isBooked
      }
    })
  }

  // Test drive booking methods
  async createTestDriveBooking(data: {
    vehicleId: string
    date: Date
    timeSlot: string
    customerInfo: CustomerInfo
    message?: string
  }): Promise<Booking> {
    // Mock implementation
    const mockVehicle: Vehicle = {
      id: data.vehicleId,
      make: 'Toyota',
      model: 'Camry',
      year: 2022
    }

    const mockServiceType: ServiceType = {
      id: 'test-drive',
      name: 'تجربة قيادة',
      category: 'تجربة',
      duration: 60,
      price: 0
    }

    const booking: Booking = {
      id: `test_drive_${Date.now()}`,
      date: data.date,
      timeSlot: data.timeSlot,
      status: BookingStatus.PENDING,
      paymentStatus: 'PENDING',
      totalPrice: 0,
      customer: data.customerInfo,
      vehicle: mockVehicle,
      serviceType: mockServiceType
    }

    return booking
  }
}

// API-based TestDriveBookingService
export const TestDriveBookingService = {
  async getAllBookings(): Promise<TestDriveBooking[]> {
    try {
      const response = await fetch('/api/admin/test-drive-bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return data.map((booking: any) => ({
        ...booking,
        date: new Date(booking.date),
        createdAt: new Date(booking.createdAt)
      }))
    } catch (error) {
      console.error('Error fetching test drive bookings:', error)
      throw error
    }
  },

  async getUserBookings(userId: string): Promise<TestDriveBooking[]> {
    // For now, return all bookings since we don't have user-specific API
    return this.getAllBookings()
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    try {
      const response = await fetch('/api/admin/test-drive-bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

    } catch (error) {
      console.error('Error updating test drive booking status:', error)
      throw error
    }
  },

  async createBooking(data: {
    customerId: string
    vehicleId: string
    date: Date
    timeSlot: string
    notes?: string
  }): Promise<string> {
    // This would need a POST endpoint - for now return mock ID
    return 'mock-booking-id'
  }
}

// API-based ServiceBookingService
export const ServiceBookingService = {
  async getAllBookings(): Promise<ServiceBooking[]> {
    try {
      const response = await fetch('/api/admin/service-bookings', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()

      return data.map((booking: any) => ({
        ...booking,
        date: new Date(booking.date),
        createdAt: new Date(booking.createdAt)
      }))
    } catch (error) {
      console.error('Error fetching service bookings:', error)
      throw error
    }
  },

  async getUserBookings(userId: string): Promise<ServiceBooking[]> {
    // For now, return all bookings since we don't have user-specific API
    return this.getAllBookings()
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    try {
      const response = await fetch('/api/admin/service-bookings', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          bookingId,
          status
        }),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

    } catch (error) {
      console.error('Error updating service booking status:', error)
      throw error
    }
  },

  async createBooking(data: {
    customerId: string
    serviceTypeId: string
    vehicleId?: string
    date: Date
    timeSlot: string
    notes?: string
    totalPrice?: number
  }): Promise<string> {
    // This would need a POST endpoint - for now return mock ID
    return 'mock-booking-id'
  }
}