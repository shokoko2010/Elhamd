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
  Eye,
  Settings,
  Bell,
  MessageSquare,
  FileText,
  CreditCard,
  AlertTriangle,
  CheckCircle,
  Clock,
  Phone,
  Mail,
  MapPin,
  Star,
  Target,
  Zap,
  Database,
  Shield,
  Users2,
  ShoppingCart,
  Headphones,
  Truck,
  Building,
  DollarSign,
  Activity,
  PieChart,
  TrendingDown,
  Filter,
  Download,
  Upload,
  RefreshCw
} from 'lucide-react'

interface DashboardStats {
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

interface RecentBooking {
  id: string
  customerName: string
  customerEmail: string
  customerPhone: string
  vehicleName?: string
  serviceName?: string
  type: 'test-drive' | 'service'
  date: string
  timeSlot: string
  status: 'PENDING' | 'CONFIRMED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  totalPrice?: number
  paymentStatus?: 'PENDING' | 'COMPLETED' | 'FAILED' | 'REFUNDED'
}

interface RecentVehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'MAINTENANCE'
  category: string
  createdAt: string
  featured: boolean
  images?: Array<{ id: string; url: string; isPrimary: boolean }>
}

interface SystemHealth {
  totalUsers: number
  activeUsers: number
  totalBookings: number
  pendingNotifications: number
  systemStatus: string
}

interface QuickActions {
  pendingBookings: number
  lowStockVehicles: number
  overduePayments: number
}

interface QuickAction {
  id: string
  title: string
  description: string
  icon: any
  color: string
  href: string
  badge?: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalVehicles: 0,
    availableVehicles: 0,
    soldVehicles: 0,
    totalCustomers: 0,
    todayBookings: 0,
    pendingBookings: 0,
    totalRevenue: 0,
    monthlyRevenue: 0,
    testDriveBookings: 0,
    serviceBookings: 0,
    completedBookings: 0,
    cancelledBookings: 0
  })
  const [recentBookings, setRecentBookings] = useState<RecentBooking[]>([])
  const [recentVehicles, setRecentVehicles] = useState<RecentVehicle[]>([])
  const [systemHealth, setSystemHealth] = useState<SystemHealth>({
    totalUsers: 0,
    activeUsers: 0,
    totalBookings: 0,
    pendingNotifications: 0,
    systemStatus: 'healthy'
  })
  const [quickActions, setQuickActions] = useState<QuickActions>({
    pendingBookings: 0,
    lowStockVehicles: 0,
    overduePayments: 0
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/admin/dashboard-data')
      if (!response.ok) {
        throw new Error('فشل في جلب بيانات لوحة التحكم')
      }
      const data = await response.json()
      
      setStats(data.stats)
      setRecentBookings(data.recentBookings)
      setRecentVehicles(data.recentVehicles)
      setSystemHealth(data.systemHealth)
      setQuickActions(data.quickActions)
    } catch (err) {
      console.error('Error fetching dashboard data:', err)
      setError(err instanceof Error ? err.message : 'حدث خطأ غير معروف')
    } finally {
      setLoading(false)
    }
  }

  const quickActionsList: QuickAction[] = [
    {
      id: 'add-vehicle',
      title: 'إضافة سيارة',
      description: 'إضافة سيارة جديدة للمخزون',
      icon: Car,
      color: 'bg-blue-500',
      href: '/admin/vehicles/new'
    },
    {
      id: 'add-customer',
      title: 'إضافة عميل',
      description: 'تسجيل عميل جديد في النظام',
      icon: Users,
      color: 'bg-green-500',
      href: '/admin/customers/new'
    },
    {
      id: 'new-booking',
      title: 'حجز جديد',
      description: 'إنشاء حجز تجربة قيادة أو صيانة',
      icon: Calendar,
      color: 'bg-purple-500',
      href: '/admin/bookings/new'
    },
    {
      id: 'pending-bookings',
      title: 'الحجوزات المعلقة',
      description: 'مراجعة والموافقة على الحجوزات',
      icon: Clock,
      color: 'bg-orange-500',
      href: '/admin/bookings?status=pending',
      badge: quickActions.pendingBookings
    },
    {
      id: 'service-booking',
      title: 'حجز صيانة',
      description: 'حجز موعد صيانة للسيارات',
      icon: Wrench,
      color: 'bg-red-500',
      href: '/admin/bookings/service/new'
    },
    {
      id: 'test-drive',
      title: 'تجربة قيادة',
      description: 'جدولة تجربة قيادة للعملاء',
      icon: Car,
      color: 'bg-indigo-500',
      href: '/admin/bookings/test-drive/new'
    },
    {
      id: 'inventory',
      title: 'إدارة المخزون',
      description: 'عرض وإدارة مخزون السيارات',
      icon: Database,
      color: 'bg-teal-500',
      href: '/admin/inventory'
    },
    {
      id: 'reports',
      title: 'التقارير',
      description: 'عرض التقارير والإحصائيات',
      icon: BarChart3,
      color: 'bg-pink-500',
      href: '/admin/reports'
    },
    {
      id: 'payments',
      title: 'المدفوعات',
      description: 'إدارة المدفوعات والفواتير',
      icon: CreditCard,
      color: 'bg-yellow-500',
      href: '/admin/payments',
      badge: quickActions.overduePayments
    },
    {
      id: 'customers',
      title: 'إدارة العملاء',
      description: 'عرض وإدارة بيانات العملاء',
      icon: Users2,
      color: 'bg-cyan-500',
      href: '/admin/customers'
    },
    {
      id: 'notifications',
      title: 'الإشعارات',
      description: 'إدارة الإشعارات والتنبيهات',
      icon: Bell,
      color: 'bg-violet-500',
      href: '/admin/notifications',
      badge: systemHealth.pendingNotifications
    },
    {
      id: 'settings',
      title: 'الإعدادات',
      description: 'إعدادات النظام والتكوينات',
      icon: Settings,
      color: 'bg-gray-500',
      href: '/admin/settings'
    }
  ]

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
      'PENDING': { label: 'قيد الانتظار', variant: 'secondary' as const },
      'CONFIRMED': { label: 'مؤكد', variant: 'default' as const },
      'COMPLETED': { label: 'مكتمل', variant: 'outline' as const },
      'CANCELLED': { label: 'ملغي', variant: 'destructive' as const },
      'NO_SHOW': { label: 'لم يحضر', variant: 'destructive' as const },
      'AVAILABLE': { label: 'متاح', variant: 'default' as const },
      'SOLD': { label: 'مباع', variant: 'destructive' as const },
      'RESERVED': { label: 'محجوز', variant: 'secondary' as const },
      'MAINTENANCE': { label: ' تحت الصيانة', variant: 'outline' as const }
    }
    
    const config = statusConfig[status] || { label: status, variant: 'default' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
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

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertTriangle className="h-12 w-12 text-red-600 mx-auto mb-4" />
          <p className="text-gray-600 mb-4">{error}</p>
          <Button onClick={fetchDashboardData} variant="outline">
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
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
              {stats.availableVehicles} متاحة • {stats.soldVehicles} مباعة
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
              {systemHealth.activeUsers} نشطين هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحجوزات اليوم</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.todayBookings}</div>
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
            <div className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي {formatPrice(stats.totalRevenue)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حجوزات تجربة قيادة</CardTitle>
            <Car className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.testDriveBookings}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.testDriveBookings / (stats.testDriveBookings + stats.serviceBookings)) * 100) || 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حجوزات الصيانة</CardTitle>
            <Wrench className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.serviceBookings}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.serviceBookings / (stats.testDriveBookings + stats.serviceBookings)) * 100) || 0}% من الإجمالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحجوزات المكتملة</CardTitle>
            <CheckCircle className="h-4 w-4 text-emerald-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-emerald-600">{stats.completedBookings}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.completedBookings / (stats.testDriveBookings + stats.serviceBookings)) * 100) || 0}% معدل الإنجاز
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحجوزات الملغاة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.cancelledBookings}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((stats.cancelledBookings / (stats.testDriveBookings + stats.serviceBookings)) * 100) || 0}% معدل الإلغاء
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
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentBookings.length > 0 ? recentBookings.map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      booking.type === 'test-drive' ? 'bg-blue-100' : 'bg-green-100'
                    }`}>
                      {booking.type === 'test-drive' ? (
                        <Car className="h-5 w-5 text-blue-600" />
                      ) : (
                        <Wrench className="h-5 w-5 text-green-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{booking.customerName}</p>
                      <p className="text-sm text-gray-600">
                        {booking.vehicleName || booking.serviceName || 'غير محدد'}
                      </p>
                      <p className="text-xs text-gray-500">{booking.customerEmail}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-600">
                      {formatDate(booking.date)} {booking.timeSlot}
                    </div>
                    <div className="mt-1">
                      {getStatusBadge(booking.status)}
                    </div>
                    {booking.totalPrice && (
                      <div className="text-sm font-medium text-green-600 mt-1">
                        {formatPrice(booking.totalPrice)}
                      </div>
                    )}
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد حجوزات حديثة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Vehicles */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>السيارات الأخيرة</CardTitle>
                <CardDescription>آخر 4 سيارات مضافة</CardDescription>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="ml-2 h-4 w-4" />
                إضافة سيارة
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {recentVehicles.length > 0 ? recentVehicles.map((vehicle) => (
                <div key={vehicle.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                      {vehicle.images && vehicle.images.length > 0 ? (
                        <img 
                          src={vehicle.images[0].url} 
                          alt={`${vehicle.make} ${vehicle.model}`}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        <Car className="h-6 w-6 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                      <p className="text-sm text-gray-600">{vehicle.year} • {vehicle.category}</p>
                      <p className="text-xs text-gray-500">
                        مضافة في {formatDate(vehicle.createdAt)}
                      </p>
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
              )) : (
                <div className="text-center py-8 text-gray-500">
                  <Car className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>لا توجد سيارات حديثة</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
          <CardDescription>الوصول السريع إلى المهام الشائعة والعمليات اليومية</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {quickActionsList.map((action) => (
              <Button
                key={action.id}
                variant="outline"
                className="h-24 flex-col relative hover:shadow-md transition-shadow"
                onClick={() => {
                  // Navigate to the action href
                  window.location.href = action.href
                }}
              >
                <div className={`${action.color} w-12 h-12 rounded-full flex items-center justify-center mb-2`}>
                  <action.icon className="h-6 w-6 text-white" />
                </div>
                <span className="text-sm font-medium text-center">{action.title}</span>
                {action.badge && action.badge > 0 && (
                  <Badge 
                    variant="destructive" 
                    className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs"
                  >
                    {action.badge}
                  </Badge>
                )}
              </Button>
            ))}
          </div>
          
          {/* System Health Status */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-700">حالة النظام</h3>
              <Badge variant={systemHealth.systemStatus === 'healthy' ? 'default' : 'destructive'}>
                {systemHealth.systemStatus === 'healthy' ? 'سليم' : 'هناك مشكلة'}
              </Badge>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-blue-600">{systemHealth.totalUsers}</div>
                <div className="text-gray-500">إجمالي المستخدمين</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-green-600">{systemHealth.activeUsers}</div>
                <div className="text-gray-500">مستخدمين نشطين</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-purple-600">{systemHealth.totalBookings}</div>
                <div className="text-gray-500">إجمالي الحجوزات</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-orange-600">{systemHealth.pendingNotifications}</div>
                <div className="text-gray-500">إشعارات معلقة</div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Additional Quick Actions Section */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>عمليات سريعة إضافية</CardTitle>
          <CardDescription>مهام متقدمة وإدارة سريعة للأنظمة المختلفة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Button variant="outline" className="h-16 flex items-center justify-start p-4 hover:bg-gray-50">
              <div className="bg-blue-100 w-10 h-10 rounded-lg flex items-center justify-center ml-3">
                <FileText className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-right">
                <div className="font-medium">تقارير مالية</div>
                <div className="text-xs text-gray-500">عرض التقارير المالية الشهرية</div>
              </div>
            </Button>

            <Button variant="outline" className="h-16 flex items-center justify-start p-4 hover:bg-gray-50">
              <div className="bg-green-100 w-10 h-10 rounded-lg flex items-center justify-center ml-3">
                <MessageSquare className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-right">
                <div className="font-medium">دعم العملاء</div>
                <div className="text-xs text-gray-500">تذاكر الدعم والاستفسارات</div>
              </div>
            </Button>

            <Button variant="outline" className="h-16 flex items-center justify-start p-4 hover:bg-gray-50">
              <div className="bg-purple-100 w-10 h-10 rounded-lg flex items-center justify-center ml-3">
                <Truck className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-right">
                <div className="font-medium">الخدمات اللوجستية</div>
                <div className="text-xs text-gray-500">إدارة الشحن والتوصيل</div>
              </div>
            </Button>

            <Button variant="outline" className="h-16 flex items-center justify-start p-4 hover:bg-gray-50">
              <div className="bg-red-100 w-10 h-10 rounded-lg flex items-center justify-center ml-3">
                <Shield className="h-5 w-5 text-red-600" />
              </div>
              <div className="text-right">
                <div className="font-medium">الأمن والصلاحيات</div>
                <div className="text-xs text-gray-500">إدارة الصلاحيات والأمان</div>
              </div>
            </Button>

            <Button variant="outline" className="h-16 flex items-center justify-start p-4 hover:bg-gray-50">
              <div className="bg-yellow-100 w-10 h-10 rounded-lg flex items-center justify-center ml-3">
                <Building className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="text-right">
                <div className="font-medium">إدارة الفروع</div>
                <div className="text-xs text-gray-500">إدارة فروع الشركة</div>
              </div>
            </Button>

            <Button variant="outline" className="h-16 flex items-center justify-start p-4 hover:bg-gray-50">
              <div className="bg-indigo-100 w-10 h-10 rounded-lg flex items-center justify-center ml-3">
                <Activity className="h-5 w-5 text-indigo-600" />
              </div>
              <div className="text-right">
                <div className="font-medium">مراقبة الأداء</div>
                <div className="text-xs text-gray-500">متابعة أداء النظام</div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}