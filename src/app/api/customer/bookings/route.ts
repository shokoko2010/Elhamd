import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { BookingStatus, UserRole } from '@prisma/client'

type CustomerBooking = {
  id: string
  type: 'test-drive' | 'service'
  vehicleName: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no-show'
  location?: string
  notes?: string | null
}

function normalizeStatus(status: BookingStatus): CustomerBooking['status'] {
  switch (status) {
    case BookingStatus.CONFIRMED:
      return 'confirmed'
    case BookingStatus.COMPLETED:
      return 'completed'
    case BookingStatus.CANCELLED:
      return 'cancelled'
    case BookingStatus.NO_SHOW:
      return 'no-show'
    default:
      return 'pending'
  }
}

function formatVehicleName(vehicle?: { make: string; model: string }): string {
  if (!vehicle) {
    return 'مركبة غير محددة'
  }

  return `${vehicle.make} ${vehicle.model}`.trim()
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    if (session.user.role !== UserRole.CUSTOMER) {
      return NextResponse.json({ error: 'هذه البيانات متاحة للعملاء فقط' }, { status: 403 })
    }

    const [testDriveBookings, serviceBookings] = await Promise.all([
      db.testDriveBooking.findMany({
        where: { customerId: session.user.id },
        include: {
          vehicle: {
            select: {
              make: true,
              model: true,
              branch: { select: { name: true } }
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 20
      }),
      db.serviceBooking.findMany({
        where: { customerId: session.user.id },
        include: {
          vehicle: {
            select: {
              make: true,
              model: true,
              branch: { select: { name: true } }
            }
          },
          serviceType: { select: { name: true } }
        },
        orderBy: { date: 'desc' },
        take: 20
      })
    ])

    const bookings: CustomerBooking[] = [
      ...testDriveBookings.map(booking => ({
        id: booking.id,
        type: 'test-drive' as const,
        vehicleName: formatVehicleName(booking.vehicle ?? undefined),
        date: booking.date.toISOString(),
        time: booking.timeSlot,
        status: normalizeStatus(booking.status),
        location: booking.vehicle?.branch?.name ?? undefined,
        notes: booking.notes
      })),
      ...serviceBookings.map(booking => ({
        id: booking.id,
        type: 'service' as const,
        vehicleName: formatVehicleName(booking.vehicle ?? undefined),
        date: booking.date.toISOString(),
        time: booking.timeSlot,
        status: normalizeStatus(booking.status),
        location: booking.vehicle?.branch?.name ?? booking.serviceType?.name,
        notes: booking.notes
      }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Error fetching customer bookings:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب حجوزات العميل' },
      { status: 500 }
    )
  }
}
