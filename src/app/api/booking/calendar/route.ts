interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Get time slots
    const timeSlots = await db.timeSlot.findMany({
      where: { isActive: true },
      orderBy: { dayOfWeek: 'asc' }
    })

    // Get holidays
    const holidays = await db.holiday.findMany({
      where: {
        date: {
          gte: startDate ? new Date(startDate) : new Date(),
          lte: endDate ? new Date(endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        }
      },
      orderBy: { date: 'asc' }
    })

    // Get service bookings
    const bookings = await db.serviceBooking.findMany({
      where: {
        date: {
          gte: startDate ? new Date(startDate) : new Date(),
          lte: endDate ? new Date(endDate) : new Date(new Date().setFullYear(new Date().getFullYear() + 1))
        },
        status: {
          in: ['PENDING', 'CONFIRMED']
        }
      },
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' }
      ]
    })

    // Get related data for bookings
    const bookingsWithRelations = await Promise.all(
      bookings.map(async (booking) => {
        const [serviceType, customer, vehicle] = await Promise.all([
          db.serviceType.findUnique({
            where: { id: booking.serviceTypeId }
          }),
          db.user.findUnique({
            where: { id: booking.customerId },
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }),
          booking.vehicleId ? db.vehicle.findUnique({
            where: { id: booking.vehicleId },
            select: {
              id: true,
              make: true,
              model: true,
              year: true
            }
          }) : null
        ])

        return {
          ...booking,
          serviceType,
          customer,
          vehicle
        }
      })
    )

    return NextResponse.json({
      timeSlots,
      holidays,
      bookings: bookingsWithRelations
    })
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات التقويم' },
      { status: 500 }
    )
  }
}