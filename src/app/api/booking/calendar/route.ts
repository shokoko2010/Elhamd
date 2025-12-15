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
    // Get time slots
    let timeSlots = await db.timeSlot.findMany({
      where: { isActive: true },
      orderBy: { dayOfWeek: 'asc' }
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
          orderBy: { dayOfWeek: 'asc' }
        })
      } catch (error) {
        console.error('Failed to auto-seed time slots:', error)
      }
    }

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
      include: {
        serviceType: true,
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true
          }
        }
      },
      orderBy: [
        { date: 'asc' },
        { timeSlot: 'asc' }
      ]
    })

    return NextResponse.json({
      timeSlots,
      holidays,
      bookings
    })
  } catch (error) {
    console.error('Error fetching calendar data:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات التقويم' },
      { status: 500 }
    )
  }
}