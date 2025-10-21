// API-based services for booking management
import { BookingStatus } from '@prisma/client'

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
    // This would need a POST endpoint - for now return mock ID
    console.log('Creating new test drive booking:', data)
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
    // This would need a POST endpoint - for now return mock ID
    console.log('Creating new service booking:', data)
    return 'mock-booking-id'
  }
}