interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { AdminService } from '@/lib/admin-service'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
import { PERMISSIONS } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.role === UserRole.BRANCH_MANAGER ||
                      user.permissions.includes(PERMISSIONS.VIEW_DASHBOARD)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    const adminService = AdminService.getInstance()

    switch (type) {
      case 'stats':
        const stats = await adminService.getDashboardStats()
        return NextResponse.json(stats)

      case 'recent-bookings':
        const limit = parseInt(searchParams.get('limit') || '10')
        const recentBookings = await adminService.getRecentBookings(limit)
        return NextResponse.json(recentBookings)

      case 'recent-vehicles':
        const vehicleLimit = parseInt(searchParams.get('limit') || '10')
        const recentVehicles = await adminService.getRecentVehicles(vehicleLimit)
        return NextResponse.json(recentVehicles)

      case 'analytics':
        const analytics = await adminService.getAnalyticsData()
        return NextResponse.json(analytics)

      case 'system-health':
        const systemHealth = await adminService.getSystemHealth()
        return NextResponse.json(systemHealth)

      case 'quick-actions':
        const quickActions = await adminService.getQuickActions()
        return NextResponse.json(quickActions)

      default:
        // Return all data by default
        const [dashboardStats, bookings, vehicles, analyticsData, health, actions] = await Promise.all([
          adminService.getDashboardStats(),
          adminService.getRecentBookings(5),
          adminService.getRecentVehicles(4),
          adminService.getAnalyticsData(),
          adminService.getSystemHealth(),
          adminService.getQuickActions()
        ])

        return NextResponse.json({
          stats: dashboardStats,
          recentBookings: bookings,
          recentVehicles: vehicles,
          analytics: analyticsData,
          systemHealth: health,
          quickActions: actions
        })
    }
  } catch (error) {
    console.error('Error fetching admin dashboard data:', error)
    return NextResponse.json(
      { error: 'فشل في جلب بيانات لوحة التحكم' },
      { status: 500 }
    )
  }
}