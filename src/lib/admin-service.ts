import { db } from '@/lib/db'
import { BookingStatus, PaymentStatus, UserRole, VehicleStatus } from '@prisma/client'
import { startOfDay, endOfDay, startOfMonth, endOfMonth, subDays, subMonths } from 'date-fns'

export interface DashboardStats {
  totalVehicles: number
  availableVehicles: number
  soldVehicles: number
  totalCustomers: number
  todayBookings: number
  pendingBookings: number
  totalRevenue: number
  monthlyRevenue: number
  testDriveBookings: number
  serviceBookings: number
  completedBookings: number
  cancelledBookings: number
}

export interface RecentBooking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleName?: string
  serviceName?: string
  type: 'test-drive' | 'service'
  date: Date
  timeSlot: string
  status: BookingStatus
  totalPrice?: number
  paymentStatus?: PaymentStatus
}

export interface RecentVehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  status: VehicleStatus
  category: string
  createdAt: Date
  featured: boolean
  images?: Array<{ id: string; url: string; isPrimary: boolean }>
}

export interface AnalyticsData {
  bookingsByMonth: Array<{
    month: string
    testDrives: number
    services: number
    total: number
  }>
  revenueByMonth: Array<{
    month: string
    revenue: number
  }>
  popularServices: Array<{
    name: string
    count: number
    revenue: number
  }>
  vehicleSales: Array<{
    make: string
    model: string
    count: number
    revenue: number
  }>
  customerGrowth: Array<{
    month: string
    customers: number
  }>
}

export class AdminService {
  private static instance: AdminService

  private constructor() { }

  static getInstance(): AdminService {
    if (!AdminService.instance) {
      AdminService.instance = new AdminService()
    }
    return AdminService.instance
  }

  async getDashboardStats(): Promise<DashboardStats> {
    const today = new Date()
    const startOfToday = startOfDay(today)
    const endOfToday = endOfDay(today)
    const startOfMonthDate = startOfMonth(today)
    const endOfMonthDate = endOfMonth(today)

    // Vehicle stats
    const [totalVehicles, availableVehicles, soldVehicles] = await Promise.all([
      db.vehicle.count(),
      db.vehicle.count({ where: { status: VehicleStatus.AVAILABLE } }),
      db.vehicle.count({ where: { status: VehicleStatus.SOLD } })
    ])

    // Customer stats
    const totalCustomers = await db.user.count({
      where: { role: UserRole.CUSTOMER }
    })

    // Booking stats
    const [
      testDrivesToday,
      serviceToday,
      pendingTestDrives,
      pendingServices,
      totalTestDriveBookings,
      totalServiceBookings,
      completedTestDrives,
      completedServices,
      cancelledTestDrives,
      cancelledServices
    ] = await Promise.all([
      db.testDriveBooking.count({
        where: { date: { gte: startOfToday, lte: endOfToday } }
      }),
      db.serviceBooking.count({
        where: { date: { gte: startOfToday, lte: endOfToday } }
      }),
      db.testDriveBooking.count({
        where: { status: BookingStatus.PENDING }
      }),
      db.serviceBooking.count({
        where: { status: BookingStatus.PENDING }
      }),
      db.testDriveBooking.count(),
      db.serviceBooking.count(),
      db.testDriveBooking.count({
        where: { status: BookingStatus.COMPLETED }
      }),
      db.serviceBooking.count({
        where: { status: BookingStatus.COMPLETED }
      }),
      db.testDriveBooking.count({
        where: { status: BookingStatus.CANCELLED }
      }),
      db.serviceBooking.count({
        where: { status: BookingStatus.CANCELLED }
      })
    ])

    const todayBookings = testDrivesToday + serviceToday
    const pendingBookings = pendingTestDrives + pendingServices
    const testDriveBookings = totalTestDriveBookings
    const serviceBookings = totalServiceBookings
    const completedBookings = completedTestDrives + completedServices
    const cancelledBookings = cancelledTestDrives + cancelledServices

    // Revenue stats
    const monthlyRevenue = await db.payment.aggregate({
      where: {
        createdAt: { gte: startOfMonthDate, lte: endOfMonthDate },
        status: PaymentStatus.COMPLETED
      },
      _sum: { amount: true }
    })

    const totalRevenue = await db.payment.aggregate({
      where: { status: PaymentStatus.COMPLETED },
      _sum: { amount: true }
    })

    return {
      totalVehicles,
      availableVehicles,
      soldVehicles,
      totalCustomers,
      todayBookings,
      pendingBookings,
      totalRevenue: totalRevenue._sum.amount || 0,
      monthlyRevenue: monthlyRevenue._sum.amount || 0,
      testDriveBookings,
      serviceBookings,
      completedBookings,
      cancelledBookings
    }
  }

  async getRecentBookings(limit: number = 10): Promise<RecentBooking[]> {
    const testDriveBookings = await db.testDriveBooking.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { name: true, email: true, phone: true }
        },
        vehicle: {
          select: { make: true, model: true }
        }
      }
    })

    const serviceBookings = await db.serviceBooking.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        customer: {
          select: { name: true, email: true, phone: true }
        },
        vehicle: {
          select: { make: true, model: true }
        },
        serviceType: {
          select: { name: true }
        }
      }
    })

    // Combine and sort by creation date
    const allBookings: RecentBooking[] = [
      ...testDriveBookings.map(booking => ({
        id: booking.id,
        customerName: booking.customer.name,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
        vehicleName: `${booking.vehicle.make} ${booking.vehicle.model}`,
        type: 'test-drive' as const,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        totalPrice: undefined,
        paymentStatus: undefined
      })),
      ...serviceBookings.map(booking => ({
        id: booking.id,
        customerName: booking.customer.name,
        customerEmail: booking.customer.email,
        customerPhone: booking.customer.phone,
        vehicleName: booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : undefined,
        serviceName: booking.serviceType.name,
        type: 'service' as const,
        date: booking.date,
        timeSlot: booking.timeSlot,
        status: booking.status,
        totalPrice: booking.totalPrice || undefined,
        paymentStatus: booking.paymentStatus
      }))
    ].sort((a, b) => b.date.getTime() - a.date.getTime())
      .slice(0, limit)

    return allBookings
  }

  async getRecentVehicles(limit: number = 10): Promise<RecentVehicle[]> {
    return await db.vehicle.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        images: {
          where: { isPrimary: true },
          take: 1
        }
      }
    })
  }

  async getAnalyticsData(): Promise<AnalyticsData> {
    const now = new Date()
    const last6Months = Array.from({ length: 6 }, (_, i) => {
      const date = subMonths(now, 5 - i)
      return {
        month: date.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' }),
        startOfMonth: startOfMonth(date),
        endOfMonth: endOfMonth(date)
      }
    })

    // Bookings by month
    const bookingsByMonth = await Promise.all(
      last6Months.map(async ({ month, startOfMonth, endOfMonth }) => {
        const [testDrives, services] = await Promise.all([
          db.testDriveBooking.count({
            where: { date: { gte: startOfMonth, lte: endOfMonth } }
          }),
          db.serviceBooking.count({
            where: { date: { gte: startOfMonth, lte: endOfMonth } }
          })
        ])

        return {
          month,
          testDrives,
          services,
          total: testDrives + services
        }
      })
    )

    // Revenue by month
    const revenueByMonth = await Promise.all(
      last6Months.map(async ({ month, startOfMonth, endOfMonth }) => {
        const result = await db.payment.aggregate({
          where: {
            createdAt: { gte: startOfMonth, lte: endOfMonth },
            status: PaymentStatus.COMPLETED
          },
          _sum: { amount: true }
        })

        return {
          month,
          revenue: result._sum.amount || 0
        }
      })
    )

    // Popular services
    const popularServices = await db.serviceBooking.groupBy({
      by: ['serviceTypeId'],
      where: {
        status: BookingStatus.COMPLETED,
        paymentStatus: PaymentStatus.COMPLETED
      },
      _count: { id: true },
      _sum: { totalPrice: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })

    const serviceTypes = await db.serviceType.findMany({
      where: {
        id: { in: popularServices.map(s => s.serviceTypeId) }
      }
    })

    const popularServicesData = popularServices.map(service => {
      const serviceType = serviceTypes.find(st => st.id === service.serviceTypeId)
      return {
        name: serviceType?.name || 'Unknown',
        count: service._count.id,
        revenue: service._sum.totalPrice || 0
      }
    })

    // Vehicle sales (assuming sold vehicles have bookings)
    const vehicleSales = await db.vehicle.groupBy({
      by: ['make', 'model'],
      where: { status: VehicleStatus.SOLD },
      _count: { id: true },
      _sum: { price: true },
      orderBy: { _count: { id: 'desc' } },
      take: 5
    })

    // Customer growth
    const customerGrowth = await Promise.all(
      last6Months.map(async ({ month, startOfMonth, endOfMonth }) => {
        const count = await db.user.count({
          where: {
            role: UserRole.CUSTOMER,
            createdAt: { gte: startOfMonth, lte: endOfMonth }
          }
        })

        return { month, customers: count }
      })
    )

    return {
      bookingsByMonth,
      revenueByMonth,
      popularServices: popularServicesData,
      vehicleSales,
      customerGrowth
    }
  }

  async getBookingStats(startDate: Date, endDate: Date) {
    const [testDriveStats, serviceStats] = await Promise.all([
      db.testDriveBooking.groupBy({
        by: ['status'],
        where: {
          date: { gte: startDate, lte: endDate }
        },
        _count: { id: true }
      }),
      db.serviceBooking.groupBy({
        by: ['status'],
        where: {
          date: { gte: startDate, lte: endDate }
        },
        _count: { id: true }
      })
    ])

    const testDriveBookings = testDriveStats.reduce((acc, stat) => ({
      ...acc,
      [stat.status]: stat._count.id
    }), {} as Record<string, number>)

    const serviceBookings = serviceStats.reduce((acc, stat) => ({
      ...acc,
      [stat.status]: stat._count.id
    }), {} as Record<string, number>)

    return { testDriveBookings, serviceBookings }
  }

  async getSystemHealth() {
    const [totalUsers, activeUsers, totalBookings, pendingNotifications] = await Promise.all([
      db.user.count(),
      db.user.count({
        where: {
          isActive: true,
          lastLoginAt: { gte: subDays(new Date(), 30) }
        }
      }),
      db.testDriveBooking.count() + db.serviceBooking.count(),
      db.notification.count({
        where: { status: 'PENDING' }
      })
    ])

    return {
      totalUsers,
      activeUsers,
      totalBookings,
      pendingNotifications,
      systemStatus: 'healthy'
    }
  }

  async getQuickActions() {
    const [pendingBookings, lowStockVehicles, overduePayments] = await Promise.all([
      db.testDriveBooking.count({
        where: { status: BookingStatus.PENDING }
      }) + db.serviceBooking.count({
        where: { status: BookingStatus.PENDING }
      }),
      db.vehicle.count({
        where: { status: VehicleStatus.AVAILABLE }
      }),
      db.serviceBooking.count({
        where: {
          paymentStatus: PaymentStatus.PENDING,
          date: { lt: subDays(new Date(), 1) }
        }
      })
    ])

    return {
      pendingBookings,
      lowStockVehicles,
      overduePayments
    }
  }
}