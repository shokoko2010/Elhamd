import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { BookingStatus, UserRole } from '@prisma/client'

type Preferences = Record<string, unknown> | null | undefined

type ProfileResponse = {
  id: string
  name: string
  email: string
  phone: string
  address: string
  licenseNumber?: string
  joinDate: string
  totalBookings: number
  completedBookings: number
  favoriteVehicleType?: string
}

function extractPreference(preferences: Preferences, key: string): string | undefined {
  if (!preferences || typeof preferences !== 'object') {
    return undefined
  }

  const value = preferences[key]
  return typeof value === 'string' ? value : undefined
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

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      include: {
        customerProfile: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    const [
      totalServiceBookings,
      totalTestDriveBookings,
      completedServiceBookings,
      completedTestDriveBookings,
      recentServiceBookings,
      recentTestDriveBookings
    ] = await Promise.all([
      db.serviceBooking.count({ where: { customerId: user.id } }),
      db.testDriveBooking.count({ where: { customerId: user.id } }),
      db.serviceBooking.count({ where: { customerId: user.id, status: BookingStatus.COMPLETED } }),
      db.testDriveBooking.count({ where: { customerId: user.id, status: BookingStatus.COMPLETED } }),
      db.serviceBooking.findMany({
        where: { customerId: user.id },
        include: { vehicle: { select: { category: true } } },
        orderBy: { date: 'desc' },
        take: 25
      }),
      db.testDriveBooking.findMany({
        where: { customerId: user.id },
        include: { vehicle: { select: { category: true } } },
        orderBy: { date: 'desc' },
        take: 25
      })
    ])

    const totalBookings = totalServiceBookings + totalTestDriveBookings
    const completedBookings = completedServiceBookings + completedTestDriveBookings

    const preferenceCounts = new Map<string, number>()

    for (const booking of [...recentServiceBookings, ...recentTestDriveBookings]) {
      const category = booking.vehicle?.category
      if (!category) continue
      preferenceCounts.set(category, (preferenceCounts.get(category) ?? 0) + 1)
    }

    let favoriteVehicleType: string | undefined
    if (preferenceCounts.size > 0) {
      favoriteVehicleType = Array.from(preferenceCounts.entries()).sort((a, b) => b[1] - a[1])[0]?.[0]
    }

    const preferences = user.customerProfile?.preferences as Preferences
    const address = extractPreference(preferences, 'address') ?? 'غير متوفر'
    const licenseNumber = extractPreference(preferences, 'licenseNumber')

    const profile: ProfileResponse = {
      id: user.customerProfile?.id ?? user.id,
      name: user.name ?? 'عميل',
      email: user.email,
      phone: user.phone ?? '',
      address,
      licenseNumber,
      joinDate: user.createdAt.toISOString(),
      totalBookings,
      completedBookings,
      favoriteVehicleType
    }

    return NextResponse.json({ profile })
  } catch (error) {
    console.error('Error fetching customer profile:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب ملف العميل' },
      { status: 500 }
    )
  }
}
