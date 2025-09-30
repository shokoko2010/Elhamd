// Firestore services for booking management

export enum BookingStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
  NO_SHOW = 'no-show'
}

export interface TestDriveBooking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleName: string
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
  date: Date
  timeSlot: string
  status: BookingStatus
  notes?: string
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

// Mock TestDriveBookingService (deprecated - use BookingService instead)
export const TestDriveBookingService = {
  async getUserBookings(userId: string): Promise<TestDriveBooking[]> {
    // In a real implementation, this would fetch from Firestore
    // For now, return empty array as the page uses mock data
    return []
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    // In a real implementation, this would update the booking in Firestore
    console.log(`Updating test drive booking ${bookingId} to status: ${status}`)
  },

  async createBooking(booking: Omit<TestDriveBooking, 'id' | 'createdAt'>): Promise<string> {
    // In a real implementation, this would create a new booking in Firestore
    console.log('Creating new test drive booking:', booking)
    return 'mock-booking-id'
  }
}

// Mock ServiceBookingService (deprecated - use BookingService instead)
export const ServiceBookingService = {
  async getUserBookings(userId: string): Promise<ServiceBooking[]> {
    // In a real implementation, this would fetch from Firestore
    // For now, return empty array as the page uses mock data
    return []
  },

  async updateBookingStatus(bookingId: string, status: BookingStatus): Promise<void> {
    // In a real implementation, this would update the booking in Firestore
    console.log(`Updating service booking ${bookingId} to status: ${status}`)
  },

  async createBooking(booking: Omit<ServiceBooking, 'id' | 'createdAt'>): Promise<string> {
    // In a real implementation, this would create a new booking in Firestore
    console.log('Creating new service booking:', booking)
    return 'mock-booking-id'
  }
}