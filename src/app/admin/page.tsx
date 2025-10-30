'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  Calendar, 
  Wrench, 
  BarChart3, 
  Settings,
  Bell,
  Search,
  Package,
  Shield,
  Calculator,
  UserCheck,
  FileText,
  Home,
  Building,
  CreditCard,
  FileCheck,
  Tool,
  Lock,
  Menu,
  X,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Clock
} from 'lucide-react'
import { useRouter } from 'next/navigation'

interface DashboardStats {
  totalVehicles: number
  availableVehicles: number
  soldVehicles: number
  totalCustomers: number
  todayBookings: number
  pendingBookings: number
  totalRevenue: number
  monthlyRevenue: number
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
  status: string
  category: string
  createdAt: string
}

export default function AdminDashboard() {
  return (
    <AdminRoute>
      <DashboardContent />
    </AdminRoute>
  )
}

function DashboardContent() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('overview')
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<any>(null)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard-data')
      const data = await response.json()
      setDashboardData(data)
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const stats = dashboardData?.stats || {
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
  }

  const recentBookings = dashboardData?.recentBookings || []
  const recentVehicles = dashboardData?.recentVehicles || []
  const systemHealth = dashboardData?.systemHealth || {}
  const quickActions = dashboardData?.quickActions || {}

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'قيد الانتظار' },
      confirmed: { variant: 'default' as const, label: 'مؤكد' },
      completed: { variant: 'outline' as const, label: 'مكتمل' },
      cancelled: { variant: 'destructive' as const, label: 'ملغي' },
      available: { variant: 'default' as const, label: 'متاح' },
      sold: { variant: 'secondary' as const, label: 'مباع' },
      AVAILABLE: { variant: 'default' as const, label: 'متاح' },
      SOLD: { variant: 'secondary' as const, label: 'مباع' },
      RESERVED: { variant: 'outline' as const, label: 'محجوز' },
      MAINTENANCE: { variant: 'destructive' as const, label: 'للصيانة' },
      PENDING: { variant: 'secondary' as const, label: 'قيد الانتظار' },
      CONFIRMED: { variant: 'default' as const, label: 'مؤكد' },
      COMPLETED: { variant: 'outline' as const, label: 'مكتمل' },
      CANCELLED: { variant: 'destructive' as const, label: 'ملغي' }
    }
    
    const config = statusConfig[status.toUpperCase() as keyof typeof statusConfig] || statusConfig.pending
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(price)
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num)
  }

  const formatDate = (date: Date | string) => {
    const d = new Date(date)
    return d.toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const menuItems = [
    {
      title: 'الرئيسية',
      items: [
        { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
        { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
      ]
    },
    {
      title: 'العمليات الأساسية',
      items: [
        { id: 'vehicles', label: 'المركبات', icon: Car },
        { id: 'bookings', label: 'الحجوزات', icon: Calendar },
        { id: 'personnel', label: 'الأفراد', icon: Users },
        { id: 'inventory', label: 'المخزون', icon: Package },
      ]
    },
    {
      title: 'الإدارة',
      items: [
        { id: 'hr', label: 'الموارد البشرية', icon: Building },
        { id: 'accounting', label: 'المحاسبة', icon: Calculator },
        { id: 'contracts', label: 'العقود', icon: FileText },
        { id: 'maintenance', label: 'الصيانة', icon: Wrench },
      ]
    },
    {
      title: 'النظام',
      items: [
        { id: 'permissions', label: 'الصلاحيات', icon: Lock },
        { id: 'search', label: 'بحث', icon: Search },
        { id: 'notifications', label: 'إشعارات', icon: Bell },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="flex items-center justify-between px-6 py-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="lg:hidden"
            >
              {sidebarOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Car className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-sm text-gray-500">نظام إدارة بيع السيارات</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              الإشعارات
              {quickActions.pendingNotifications > 0 && (
                <Badge variant="destructive" className="mr-2 h-5 w-5 p-0 flex items-center justify-center">
                  {quickActions.pendingNotifications}
                </Badge>
              )}
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <span className="text-sm font-medium">المدير</span>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static lg:translate-x-0 z-30 w-64 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
          <nav className="p-4 space-y-6">
            {menuItems.map((section) => (
              <div key={section.title}>
                <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">
                  {section.title}
                </h3>
                <div className="space-y-1">
                  {section.items.map((item) => {
                    const Icon = item.icon
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          setActiveTab(item.id)
                          if (window.innerWidth < 1024) {
                            setSidebarOpen(false)
                          }
                        }}
                        className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                          activeTab === item.id
                            ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
                        {item.id === 'notifications' && quickActions.pendingNotifications > 0 && (
                          <Badge variant="destructive" className="mr-auto h-5 w-5 p-0 flex items-center justify-center text-xs">
                            {quickActions.pendingNotifications}
                          </Badge>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className="text-gray-600">جاري تحميل البيانات...</p>
              </div>
            </div>
          ) : (
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              {/* Overview Tab */}
              <TabsContent value="overview" className="space-y-6">
                {/* Alert Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="border-red-200 bg-red-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-red-600" />
                        <CardTitle className="text-sm font-medium text-red-800">إجراءات عاجلة</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-red-600">{formatNumber(quickActions.overduePayments || 0)}</div>
                      <p className="text-sm text-red-700">مدفوعات متأخرة تحتاج إلى متابعة</p>
                    </CardContent>
                  </Card>

                  <Card className="border-yellow-200 bg-yellow-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <Clock className="h-5 w-5 text-yellow-600" />
                        <CardTitle className="text-sm font-medium text-yellow-800">قيد الانتظار</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-yellow-600">{formatNumber(quickActions.pendingBookings || 0)}</div>
                      <p className="text-sm text-yellow-700">حجوزات تحتاج إلى مراجعة</p>
                    </CardContent>
                  </Card>

                  <Card className="border-green-200 bg-green-50">
                    <CardHeader className="pb-3">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <CardTitle className="text-sm font-medium text-green-800">جاهزة للعرض</CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold text-green-600">{formatNumber(quickActions.lowStockVehicles || 0)}</div>
                      <p className="text-sm text-green-700">مركبات متاحة للبيع</p>
                    </CardContent>
                  </Card>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">إجمالي المركبات</CardTitle>
                      <Car className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(stats.totalVehicles)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(stats.availableVehicles)} متاح للعرض
                      </p>
                      <div className="mt-2 flex items-center text-xs text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +12% من الشهر الماضي
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">العملاء</CardTitle>
                      <Users className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(stats.totalCustomers)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(systemHealth.activeUsers || 0)} نشطون
                      </p>
                      <div className="mt-2 flex items-center text-xs text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +8% من الشهر الماضي
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">حجوزات اليوم</CardTitle>
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatNumber(stats.todayBookings)}</div>
                      <p className="text-xs text-muted-foreground">
                        {formatNumber(stats.pendingBookings)} قيد الانتظار
                      </p>
                      <div className="mt-2 flex items-center text-xs text-blue-600">
                        <Clock className="h-3 w-3 mr-1" />
                        متوسط وقت الانتظار: 15 دقيقة
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                      <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
                      <BarChart3 className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                      <div className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</div>
                      <p className="text-xs text-muted-foreground">
                        إيرادات هذا الشهر
                      </p>
                      <div className="mt-2 flex items-center text-xs text-green-600">
                        <TrendingUp className="h-3 w-3 mr-1" />
                        +23% من الشهر الماضي
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>آخر الحجوزات</CardTitle>
                          <CardDescription>آخر 5 حجوزات في النظام</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('bookings')}>
                          عرض الكل
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentBookings.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">لا توجد حجوزات حديثة</p>
                        ) : (
                          recentBookings.slice(0, 5).map((booking: any) => (
                            <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
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
                                  <p className="text-sm text-gray-600">
                                    {booking.vehicleName || booking.serviceName}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="mb-1">{getStatusBadge(booking.status)}</div>
                                <p className="text-xs text-gray-500">
                                  {formatDate(booking.date)} {booking.timeSlot}
                                </p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div>
                          <CardTitle>آخر المركبات</CardTitle>
                          <CardDescription>آخر 4 مركبات مضافة</CardDescription>
                        </div>
                        <Button variant="outline" size="sm" onClick={() => setActiveTab('vehicles')}>
                          عرض الكل
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {recentVehicles.length === 0 ? (
                          <p className="text-center text-gray-500 py-8">لا توجد مركبات حديثة</p>
                        ) : (
                          recentVehicles.slice(0, 4).map((vehicle: any) => (
                            <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                                  <Car className="h-5 w-5 text-gray-600" />
                                </div>
                                <div>
                                  <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                                  <p className="text-sm text-gray-600">{vehicle.year} • {vehicle.category}</p>
                                </div>
                              </div>
                              <div className="text-right">
                                <div className="mb-1">{getStatusBadge(vehicle.status)}</div>
                                <p className="text-sm font-medium">{formatPrice(vehicle.price)}</p>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Personnel Tab */}
              <TabsContent value="personnel" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">إدارة الأفراد</h2>
                    <p className="text-gray-600">إدارة العملاء والموظفين في النظام</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Customer Management */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                            <Users className="h-6 w-6 text-blue-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">إدارة العملاء</CardTitle>
                            <CardDescription>إدارة بيانات العملاء والتفاعلات</CardDescription>
                          </div>
                        </div>
                        <Button onClick={() => router.push('/admin/customers')}>
                          <Users className="mr-2 h-4 w-4" />
                          إدارة
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                          <div className="text-2xl font-bold text-blue-600">{formatNumber(stats.totalCustomers)}</div>
                          <p className="text-sm text-gray-600">إجمالي العملاء</p>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                          <div className="text-2xl font-bold text-green-600">{formatNumber(systemHealth.activeUsers || 0)}</div>
                          <p className="text-sm text-gray-600">عملاء نشطون</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Employee Management */}
                  <Card className="hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-green-600" />
                          </div>
                          <div>
                            <CardTitle className="text-lg">إدارة الموظفين</CardTitle>
                            <CardDescription>إدارة بيانات الموظفين والرواتب</CardDescription>
                          </div>
                        </div>
                        <Button onClick={() => router.push('/admin/employees')}>
                          <UserCheck className="mr-2 h-4 w-4" />
                          إدارة
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                          <div className="text-2xl font-bold text-purple-600">{formatNumber(quickActions.totalEmployees || 0)}</div>
                          <p className="text-sm text-gray-600">إجمالي الموظفين</p>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                          <div className="text-2xl font-bold text-orange-600">{formatNumber(quickActions.newPersonnelThisMonth || 0)}</div>
                          <p className="text-sm text-gray-600">جدد هذا الشهر</p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              {/* Other tabs with simplified content */}
              <TabsContent value="vehicles" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">إدارة المركبات</h2>
                    <p className="text-gray-600">عرض وإدارة جميع المركبات في النظام</p>
                  </div>
                  <Button>
                    <Car className="mr-2 h-4 w-4" />
                    إضافة مركبة
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-12 text-center">
                    <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">إدارة المركبات</h3>
                    <p className="text-gray-600 mb-4">
                      قم بإدارة مركبات الشركة من هنا - إضافة، تعديل، حذف
                    </p>
                    <Button>
                      الذهاب إلى إدارة المركبات
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="bookings" className="space-y-6">
                <div className="flex items-center justify-between mb-6">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900">إدارة الحجوزات</h2>
                    <p className="text-gray-600">عرض وإدارة جميع الحجوزات</p>
                  </div>
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    حجز جديد
                  </Button>
                </div>
                <Card>
                  <CardContent className="p-12 text-center">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold mb-2">إدارة الحجوزات</h3>
                    <p className="text-gray-600 mb-4">
                      إدارة حجوزات اختبار القيادة والخدمات
                    </p>
                    <Button>
                      الذهاب إلى إدارة الحجوزات
                    </Button>
                  </CardContent>
                </Card>
              </TabsContent>

              {/* Placeholder for other tabs */}
              {['inventory', 'hr', 'accounting', 'contracts', 'maintenance', 'permissions', 'search', 'notifications', 'analytics'].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {tab === 'inventory' && 'إدارة المخزون'}
                        {tab === 'hr' && 'الموارد البشرية'}
                        {tab === 'accounting' && 'المحاسبة'}
                        {tab === 'contracts' && 'إدارة العقود'}
                        {tab === 'maintenance' && 'الصيانة'}
                        {tab === 'permissions' && 'الصلاحيات'}
                        {tab === 'search' && 'بحث'}
                        {tab === 'notifications' && 'الإشعارات'}
                        {tab === 'analytics' && 'التحليلات'}
                      </h2>
                      <p className="text-gray-600">
                        {tab === 'inventory' && 'إدارة قطع الغيار والمستلزمات'}
                        {tab === 'hr' && 'إدارة شؤون الموظفين'}
                        {tab === 'accounting' && 'إدارة الحسابات والمدفوعات'}
                        {tab === 'contracts' && 'إدارة العقود والاتفاقيات'}
                        {tab === 'maintenance' && 'إدارة الصيانة والإصلاحات'}
                        {tab === 'permissions' && 'إدارة صلاحيات المستخدمين'}
                        {tab === 'search' && 'البحث في النظام'}
                        {tab === 'notifications' && 'إدارة الإشعارات والتنبيهات'}
                        {tab === 'analytics' && 'التحليلات والتقارير'}
                      </p>
                    </div>
                  </div>
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {tab === 'inventory' && <Package className="h-8 w-8 text-gray-400" />}
                        {tab === 'hr' && <Building className="h-8 w-8 text-gray-400" />}
                        {tab === 'accounting' && <Calculator className="h-8 w-8 text-gray-400" />}
                        {tab === 'contracts' && <FileText className="h-8 w-8 text-gray-400" />}
                        {tab === 'maintenance' && <Wrench className="h-8 w-8 text-gray-400" />}
                        {tab === 'permissions' && <Lock className="h-8 w-8 text-gray-400" />}
                        {tab === 'search' && <Search className="h-8 w-8 text-gray-400" />}
                        {tab === 'notifications' && <Bell className="h-8 w-8 text-gray-400" />}
                        {tab === 'analytics' && <BarChart3 className="h-8 w-8 text-gray-400" />}
                      </div>
                      <h3 className="text-lg font-semibold mb-2">
                        {tab === 'inventory' && 'إدارة المخزون'}
                        {tab === 'hr' && 'الموارد البشرية'}
                        {tab === 'accounting' && 'المحاسبة'}
                        {tab === 'contracts' && 'إدارة العقود'}
                        {tab === 'maintenance' && 'الصيانة'}
                        {tab === 'permissions' && 'الصلاحيات'}
                        {tab === 'search' && 'البحث'}
                        {tab === 'notifications' && 'الإشعارات'}
                        {tab === 'analytics' && 'التحليلات'}
                      </h3>
                      <p className="text-gray-600 mb-4">هذه الوحدة قيد التطوير</p>
                      <Button variant="outline">قريباً</Button>
                    </CardContent>
                  </Card>
                </TabsContent>
              ))}
            </Tabs>
          )}
        </main>
      </div>
    </div>
  )
}