import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user is staff or admin
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || !['STAFF', 'ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get today's date
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    // Get today's test drive bookings
    const testDriveBookings = await db.testDriveBooking.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
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
            model: true,
            year: true
          }
        }
      },
      orderBy: { timeSlot: 'asc' }
    })

    // Get today's service bookings
    const serviceBookings = await db.serviceBooking.findMany({
      where: {
        date: {
          gte: today,
          lt: tomorrow
        }
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
            model: true,
            year: true
          }
        },
        serviceType: {
          select: {
            name: true
          }
        }
      },
      orderBy: { timeSlot: 'asc' }
    })

    // Combine and format appointments
    const appointments = [
      ...testDriveBookings.map(booking => ({
        id: booking.id,
        type: 'test_drive' as const,
        customerName: booking.customer.name,
        customerPhone: booking.customer.phone || '',
        customerEmail: booking.customer.email,
        vehicle: booking.vehicle,
        date: booking.date.toISOString(),
        timeSlot: booking.timeSlot,
        status: booking.status,
        notes: booking.notes
      })),
      ...serviceBookings.map(booking => ({
        id: booking.id,
        type: 'service' as const,
        customerName: booking.customer.name,
        customerPhone: booking.customer.phone || '',
        customerEmail: booking.customer.email,
        vehicle: booking.vehicle,
        serviceType: booking.serviceType,
        date: booking.date.toISOString(),
        timeSlot: booking.timeSlot,
        status: booking.status,
        notes: booking.notes
      }))
    ].sort((a, b) => a.timeSlot.localeCompare(b.timeSlot))

    return NextResponse.json(appointments)
  } catch (error) {
    console.error('Error fetching employee appointments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}