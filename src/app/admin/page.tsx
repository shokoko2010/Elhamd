'use client'

import { useState } from 'react'
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
  LogOut,
  Menu,
  X
} from 'lucide-react'
import Link from 'next/link'

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
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Mock data - will be replaced with API calls
  const stats: DashboardStats = {
    totalVehicles: 45,
    availableVehicles: 32,
    soldVehicles: 8,
    totalCustomers: 156,
    todayBookings: 12,
    pendingBookings: 5,
    totalRevenue: 28500000,
    monthlyRevenue: 3200000
  }

  const recentBookings: RecentBooking[] = [
    {
      id: '1',
      customerName: 'أحمد محمد',
      vehicleName: 'Tata Nexon',
      type: 'test-drive',
      date: '2024-01-15',
      time: '10:00',
      status: 'confirmed'
    },
    {
      id: '2',
      customerName: 'فاطمة علي',
      vehicleName: 'Tata Punch',
      type: 'service',
      date: '2024-01-15',
      time: '14:00',
      status: 'pending'
    },
    {
      id: '3',
      customerName: 'محمد خالد',
      vehicleName: 'Tata Tiago',
      type: 'test-drive',
      date: '2024-01-14',
      time: '11:00',
      status: 'completed'
    },
    {
      id: '4',
      customerName: 'سارة أحمد',
      vehicleName: 'Tata Harrier',
      type: 'service',
      date: '2024-01-14',
      time: '16:00',
      status: 'cancelled'
    },
    {
      id: '5',
      customerName: 'عمر حسن',
      vehicleName: 'Tata Safari',
      type: 'test-drive',
      date: '2024-01-13',
      time: '09:00',
      status: 'confirmed'
    }
  ]

  const recentVehicles: RecentVehicle[] = [
    {
      id: '1',
      make: 'Tata',
      model: 'Nexon EV',
      year: 2024,
      price: 1400000,
      status: 'AVAILABLE',
      category: 'SUV',
      createdAt: '2024-01-10'
    },
    {
      id: '2',
      make: 'Tata',
      model: 'Punch',
      year: 2024,
      price: 650000,
      status: 'SOLD',
      category: 'SUV',
      createdAt: '2024-01-09'
    },
    {
      id: '3',
      make: 'Tata',
      model: 'Tiago',
      year: 2024,
      price: 550000,
      status: 'AVAILABLE',
      category: 'HATCHBACK',
      createdAt: '2024-01-08'
    },
    {
      id: '4',
      make: 'Tata',
      model: 'Harrier',
      year: 2024,
      price: 1200000,
      status: 'AVAILABLE',
      category: 'SUV',
      createdAt: '2024-01-07'
    }
  ]

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'قيد الانتظار' },
      confirmed: { variant: 'default' as const, label: 'مؤكد' },
      completed: { variant: 'outline' as const, label: 'مكتمل' },
      cancelled: { variant: 'destructive' as const, label: 'ملغي' },
      available: { variant: 'default' as const, label: 'متاح' },
      sold: { variant: 'secondary' as const, label: 'مباع' }
    }
    
    const config = statusConfig[status.toLowerCase() as keyof typeof statusConfig] || statusConfig.pending
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

  const Sidebar = () => (
    <div className={`bg-gray-900 text-white w-64 min-h-screen fixed lg:static inset-y-0 right-0 z-50 transform ${sidebarOpen ? 'translate-x-0' : 'translate-x-full'} lg:translate-x-0 transition-transform duration-300 ease-in-out`}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-xl font-bold">لوحة التحكم</h1>
          <Button
            variant="ghost"
            size="sm"
            className="lg:hidden text-white hover:bg-gray-800"
            onClick={() => setSidebarOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <nav className="space-y-2">
          <Link href="/admin" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <LayoutDashboard className="h-5 w-5" />
            <span>الرئيسية</span>
          </Link>
          
          <Link href="/admin/vehicles" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Car className="h-5 w-5" />
            <span>إدارة المركبات</span>
          </Link>
          
          <Link href="/admin/customers" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Users className="h-5 w-5" />
            <span>إدارة العملاء</span>
          </Link>
          
          <Link href="/admin/bookings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Calendar className="h-5 w-5" />
            <span>إدارة الحجوزات</span>
          </Link>
          
          <Link href="/admin/services" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Wrench className="h-5 w-5" />
            <span>إدارة الخدمات</span>
          </Link>
          
          <Link href="/admin/analytics" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <BarChart3 className="h-5 w-5" />
            <span>التحليلات والتقارير</span>
          </Link>
          
          <Link href="/admin/settings" className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-800 transition-colors">
            <Settings className="h-5 w-5" />
            <span>الإعدادات</span>
          </Link>
        </nav>
        
        <div className="absolute bottom-6 left-6 right-6">
          <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800">
            <LogOut className="h-5 w-5 mr-3" />
            <span>تسجيل الخروج</span>
          </Button>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <div className="lg:hidden bg-white shadow-sm border-b px-4 py-3">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold">لوحة تحكم الهامد للسيارات</h1>
          <div className="w-8"></div>
        </div>
      </div>

      <div className="flex">
        <Sidebar />
        
        {/* Main Content */}
        <div className="flex-1 lg:mr-64">
          {/* Top Header */}
          <div className="bg-white shadow-sm border-b px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم</h1>
                <p className="text-gray-600">مرحباً بك في نظام إدارة الهامد للسيارات</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <input
                    type="text"
                    placeholder="بحث..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <Button variant="ghost" size="sm" className="relative">
                  <Bell className="h-5 w-5" />
                  <span className="absolute -top-1 -right-1 h-3 w-3 bg-red-500 rounded-full"></span>
                </Button>
              </div>
            </div>
          </div>

          {/* Dashboard Content */}
          <div className="p-6">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
                <TabsTrigger value="vehicles">المركبات</TabsTrigger>
                <TabsTrigger value="bookings">الحجوزات</TabsTrigger>
                <TabsTrigger value="analytics">التحليلات</TabsTrigger>
              </TabsList>

              <TabsContent value="overview" className="space-y-6">
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
                        عملاء مسجلين
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
                        {recentBookings.map((booking) => (
                          <div key={booking.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{booking.customerName}</p>
                              <p className="text-sm text-gray-600">{booking.vehicleName}</p>
                              <p className="text-xs text-gray-500">
                                {booking.date} - {booking.time}
                              </p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(booking.status)}
                              <p className="text-xs text-gray-500 mt-1">
                                {booking.type === 'test-drive' ? 'قيادة تجريبية' : 'خدمة'}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        عرض جميع الحجوزات
                      </Button>
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
                        {recentVehicles.map((vehicle) => (
                          <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg">
                            <div>
                              <p className="font-medium">{vehicle.make} {vehicle.model}</p>
                              <p className="text-sm text-gray-600">{vehicle.year} • {vehicle.category}</p>
                              <p className="text-xs text-gray-500">
                                {formatPrice(vehicle.price)}
                              </p>
                            </div>
                            <div className="text-right">
                              {getStatusBadge(vehicle.status)}
                              <p className="text-xs text-gray-500 mt-1">
                                {vehicle.createdAt}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                      <Button variant="outline" className="w-full mt-4">
                        عرض جميع المركبات
                      </Button>
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
                        <CardDescription>إضافة وتعديل وحذف المركبات</CardDescription>
                      </div>
                      <Button>
                        <Car className="mr-2 h-4 w-4" />
                        إضافة مركبة جديدة
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center py-12">
                      <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold mb-2">إدارة المركبات</h3>
                      <p className="text-gray-600 mb-4">
                        قم بإدارة مركباتك من هنا - إضافة وتعديل وحذف المركبات
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
          </div>
        </div>
      </div>
    </div>
  )
}