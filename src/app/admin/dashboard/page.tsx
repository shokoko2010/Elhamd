'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  BarChart3, 
  Car, 
  Users, 
  Calendar, 
  Wrench, 
  TrendingUp, 
  Plus,
  Eye
} from 'lucide-react'

interface DashboardStats {
  totalVehicles: number
  totalCustomers: number
  totalBookings: number
  pendingBookings: number
  revenue: number
  monthlyGrowth: number
}

interface RecentBooking {
  id: string
  customerName: string
  vehicleName: string
  type: 'test-drive' | 'service'
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
}

interface RecentVehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  status: 'available' | 'sold' | 'reserved'
  featured: boolean
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    totalCustomers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    revenue: 0,
    monthlyGrowth: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [recentVehicles, setRecentVehicles] = useState<RecentVehicle[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Mock data - will be replaced with API calls
    const mockStats: DashboardStats = {
      totalVehicles: 45,
      totalCustomers: 128,
      totalBookings: 89,
      pendingBookings: 12,
      revenue: 2850000,
      monthlyGrowth: 15.5
    }

    const mockBookings: RecentBooking[] = [
      {
        id: '1',
        customerName: 'أحمد محمد',
        vehicleName: 'تاتا نيكسون',
        type: 'test-drive',
        date: '2024-01-15',
        time: '10:00',
        status: 'confirmed'
      },
      {
        id: '2',
        customerName: 'فاطمة علي',
        vehicleName: 'تاتا بانش',
        type: 'service',
        date: '2024-01-15',
        time: '14:00',
        status: 'pending'
      },
      {
        id: '3',
        customerName: 'محمد خالد',
        vehicleName: 'تاتا تياجو',
        type: 'test-drive',
        date: '2024-01-14',
        time: '11:00',
        status: 'completed'
      },
      {
        id: '4',
        customerName: 'سارة أحمد',
        vehicleName: 'تاتا هارير',
        type: 'service',
        date: '2024-01-14',
        time: '16:00',
        status: 'confirmed'
      }
    ]

    const mockVehicles: RecentVehicle[] = [
      {
        id: '1',
        make: 'تاتا',
        model: 'نيكسون',
        year: 2024,
        price: 850000,
        status: 'available',
        featured: true
      },
      {
        id: '2',
        make: 'تاتا',
        model: 'بانش',
        year: 2024,
        price: 650000,
        status: 'sold',
        featured: false
      },
      {
        id: '3',
        make: 'تاتا',
        model: 'تياجو',
        year: 2024,
        price: 550000,
        status: 'available',
        featured: true
      }
    ]

    // Simulate API call
    setTimeout(() => {
      setStats(mockStats)
      setRecentBookings(mockBookings)
      setRecentVehicles(mockVehicles)
      setLoading(false)
    }, 1000)
  }, [])

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'pending': { label: 'قيد الانتظار', variant: 'secondary' as const },
      'confirmed': { label: 'مؤكد', variant: 'default' as const },
      'completed': { label: 'مكتمل', variant: 'outline' as const },
      'cancelled': { label: 'ملغي', variant: 'destructive' as const },
      'available': { label: 'متاح', variant: 'default' as const },
      'sold': { label: 'مباع', variant: 'destructive' as const },
      'reserved': { label: 'محجوز', variant: 'secondary' as const }
    }
    
    const config = statusConfig[status] || { label: status, variant: 'default' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري تحميل لوحة التحكم...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">مرحباً بك في لوحة التحكم</h1>
        <p className="text-gray-600">إدارة شركة الحمد للسيارات - نظرة عامة على الأداء</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السيارات</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVehicles}</div>
            <p className="text-xs text-muted-foreground">
              +2 سيارات جديدة هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              +12 عميل جديد هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingBookings} في انتظار الموافقة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatPrice(stats.revenue)}</div>
            <p className="text-xs text-muted-foreground">
              +{stats.monthlyGrowth}% عن الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Recent Bookings */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>الحجوزات الأخيرة</CardTitle>
                <CardDescription>آخر 5 حجوزات في النظام</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Eye className="ml-2 h-4 w-4" />
                عرض الكل
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                      {booking.type === 'test-drive' ? (
                        <Car className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Wrench className="h-5 w-5 text-blue-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">{booking.vehicleName}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {booking.date} {booking.time}
                    </div>
                    {getStatusBadge(booking.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Vehicles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>السيارات الأخيرة</CardTitle>
                <CardDescription>آخر 3 سيارات مضافة</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="ml-2 h-4 w-4" />
                إضافة سيارة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg"></div>
                    <div>
                      <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                      <p className="text-sm text-gray-600">{vehicle.year}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatPrice(vehicle.price)}</div>
                    <div className="flex items-center gap-2 mt-1">
                      {getStatusBadge(vehicle.status)}
                      {vehicle.featured && (
                        <Badge variant="outline" className="text-xs">مميزة</Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>الوصول السريع إلى المهام الشائعة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Plus className="h-6 w-6 mb-2" />
              <span>إضافة سيارة</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>إضافة عميل</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <Calendar className="h-6 w-6 mb-2" />
              <span>حجز جديد</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <BarChart3 className="h-6 w-6 mb-2" />
              <span>تقرير</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}