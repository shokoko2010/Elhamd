import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { BookingStatus, UserRole, VehicleStatus } from '@prisma/client'

type AggregatedVehicle = {
  id: string
  make: string
  model: string
  year: number | null
  licensePlate: string
  status: VehicleStatus
  lastService?: string
  nextService?: string
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

    const [serviceBookings, testDriveBookings] = await Promise.all([
      db.serviceBooking.findMany({
        where: { customerId: session.user.id },
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              vin: true,
              stockNumber: true,
              status: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 50
      }),
      db.testDriveBooking.findMany({
        where: { customerId: session.user.id },
        include: {
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              vin: true,
              stockNumber: true,
              status: true
            }
          }
        },
        orderBy: { date: 'desc' },
        take: 50
      })
    ])

    type VehicleAccumulator = AggregatedVehicle & { _lastServiceDate?: Date; _nextServiceDate?: Date }
    const vehicles = new Map<string, VehicleAccumulator>()
    const now = new Date()

    const ensureVehicle = (
      vehicleId: AggregatedVehicle['id'],
      data: Omit<AggregatedVehicle, 'lastService' | 'nextService'>
    ): VehicleAccumulator => {
      const existing = vehicles.get(vehicleId)
      if (existing) {
        return existing
      }

      const entry: VehicleAccumulator = { ...data }
      vehicles.set(vehicleId, entry)
      return entry
    }

    for (const booking of serviceBookings) {
      if (!booking.vehicle) continue

      const licensePlate = booking.vehicle.vin || booking.vehicle.stockNumber || 'غير متوفر'
      const entry = ensureVehicle(booking.vehicle.id, {
        id: booking.vehicle.id,
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
        licensePlate,
        status: booking.vehicle.status
      })

      if (booking.status === BookingStatus.COMPLETED) {
        if (!entry._lastServiceDate || booking.date > entry._lastServiceDate) {
          entry._lastServiceDate = booking.date
          entry.lastService = booking.date.toISOString()
        }
      }

      if (booking.status === BookingStatus.CONFIRMED || booking.status === BookingStatus.PENDING) {
        if ((!entry._nextServiceDate || booking.date < entry._nextServiceDate) && booking.date > now) {
          entry._nextServiceDate = booking.date
          entry.nextService = booking.date.toISOString()
        }
      }
    }

    for (const booking of testDriveBookings) {
      if (!booking.vehicle) continue

      const licensePlate = booking.vehicle.vin || booking.vehicle.stockNumber || 'غير متوفر'
      const entry = ensureVehicle(booking.vehicle.id, {
        id: booking.vehicle.id,
        make: booking.vehicle.make,
        model: booking.vehicle.model,
        year: booking.vehicle.year,
        licensePlate,
        status: booking.vehicle.status
      })

      if (!entry.lastService && booking.status === BookingStatus.COMPLETED) {
        entry.lastService = booking.date.toISOString()
      }
    }

    const response = Array.from(vehicles.values()).map(vehicle => ({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year ?? null,
      licensePlate: vehicle.licensePlate,
      status: vehicle.status,
      lastService: vehicle.lastService,
      nextService: vehicle.nextService
    }))

    return NextResponse.json({ vehicles: response })
  } catch (error) {
    console.error('Error fetching customer vehicles:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب مركبات العميل' },
      { status: 500 }
    )
  }
}
