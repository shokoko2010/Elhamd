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

// Mock TestDriveBookingService
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

// Mock ServiceBookingService
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