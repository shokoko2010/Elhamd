// Real database services for booking management using Prisma
import { db } from '@/lib/db'
import { BookingStatus, Prisma } from '@prisma/client'

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

  private constructor() {}

  static getInstance(): BookingService {
    if (!BookingService.instance) {
      BookingService.instance = new BookingService()
    }
    return BookingService.instance
  }

  // Service availability methods
  async getServiceAvailability(serviceTypeIds: string[], date: Date): Promise<string[]> {
    // Mock implementation - in real app, this would check database
    const allTimeSlots = [
      '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'
    ]
    
    // For demo purposes, return some available time slots
    return allTimeSlots.slice(0, 5)
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
    // Mock implementation
    const mockServiceType: ServiceType = {
      id: data.serviceTypeIds[0],
      name: 'صيانة شاملة',
      category: 'صيانة',
      duration: 120,
      price: 200
    }

    const mockVehicle: Vehicle | undefined = data.vehicleId ? {
      id: data.vehicleId,
      make: 'Toyota',
      model: 'Camry',
      year: 2022
    } : undefined

    const booking: Booking = {
      id: `booking_${Date.now()}`,
      date: data.date,
      timeSlot: data.timeSlot,
      status: BookingStatus.PENDING,
      paymentStatus: 'PENDING',
      totalPrice: mockServiceType.price,
      customer: data.customerInfo,
      vehicle: mockVehicle,
      serviceType: mockServiceType
    }

    return {
      bookings: [booking],
      totalPrice: mockServiceType.price
    }
  }

  // Test drive availability methods
  async getTestDriveAvailability(vehicleId: string, date: Date): Promise<string[]> {
    // Mock implementation
    const allTimeSlots = [
      '09:00', '10:00', '11:00', '12:00', '14:00', '15:00', '16:00', '17:00'
    ]
    
    return allTimeSlots.slice(0, 4)
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

// Real TestDriveBookingService using Prisma
export const TestDriveBookingService = {
  async getAllBookings(): Promise<TestDriveBooking[]> {
    try {
      const bookings = await db.testDriveBooking.findMany({
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          },
          vehicle: {
            select: {
              make: true,
              model: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })

      return bookings.map(booking => ({
        id: booking.id,
        customerName: booking.customer.name || 'Unknown',
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone || '',
        vehicleName: `${booking.vehicle.make} ${booking.vehicle.model}`,
        vehicleMake: booking.vehicle.make,
        vehicleModel: booking.vehicle.model,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt
      }))
    } catch (error) {
      console.error('Error fetching test drive bookings:', error)
      throw error
    }
  },

  async getUserBookings(userId: string): Promise<TestDriveBooking[]> {
    try {
      const bookings = await db.testDriveBooking.findMany({
        where: {
          customerId: userId
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          },
          vehicle: {
            select: {
              make: true,
              model: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })

      return bookings.map(booking => ({
        id: booking.id,
        customerName: booking.customer.name || 'Unknown',
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone || '',
        vehicleName: `${booking.vehicle.make} ${booking.vehicle.model}`,
        vehicleMake: booking.vehicle.make,
        vehicleModel: booking.vehicle.model,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        notes: booking.notes,
        createdAt: booking.createdAt
      }))
    } catch (error) {
      console.error('Error fetching user test drive bookings:', error)
      throw error
    }
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    try {
      await db.testDriveBooking.update({
        where: {
          id: bookingId
        },
        data: {
          status,
          updatedAt: new Date()
        }
      })
      console.log(`Updated test drive booking ${bookingId} to status: ${status}`)
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
    try {
      const booking = await db.testDriveBooking.create({
        data: {
          customerId: data.customerId,
          vehicleId: data.vehicleId,
          date: data.date,
          timeSlot: data.timeSlot,
          notes: data.notes,
          status: BookingStatus.PENDING
        }
      })
      console.log('Created new test drive booking:', booking.id)
      return booking.id
    } catch (error) {
      console.error('Error creating test drive booking:', error)
      throw error
    }
  }
}

// Real ServiceBookingService using Prisma
export const ServiceBookingService = {
  async getAllBookings(): Promise<ServiceBooking[]> {
    try {
      const bookings = await db.serviceBooking.findMany({
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          },
          serviceType: {
            select: {
              name: true,
              category: true
            }
          },
          vehicle: {
            select: {
              make: true,
              model: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })

      return bookings.map(booking => ({
        id: booking.id,
        customerName: booking.customer.name || 'Unknown',
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone || '',
        serviceName: booking.serviceType.name,
        serviceCategory: booking.serviceType.category,
        vehicleName: booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : undefined,
        vehicleMake: booking.vehicle?.make,
        vehicleModel: booking.vehicle?.model,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        notes: booking.notes,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt
      }))
    } catch (error) {
      console.error('Error fetching service bookings:', error)
      throw error
    }
  },

  async getUserBookings(userId: string): Promise<ServiceBooking[]> {
    try {
      const bookings = await db.serviceBooking.findMany({
        where: {
          customerId: userId
        },
        include: {
          customer: {
            select: {
              name: true,
              email: true,
              phone: true
            }
          },
          serviceType: {
            select: {
              name: true,
              category: true
            }
          },
          vehicle: {
            select: {
              make: true,
              model: true
            }
          }
        },
        orderBy: {
          date: 'desc'
        }
      })

      return bookings.map(booking => ({
        id: booking.id,
        customerName: booking.customer.name || 'Unknown',
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone || '',
        serviceName: booking.serviceType.name,
        serviceCategory: booking.serviceType.category,
        vehicleName: booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : undefined,
        vehicleMake: booking.vehicle?.make,
        vehicleModel: booking.vehicle?.model,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        notes: booking.notes,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt
      }))
    } catch (error) {
      console.error('Error fetching user service bookings:', error)
      throw error
    }
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    try {
      await db.serviceBooking.update({
        where: {
          id: bookingId
        },
        data: {
          status,
          updatedAt: new Date()
        }
      })
      console.log(`Updated service booking ${bookingId} to status: ${status}`)
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
    try {
      const booking = await db.serviceBooking.create({
        data: {
          customerId: data.customerId,
          serviceTypeId: data.serviceTypeId,
          vehicleId: data.vehicleId,
          date: data.date,
          timeSlot: data.timeSlot,
          notes: data.notes,
          totalPrice: data.totalPrice,
          status: BookingStatus.PENDING,
          paymentStatus: 'PENDING'
        }
      })
      console.log('Created new service booking:', booking.id)
      return booking.id
    } catch (error) {
      console.error('Error creating service booking:', error)
      throw error
    }
  }
}