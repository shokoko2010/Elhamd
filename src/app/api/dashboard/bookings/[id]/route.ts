import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const bookingId = params.id
    const userId = session.user.id

    // Try to find test drive booking first
    let booking = await db.testDriveBooking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        }
      }
    })

    if (booking && booking.customerId === userId) {
      // Format test drive booking
      const formattedBooking = {
        id: booking.id,
        type: 'test_drive' as const,
        status: booking.status,
        date: booking.date.toISOString(),
        timeSlot: booking.timeSlot,
        notes: booking.notes,
        totalPrice: 0,
        paymentStatus: null,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        customer: booking.customer,
        vehicle: booking.vehicle ? {
          id: booking.vehicle.id,
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          year: booking.vehicle.year,
          stockNumber: booking.vehicle.stockNumber,
          vin: booking.vehicle.vin,
          color: booking.vehicle.color,
          mileage: booking.vehicle.mileage,
          images: booking.vehicle.images
        } : undefined,
        serviceType: undefined,
        payments: []
      }

      return NextResponse.json(formattedBooking)
    }

    // If not test drive, try service booking
    booking = await db.serviceBooking.findUnique({
      where: { id: bookingId },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        vehicle: {
          include: {
            images: {
              where: { isPrimary: true },
              take: 1
            }
          }
        },
        serviceType: true,
        payments: {
          orderBy: { createdAt: 'desc' }
        }
      }
    })

    if (booking && booking.customerId === userId) {
      // Format service booking
      const formattedBooking = {
        id: booking.id,
        type: 'service' as const,
        status: booking.status,
        date: booking.date.toISOString(),
        timeSlot: booking.timeSlot,
        notes: booking.notes,
        totalPrice: booking.totalPrice,
        paymentStatus: booking.paymentStatus,
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString(),
        customer: booking.customer,
        vehicle: booking.vehicle ? {
          id: booking.vehicle.id,
          make: booking.vehicle.make,
          model: booking.vehicle.model,
          year: booking.vehicle.year,
          stockNumber: booking.vehicle.stockNumber,
          vin: booking.vehicle.vin,
          color: booking.vehicle.color,
          mileage: booking.vehicle.mileage,
          images: booking.vehicle.images
        } : undefined,
        serviceType: booking.serviceType ? {
          id: booking.serviceType.id,
          name: booking.serviceType.name,
          description: booking.serviceType.description,
          duration: booking.serviceType.duration,
          price: booking.serviceType.price,
          category: booking.serviceType.category
        } : undefined,
        payments: booking.payments.map(payment => ({
          id: payment.id,
          amount: payment.amount,
          status: payment.status,
          paymentMethod: payment.paymentMethod,
          transactionId: payment.transactionId,
          createdAt: payment.createdAt.toISOString()
        }))
      }

      return NextResponse.json(formattedBooking)
    }

    // If no booking found or doesn't belong to user
    return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
  } catch (error) {
    console.error('Error fetching booking details:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}