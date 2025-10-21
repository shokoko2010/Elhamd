import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { BookingStatus } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Create sample test drive bookings
    const testDriveBookings = await Promise.all([
      db.testDriveBooking.create({
        data: {
          customerId: 'sample-customer-1',
          vehicleId: 'sample-vehicle-1',
          date: new Date('2024-01-20'),
          timeSlot: '14:00',
          status: BookingStatus.PENDING,
          notes: 'Interested in automatic transmission'
        }
      }),
      db.testDriveBooking.create({
        data: {
          customerId: 'sample-customer-2',
          vehicleId: 'sample-vehicle-2',
          date: new Date('2024-01-21'),
          timeSlot: '10:00',
          status: BookingStatus.CONFIRMED,
          notes: 'Test drive for family car'
        }
      })
    ])

    // Create sample service bookings
    const serviceBookings = await Promise.all([
      db.serviceBooking.create({
        data: {
          customerId: 'sample-customer-3',
          serviceTypeId: 'sample-service-1',
          vehicleId: 'sample-vehicle-3',
          date: new Date('2024-01-22'),
          timeSlot: '09:00',
          status: BookingStatus.PENDING,
          notes: 'Regular maintenance check',
          totalPrice: 200,
          paymentStatus: 'PENDING'
        }
      }),
      db.serviceBooking.create({
        data: {
          customerId: 'sample-customer-4',
          serviceTypeId: 'sample-service-2',
          vehicleId: 'sample-vehicle-4',
          date: new Date('2024-01-23'),
          timeSlot: '11:00',
          status: BookingStatus.COMPLETED,
          notes: 'Oil change and filter replacement',
          totalPrice: 150,
          paymentStatus: 'PAID'
        }
      })
    ])

    return NextResponse.json({
      message: 'Test data created successfully',
      testDriveBookings: testDriveBookings.length,
      serviceBookings: serviceBookings.length
    })
  } catch (error) {
    console.error('Error creating test data:', error)
    return NextResponse.json(
      { error: 'Failed to create test data' },
      { status: 500 }
    )
  }
}