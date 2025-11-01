'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  Calendar, 
  BarChart3, 
  Settings,
  Bell,
  Menu,
  X,
  LogOut,
  Package,
  Calculator,
  Building,
  CreditCard,
  Shield,
  Database,
  MessageSquare,
  HelpCircle,
  Search
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardContent />
    </div>
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
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const menuItems = [
    {
      title: 'الرئيسية',
      items: [
        { id: 'overview', label: 'نظرة عامة', icon: LayoutDashboard },
        { id: 'analytics', label: 'التحليلات', icon: BarChart3 },
        { id: 'reports', label: 'التقارير', icon: Settings },
      ]
    },
    {
      title: 'المبيعات والعملاء',
      items: [
        { id: 'vehicles', label: 'المركبات', icon: Car },
        { id: 'bookings', label: 'الحجوزات', icon: Calendar },
        { id: 'customers', label: 'العملاء', icon: Users },
        { id: 'sales', label: 'المبيعات', icon: CreditCard },
        { id: 'invoices', label: 'الفواتير', icon: CreditCard },
      ]
    },
    {
      title: 'المخزون والعمليات',
      items: [
        { id: 'inventory', label: 'المخزون', icon: Package },
        { id: 'maintenance', label: 'الصيانة', icon: Settings },
        { id: 'suppliers', label: 'الموردون', icon: Building },
      ]
    },
    {
      title: 'المالية والمحاسبة',
      items: [
        { id: 'accounting', label: 'المحاسبة', icon: Calculator },
        { id: 'expenses', label: 'المصروفات', icon: CreditCard },
        { id: 'revenue', label: 'الإيرادات', icon: BarChart3 },
      ]
    },
    {
      title: 'الموارد البشرية',
      items: [
        { id: 'employees', label: 'الموظفون', icon: Users },
        { id: 'payroll', label: 'الرواتب', icon: Calculator },
        { id: 'attendance', label: 'الحضور', icon: Calendar },
      ]
    },
    {
      title: 'النظام والإعدادات',
      items: [
        { id: 'users', label: 'المستخدمون', icon: Users },
        { id: 'permissions', label: 'الصلاحيات', icon: Shield },
        { id: 'settings', label: 'الإعدادات', icon: Settings },
        { id: 'backup', label: 'النسخ الاحتياطي', icon: Database },
      ]
    },
    {
      title: 'التواصل والدعم',
      items: [
        { id: 'notifications', label: 'الإشعارات', icon: Bell },
        { id: 'messages', label: 'الرسائل', icon: MessageSquare },
        { id: 'support', label: 'الدعم الفني', icon: HelpCircle },
      ]
    },
    {
      title: 'الأدوات',
      items: [
        { id: 'search', label: 'بحث', icon: Search },
        { id: 'export', label: 'تصدير', icon: Settings },
      ]
    }
  ]

  const quickActions = [
    { id: 'vehicles', label: 'إضافة مركبة', icon: Car, color: 'bg-blue-500' },
    { id: 'bookings', label: 'حجز جديد', icon: Calendar, color: 'bg-green-500' },
    { id: 'customers', label: 'إضافة عميل', icon: Users, color: 'bg-purple-500' },
    { id: 'invoices', label: 'إنشاء فاتورة', icon: CreditCard, color: 'bg-orange-500' },
  ]

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">جاري التحميل...</p>
        </div>
      </div>
    )
  }

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
                <h1 className="text-xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
                <p className="text-sm text-gray-500">نظام إدارة بيع السيارات</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              الإشعارات
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <span className="text-sm font-medium hidden md:block">المدير</span>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-red-600 hover:text-red-700" 
                onClick={() => router.push('/logout')}
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static lg:translate-x-0 z-30 w-64 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out`}>
          <nav className="p-4 space-y-6 overflow-y-auto">
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
                        onClick={() => setActiveTab(item.id)}
                        className={`w-full flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors ${
                          activeTab === item.id
                            ? 'bg-blue-50 text-blue-600 border-r-2 border-blue-600'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`}
                      >
                        <Icon className="h-4 w-4" />
                        {item.label}
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
          {activeTab === 'overview' && (
            <div>
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">نظرة عامة</h2>
                <p className="text-gray-600">ملخص عن أداء النظام والحالة العامة</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي المركبات</CardTitle>
                    <Car className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData?.stats?.totalVehicles || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      متاح: {dashboardData?.stats?.availableVehicles || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData?.stats?.totalCustomers || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      هذا الشهر
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الحجوزات اليوم</CardTitle>
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData?.stats?.todayBookings || 0}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      قيد الانتظار: {dashboardData?.stats?.pendingBookings || 0}
                    </p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {dashboardData?.stats?.totalRevenue || 0} ج.م
                    </div>
                    <p className="text-xs text-muted-foreground">
                      هذا الشهر: {dashboardData?.stats?.monthlyRevenue || 0} ج.م
                    </p>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Actions */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {quickActions.map((action) => {
                    const Icon = action.icon
                    return (
                      <Button
                        key={action.id}
                        onClick={() => setActiveTab(action.id)}
                        className={`h-auto p-4 text-white ${action.color}`}
                      >
                        <div className="flex flex-col items-center gap-2">
                          <Icon className="h-6 w-6" />
                          <span className="text-sm font-medium">{action.label}</span>
                        </div>
                      </Button>
                    )
                  })}
                </div>
              </div>

              {/* Recent Activity */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle>الحجوزات الأخيرة</CardTitle>
                    <CardDescription>آخر الحجوزات في النظام</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(dashboardData?.recentBookings) && dashboardData.recentBookings.slice(0, 5).map((booking: any, index: number) => (
                        <div key={booking?.id || index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{booking?.customerName || 'غير محدد'}</p>
                            <p className="text-sm text-muted-foreground">
                              {booking?.vehicleName || 'غير محدد'} - {booking?.date || 'غير محدد'}
                            </p>
                          </div>
                          <Badge variant="secondary">
                            {booking?.status || 'قيد الانتظار'}
                          </Badge>
                        </div>
                      )) || (
                        <p className="text-muted-foreground">لا توجد حجوزات حديثة</p>
                      )}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>المركبات الأخيرة</CardTitle>
                    <CardDescription>آخر المركبات المضافة</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {Array.isArray(dashboardData?.recentVehicles) && dashboardData.recentVehicles.slice(0, 5).map((vehicle: any, index: number) => (
                        <div key={vehicle?.id || index} className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">
                              {vehicle?.make || ''} {vehicle?.model || ''} {vehicle?.year || ''}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {vehicle?.price || 0} ج.م
                            </p>
                          </div>
                          <Badge variant="outline">
                            {vehicle?.status || 'متاح'}
                          </Badge>
                        </div>
                      )) || (
                        <p className="text-muted-foreground">لا توجد مركبات حديثة</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Placeholder content for other tabs */}
          {activeTab !== 'overview' && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <Settings className="h-8 w-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {menuItems.find(section => section.items.some(item => item.id === activeTab))?.items.find(item => item.id === activeTab)?.label || 'صفحة غير متوفرة'}
              </h3>
              <p className="text-gray-500">
                هذه الصفحة قيد التطوير. سيتم إضافة المحتوى قريباً.
              </p>
              <Button 
                variant="outline" 
                className="mt-4"
                onClick={() => setActiveTab('overview')}
              >
                العودة للرئيسية
              </Button>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}