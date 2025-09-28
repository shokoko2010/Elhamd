'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  FileText
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

  return (
    <div className="space-y-6">
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">جاري تحميل البيانات...</p>
          </div>
        </div>
      ) : (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-13">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="vehicles">المركبات</TabsTrigger>
            <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
            <TabsTrigger value="crm">العملاء</TabsTrigger>
            <TabsTrigger value="inventory">المخزون</TabsTrigger>
            <TabsTrigger value="hr">الموارد البشرية</TabsTrigger>
            <TabsTrigger value="accounting">المحاسبة</TabsTrigger>
            <TabsTrigger value="contracts">العقود</TabsTrigger>
            <TabsTrigger value="maintenance">الصيانة</TabsTrigger>
            <TabsTrigger value="permissions">الصلاحيات</TabsTrigger>
            <TabsTrigger value="search">بحث</TabsTrigger>
            <TabsTrigger value="notifications">إشعارات</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">حجوزات قيد الانتظار</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(quickActions.pendingBookings || 0)}</div>
                  <p className="text-xs text-muted-foreground">تحتاج إلى مراجعة</p>
                </CardContent>
              </Card>

              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">مركبات متاحة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{formatNumber(quickActions.lowStockVehicles || 0)}</div>
                  <p className="text-xs text-muted-foreground">جاهزة للعرض</p>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-red-600">مدفوعات متأخرة</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">{formatNumber(quickActions.overduePayments || 0)}</div>
                  <p className="text-xs text-muted-foreground">تحتاج إلى متابعة</p>
                </CardContent>
              </Card>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي المركبات</CardTitle>
                  <Car className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalVehicles)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(stats.availableVehicles)} متاح للعرض
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">العملاء</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.totalCustomers)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(systemHealth.activeUsers || 0)} نشطون
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">حجوزات اليوم</CardTitle>
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatNumber(stats.todayBookings)}</div>
                  <p className="text-xs text-muted-foreground">
                    {formatNumber(stats.pendingBookings)} قيد الانتظار
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{formatPrice(stats.monthlyRevenue)}</div>
                  <p className="text-xs text-muted-foreground">
                    إيرادات هذا الشهر
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Bookings and Vehicles */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Bookings */}
              <Card>
                <CardHeader>
                  <CardTitle>أحدث الحجوزات</CardTitle>
                  <CardDescription>آخر 5 حجوزات في النظام</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentBookings.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">لا توجد حجوزات حديثة</p>
                    ) : (
                      recentBookings.slice(0, 5).map((booking: any) => (
                        <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
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

              {/* Recent Vehicles */}
              <Card>
                <CardHeader>
                  <CardTitle>أحدث المركبات</CardTitle>
                  <CardDescription>آخر 4 مركبات مضافة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {recentVehicles.length === 0 ? (
                      <p className="text-center text-gray-500 py-8">لا توجد مركبات حديثة</p>
                    ) : (
                      recentVehicles.slice(0, 4).map((vehicle: any) => (
                        <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
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

          <TabsContent value="vehicles" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة المركبات</CardTitle>
                    <CardDescription>عرض وإدارة جميع المركبات في النظام</CardDescription>
                  </div>
                  <Button>
                    <Car className="mr-2 h-4 w-4" />
                    إضافة مركبة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">إدارة المركبات</h3>
                  <p className="text-gray-600 mb-4">
                    قم بإدارة مركبات الشركة من هنا - إضافة، تعديل، حذف
                  </p>
                  <Button>
                    الذهاب إلى إدارة المركبات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>إدارة الحجوزات</CardTitle>
                    <CardDescription>عرض وإدارة جميع الحجوزات</CardDescription>
                  </div>
                  <Button>
                    <Calendar className="mr-2 h-4 w-4" />
                    حجز جديد
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">إدارة الحجوزات</h3>
                  <p className="text-gray-600 mb-4">
                    قم بإدارة حجوزات القيادة التجريبية والخدمات من هنا
                  </p>
                  <Button>
                    الذهاب إلى إدارة الحجوزات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="crm" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>نظام إدارة علاقات العملاء (CRM)</CardTitle>
                    <CardDescription>إدارة العملاء والتفاعلات والتجزئة</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/crm')}>
                    <Users className="mr-2 h-4 w-4" />
                    إدارة العملاء
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">نظام إدارة علاقات العملاء</h3>
                  <p className="text-gray-600 mb-4">
                    إدارة العملاء، تتبع التفاعلات، وتجزئة العملاء لتحسين الخدمة
                  </p>
                  <Button onClick={() => router.push('/admin/crm')}>
                    الذهاب إلى نظام CRM
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="inventory" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>نظام إدارة المخزون</CardTitle>
                    <CardDescription>إدارة قطع الغيار والمستودعات والموردين</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/inventory')}>
                    <Package className="mr-2 h-4 w-4" />
                    إدارة المخزون
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Package className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">نظام إدارة المخزون</h3>
                  <p className="text-gray-600 mb-4">
                    إدارة قطع الغيار، تتبع المخزون، والمستودعات والموردين
                  </p>
                  <Button onClick={() => router.push('/admin/inventory')}>
                    الذهاب إلى نظام المخزون
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="hr" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>نظام الموارد البشرية</CardTitle>
                    <CardDescription>إدارة الموظفين والرواتب والإجازات</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/hr')}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    الموارد البشرية
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <UserCheck className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">نظام الموارد البشرية</h3>
                  <p className="text-gray-600 mb-4">
                    إدارة الموظفين، الرواتب، الإجازات، وتقييم الأداء
                  </p>
                  <Button onClick={() => router.push('/admin/hr')}>
                    <UserCheck className="mr-2 h-4 w-4" />
                    الموارد البشرية
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="accounting" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>نظام المحاسبة</CardTitle>
                    <CardDescription>إدارة الحسابات المالية والقيود المحاسبية</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/accounting')}>
                    <Calculator className="mr-2 h-4 w-4" />
                    المحاسبة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Calculator className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">نظام المحاسبة</h3>
                  <p className="text-gray-600 mb-4">
                    دليل الحسابات، القيود اليومية، التقارير المالية، والميزانية العمومية
                  </p>
                  <Button onClick={() => router.push('/admin/accounting')}>
                    <Calculator className="mr-2 h-4 w-4" />
                    المحاسبة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>نظام العقود والضمانات</CardTitle>
                    <CardDescription>إدارة العقود والضمانات ومطالبات الضمان</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/contracts')}>
                    <FileText className="mr-2 h-4 w-4" />
                    العقود والضمانات
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">نظام العقود والضمانات</h3>
                  <p className="text-gray-600 mb-4">
                    عقود المركبات، الضمانات، مطالبات الضمان، وإدارة العقود الشاملة
                  </p>
                  <Button onClick={() => router.push('/admin/contracts')}>
                    <FileText className="mr-2 h-4 w-4" />
                    العقود والضمانات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="maintenance" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>نظام الصيانة الدورية</CardTitle>
                    <CardDescription>إدارة جداول الصيانة، السجلات، قطع الغيار والتذكيرات</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/maintenance')}>
                    <Wrench className="mr-2 h-4 w-4" />
                    إدارة الصيانة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Wrench className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">نظام الصيانة الدورية</h3>
                  <p className="text-gray-600 mb-4">
                    إدارة جداول الصيانة الدورية للمركبات، سجلات الصيانة، مخزون قطع الغيار وتذكيرات الصيانة
                  </p>
                  <Button onClick={() => router.push('/admin/maintenance')}>
                    الذهاب إلى نظام الصيانة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="permissions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>نظام إدارة الصلاحيات</CardTitle>
                    <CardDescription>إدارة صلاحيات المستخدمين وقوالب الأدوار</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/permissions')}>
                    <Shield className="mr-2 h-4 w-4" />
                    إدارة الصلاحيات
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Shield className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">نظام إدارة الصلاحيات</h3>
                  <p className="text-gray-600 mb-4">
                    إدارة صلاحيات المستخدمين، قوالب الأدوار، والتحكم الكامل في صلاحيات النظام
                  </p>
                  <Button onClick={() => router.push('/admin/permissions')}>
                    <Shield className="mr-2 h-4 w-4" />
                    إدارة الصلاحيات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="search" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>نظام البحث المتقدم</CardTitle>
                    <CardDescription>بحث متقدم مع تصفية وتحليلات</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/search')}>
                    <Search className="mr-2 h-4 w-4" />
                    بحث متقدم
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Search className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">نظام البحث المتقدم</h3>
                  <p className="text-gray-600 mb-4">
                    بحث في جميع بيانات النظام مع خيارات تصفية متقدمة وتحليلات
                  </p>
                  <Button onClick={() => router.push('/admin/search')}>
                    الذهاب إلى البحث المتقدم
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>نظام الإشعارات المتقدم</CardTitle>
                    <CardDescription>إدارة الإشعارات والقوالب والإعدادات</CardDescription>
                  </div>
                  <Button onClick={() => router.push('/admin/notifications')}>
                    <Bell className="mr-2 h-4 w-4" />
                    إدارة الإشعارات
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Bell className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">نظام الإشعارات المتقدم</h3>
                  <p className="text-gray-600 mb-4">
                    إدارة الإشعارات المتعددة القنوات مع قوالب قابلة للتخصيص وتحليلات
                  </p>
                  <Button onClick={() => router.push('/admin/notifications')}>
                    الذهاب إلى نظام الإشعارات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التحليلات والتقارير</CardTitle>
                <CardDescription>عرض الإحصائيات والتقارير المفصلة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <BarChart3 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">التحليلات والتقارير</h3>
                  <p className="text-gray-600 mb-4">
                    عرض تقارير المبيعات والإيرادات وتحليلات الأداء
                  </p>
                  <Button>
                    عرض التحليلات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}