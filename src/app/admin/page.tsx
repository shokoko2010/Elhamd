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
  Clock,
  Plus,
  Edit,
  Trash2,
  Download,
  Upload,
  Filter,
  RefreshCw,
  LogOut,
  HelpCircle,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Star,
  Award,
  Target,
  Zap,
  Database,
  Server,
  Monitor,
  Smartphone,
  Globe,
  Cpu,
  HardDrive,
  Wifi,
  Battery,
  Volume2,
  Sun,
  Moon,
  User,
  UserPlus,
  UserMinus,
  Key,
  Eye,
  EyeOff,
  Copy,
  Share2,
  Link,
  Paperclip,
  Image,
  Video,
  Music,
  Camera,
  Mic,
  Headphones,
  Printer,
  Save,
  Undo,
  Redo,
  ZoomIn,
  ZoomOut,
  Maximize,
  Minimize,
  RotateCw,
  RotateCcw,
  Move,
  Scissors,
  Clipboard,
  Archive,
  Inbox,
  Send,
  Reply,
  Forward,
  Flag,
  Bookmark,
  Heart,
  ThumbsUp,
  ThumbsDown,
  AtSign,
  Hash,
  DollarSign,
  Euro,
  PoundSterling,
  Yen,
  TrendingDown,
  Activity,
  Pulse,
  Thermometer,
  Droplet,
  Wind,
  Cloud,
  CloudRain,
  CloudSnow,
  AlertTriangle,
  XCircle,
  Info,
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  ArrowUp,
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  MoreVertical,
  MoreHorizontal,
  PlusCircle,
  MinusCircle,
  CheckSquare,
  Square,
  Radio,
  Checkbox,
  Truck
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
        { id: 'reports', label: 'التقارير', icon: FileText },
      ]
    },
    {
      title: 'المبيعات والعملاء',
      items: [
        { id: 'vehicles', label: 'المركبات', icon: Car },
        { id: 'bookings', label: 'الحجوزات', icon: Calendar },
        { id: 'personnel', label: 'الأفراد', icon: Users },
        { id: 'customers', label: 'العملاء', icon: UserPlus },
        { id: 'sales', label: 'المبيعات', icon: DollarSign },
        { id: 'quotations', label: 'عروض الأسعار', icon: FileCheck },
        { id: 'invoices', label: 'الفواتير', icon: CreditCard },
      ]
    },
    {
      title: 'المخزون والعمليات',
      items: [
        { id: 'inventory', label: 'المخزون', icon: Package },
        { id: 'maintenance', label: 'الصيانة', icon: Wrench },
        { id: 'service', label: 'الخدمات', icon: Tool },
        { id: 'parts', label: 'قطع الغيار', icon: Settings },
        { id: 'suppliers', label: 'الموردون', icon: Truck },
        { id: 'warehouse', label: 'المستودع', icon: Building },
      ]
    },
    {
      title: 'الموارد البشرية',
      items: [
        { id: 'hr', label: 'الموارد البشرية', icon: Building },
        { id: 'employees', label: 'الموظفون', icon: UserCheck },
        { id: 'attendance', label: 'الحضور والانصراف', icon: Clock },
        { id: 'payroll', label: 'الرواتب', icon: Calculator },
        { id: 'leaves', label: 'الإجازات', icon: Calendar },
        { id: 'performance', label: 'تقييم الأداء', icon: Award },
      ]
    },
    {
      title: 'المالية والمحاسبة',
      items: [
        { id: 'accounting', label: 'المحاسبة', icon: Calculator },
        { id: 'expenses', label: 'المصروفات', icon: CreditCard },
        { id: 'revenue', label: 'الإيرادات', icon: TrendingUp },
        { id: 'budget', label: 'الميزانية', icon: Target },
        { id: 'tax', label: 'الضرائب', icon: FileText },
        { id: 'banking', label: 'الحسابات البنكية', icon: Building },
      ]
    },
    {
      title: 'العقود والقانون',
      items: [
        { id: 'contracts', label: 'العقود', icon: FileText },
        { id: 'legal', label: 'الشؤون القانونية', icon: Shield },
        { id: 'insurance', label: 'التأمين', icon: Shield },
        { id: 'documents', label: 'الوثائق', icon: Archive },
      ]
    },
    {
      title: 'النظام والإعدادات',
      items: [
        { id: 'permissions', label: 'الصلاحيات', icon: Lock },
        { id: 'users', label: 'المستخدمون', icon: Users },
        { id: 'roles', label: 'الأدوار', icon: UserCheck },
        { id: 'settings', label: 'الإعدادات', icon: Settings },
        { id: 'backup', label: 'النسخ الاحتياطي', icon: Database },
        { id: 'logs', label: 'السجلات', icon: FileText },
      ]
    },
    {
      title: 'التواصل والدعم',
      items: [
        { id: 'notifications', label: 'الإشعارات', icon: Bell },
        { id: 'messages', label: 'الرسائل', icon: MessageSquare },
        { id: 'support', label: 'الدعم الفني', icon: HelpCircle },
        { id: 'feedback', label: 'ملاحظات', icon: MessageSquare },
        { id: 'contact', label: 'اتصل بنا', icon: Phone },
      ]
    },
    {
      title: 'الأدوات والبحث',
      items: [
        { id: 'search', label: 'بحث', icon: Search },
        { id: 'filter', label: 'تصفية', icon: Filter },
        { id: 'export', label: 'تصدير', icon: Download },
        { id: 'import', label: 'استيراد', icon: Upload },
        { id: 'print', label: 'طباعة', icon: Printer },
      ]
    }
  ]

  const quickActionItems = [
    {
      title: 'إضافة مركبة جديدة',
      description: 'إضافة سيارة جديدة للمعرض',
      icon: Car,
      action: () => router.push('/admin/vehicles?action=add'),
      color: 'bg-blue-500 hover:bg-blue-600',
      badge: null
    },
    {
      title: 'حجز قيادة تجريبية',
      description: 'إنشاء حجز جديد لقيادة تجريبية',
      icon: Calendar,
      action: () => router.push('/admin/bookings?action=create&type=test-drive'),
      color: 'bg-green-500 hover:bg-green-600',
      badge: quickActions.pendingBookings || null
    },
    {
      title: 'إضافة عميل جديد',
      description: 'تسجيل عميل جديد في النظام',
      icon: UserPlus,
      action: () => router.push('/admin/customers?action=add'),
      color: 'bg-purple-500 hover:bg-purple-600',
      badge: null
    },
    {
      title: 'إنشاء فاتورة',
      description: 'إصدار فاتورة بيع جديدة',
      icon: CreditCard,
      action: () => router.push('/admin/invoices?action=create'),
      color: 'bg-orange-500 hover:bg-orange-600',
      badge: null
    },
    {
      title: 'صيانة مجدولة',
      description: 'جدولة صيانة للمركبات',
      icon: Wrench,
      action: () => router.push('/admin/maintenance?action=schedule'),
      color: 'bg-red-500 hover:bg-red-600',
      badge: quickActions.pendingMaintenance || null
    },
    {
      title: 'طلب قطع غيار',
      description: 'طلب قطع غيار من الموردين',
      icon: Package,
      action: () => router.push('/admin/inventory/purchase-orders?action=create'),
      color: 'bg-indigo-500 hover:bg-indigo-600',
      badge: null
    },
    {
      title: 'تقرير مبيعات',
      description: 'عرض تقرير المبيعات الشهري',
      icon: BarChart3,
      action: () => router.push('/admin/reports?type=sales'),
      color: 'bg-teal-500 hover:bg-teal-600',
      badge: null
    },
    {
      title: 'إشعارات جديدة',
      description: 'عرض الإشعارات غير المقروءة',
      icon: Bell,
      action: () => router.push('/admin/notifications'),
      color: 'bg-pink-500 hover:bg-pink-600',
      badge: quickActions.pendingNotifications || null
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
                <h1 className="text-xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
                <p className="text-sm text-gray-500">نظام إدارة بيع السيارات</p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden md:flex items-center gap-2">
              <Button variant="outline" size="sm">
                <Plus className="h-4 w-4 mr-2" />
                جديد
              </Button>
              <Button variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                تحديث
              </Button>
              <Button variant="outline" size="sm">
                <Download className="h-4 w-4 mr-2" />
                تصدير
              </Button>
            </div>
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
              <span className="text-sm font-medium hidden md:block">المدير</span>
              <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className={`${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed lg:static lg:translate-x-0 z-30 w-64 h-full bg-white shadow-lg transition-transform duration-300 ease-in-out flex flex-col`}>
          <nav className="flex-1 p-4 space-y-6 overflow-y-auto">
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
                        <Icon className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{item.label}</span>
                        {item.id === 'notifications' && quickActions.pendingNotifications > 0 && (
                          <Badge variant="destructive" className="mr-auto h-5 w-5 p-0 flex items-center justify-center text-xs flex-shrink-0">
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
          
          {/* Sidebar Footer */}
          <div className="p-4 border-t border-gray-200 space-y-2">
            <Button variant="outline" size="sm" className="w-full justify-start">
              <HelpCircle className="h-4 w-4 mr-2" />
              المساعدة
            </Button>
            <Button variant="outline" size="sm" className="w-full justify-start text-red-600 hover:text-red-700">
              <LogOut className="h-4 w-4 mr-2" />
              تسجيل الخروج
            </Button>
            <div className="text-xs text-gray-500 text-center pt-2">
              نسخة 1.0.0
            </div>
          </div>
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
              {/* Overview Tab - Quick Actions Only */}
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
                      <Button 
                        size="sm" 
                        className="mt-2 bg-red-600 hover:bg-red-700"
                        onClick={() => router.push('/admin/finance/payments?status=overdue')}
                      >
                        معاينة
                      </Button>
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
                      <Button 
                        size="sm" 
                        className="mt-2 bg-yellow-600 hover:bg-yellow-700"
                        onClick={() => router.push('/admin/bookings?status=pending')}
                      >
                        معاينة
                      </Button>
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
                      <Button 
                        size="sm" 
                        className="mt-2 bg-green-600 hover:bg-green-700"
                        onClick={() => router.push('/admin/vehicles?status=available')}
                      >
                        معاينة
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Actions Grid */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">الإجراءات السريعة</h2>
                      <p className="text-gray-600">الوصول السريع لأهم الوظائف اليومية</p>
                    </div>
                    <Button variant="outline" onClick={() => window.location.reload()}>
                      <RefreshCw className="h-4 w-4 mr-2" />
                      تحديث
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {quickActionItems.map((action, index) => {
                      const Icon = action.icon
                      return (
                        <Card 
                          key={index} 
                          className="group cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-blue-200"
                          onClick={action.action}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center text-white group-hover:scale-110 transition-transform`}>
                                <Icon className="h-6 w-6" />
                              </div>
                              {action.badge && (
                                <Badge variant="destructive" className="h-6 w-6 p-0 flex items-center justify-center text-xs">
                                  {action.badge}
                                </Badge>
                              )}
                            </div>
                            <h3 className="font-semibold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                              {action.title}
                            </h3>
                            <p className="text-sm text-gray-600">
                              {action.description}
                            </p>
                          </CardContent>
                        </Card>
                      )
                    })}
                  </div>
                </div>

                {/* Quick Stats */}
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
              {[
                'reports', 'customers', 'sales', 'quotations', 'invoices', 'service', 'parts', 'suppliers', 'warehouse',
                'employees', 'attendance', 'payroll', 'leaves', 'performance', 'expenses', 'revenue', 'budget', 'tax', 'banking',
                'legal', 'insurance', 'documents', 'users', 'roles', 'settings', 'backup', 'logs', 'messages', 'support', 'feedback', 'contact',
                'filter', 'export', 'import', 'print', 'inventory', 'hr', 'accounting', 'contracts', 'maintenance', 'permissions', 'search', 'notifications', 'analytics'
              ].map((tab) => (
                <TabsContent key={tab} value={tab} className="space-y-6">
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-900">
                        {tab === 'reports' && 'التقارير'}
                        {tab === 'customers' && 'إدارة العملاء'}
                        {tab === 'sales' && 'المبيعات'}
                        {tab === 'quotations' && 'عروض الأسعار'}
                        {tab === 'invoices' && 'الفواتير'}
                        {tab === 'service' && 'الخدمات'}
                        {tab === 'parts' && 'قطع الغيار'}
                        {tab === 'suppliers' && 'الموردون'}
                        {tab === 'warehouse' && 'المستودع'}
                        {tab === 'employees' && 'الموظفون'}
                        {tab === 'attendance' && 'الحضور والانصراف'}
                        {tab === 'payroll' && 'الرواتب'}
                        {tab === 'leaves' && 'الإجازات'}
                        {tab === 'performance' && 'تقييم الأداء'}
                        {tab === 'expenses' && 'المصروفات'}
                        {tab === 'revenue' && 'الإيرادات'}
                        {tab === 'budget' && 'الميزانية'}
                        {tab === 'tax' && 'الضرائب'}
                        {tab === 'banking' && 'الحسابات البنكية'}
                        {tab === 'legal' && 'الشؤون القانونية'}
                        {tab === 'insurance' && 'التأمين'}
                        {tab === 'documents' && 'الوثائق'}
                        {tab === 'users' && 'المستخدمون'}
                        {tab === 'roles' && 'الأدوار'}
                        {tab === 'settings' && 'الإعدادات'}
                        {tab === 'backup' && 'النسخ الاحتياطي'}
                        {tab === 'logs' && 'السجلات'}
                        {tab === 'messages' && 'الرسائل'}
                        {tab === 'support' && 'الدعم الفني'}
                        {tab === 'feedback' && 'ملاحظات'}
                        {tab === 'contact' && 'اتصل بنا'}
                        {tab === 'filter' && 'التصفية'}
                        {tab === 'export' && 'التصدير'}
                        {tab === 'import' && 'الاستيراد'}
                        {tab === 'print' && 'الطباعة'}
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
                        {tab === 'reports' && 'عرض وتصدير التقارير المختلفة'}
                        {tab === 'customers' && 'إدارة بيانات العملاء والتفاعلات'}
                        {tab === 'sales' && 'إدارة عمليات البيع والمتابعة'}
                        {tab === 'quotations' && 'إنشاء وإدارة عروض الأسعار'}
                        {tab === 'invoices' && 'إدارة الفواتير والمدفوعات'}
                        {tab === 'service' && 'إدارة خدمات الصيانة والإصلاح'}
                        {tab === 'parts' && 'إدارة قطع الغيار والمستلزمات'}
                        {tab === 'suppliers' && 'إدارة بيانات الموردين والطلبات'}
                        {tab === 'warehouse' && 'إدارة المستودعات والمخزون'}
                        {tab === 'employees' && 'إدارة بيانات الموظفين'}
                        {tab === 'attendance' && 'تتبع الحضور والانصراف'}
                        {tab === 'payroll' && 'إدارة الرواتب والحوافز'}
                        {tab === 'leaves' && 'إدارة طلبات الإجازات'}
                        {tab === 'performance' && 'تقييم أداء الموظفين'}
                        {tab === 'expenses' && 'تتبع وإدارة المصروفات'}
                        {tab === 'revenue' && 'تتبع الإيرادات والأرباح'}
                        {tab === 'budget' && 'إدارة الميزانيات والتخطيط'}
                        {tab === 'tax' && 'إدارة الضرائب والإقرارات'}
                        {tab === 'banking' && 'إدارة الحسابات البنكية والتحويلات'}
                        {tab === 'legal' && 'إدارة الشؤون القانونية والاستشارات'}
                        {tab === 'insurance' && 'إدارة وثائق التأمين والتعويضات'}
                        {tab === 'documents' && 'إدارة الوثائق والأرشيف'}
                        {tab === 'users' && 'إدارة حسابات المستخدمين'}
                        {tab === 'roles' && 'إدارة الأدوار والصلاحيات'}
                        {tab === 'settings' && 'إعدادات النظام والتكوين'}
                        {tab === 'backup' && 'إدارة النسخ الاحتياطية والاستعادة'}
                        {tab === 'logs' && 'عرض سجلات النظام والنشاط'}
                        {tab === 'messages' && 'إدارة الرسائل والتواصل'}
                        {tab === 'support' && 'الدعم الفني وحل المشكلات'}
                        {tab === 'feedback' && 'جمع ملاحظات العملاء والموظفين'}
                        {tab === 'contact' && 'معلومات الاتصال والتواصل'}
                        {tab === 'filter' && 'تصفية البحث والنتائج'}
                        {tab === 'export' && 'تصدير البيانات والتقارير'}
                        {tab === 'import' && 'استيراد البيانات من مصادر مختلفة'}
                        {tab === 'print' && 'طباعة التقارير والوثائق'}
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
                    <Button>
                      <Plus className="mr-2 h-4 w-4" />
                      إضافة جديد
                    </Button>
                  </div>
                  <Card>
                    <CardContent className="p-12 text-center">
                      <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        {tab === 'reports' && <FileText className="h-8 w-8 text-gray-400" />}
                        {tab === 'customers' && <Users className="h-8 w-8 text-gray-400" />}
                        {tab === 'sales' && <DollarSign className="h-8 w-8 text-gray-400" />}
                        {tab === 'quotations' && <FileCheck className="h-8 w-8 text-gray-400" />}
                        {tab === 'invoices' && <CreditCard className="h-8 w-8 text-gray-400" />}
                        {tab === 'service' && <Wrench className="h-8 w-8 text-gray-400" />}
                        {tab === 'parts' && <Settings className="h-8 w-8 text-gray-400" />}
                        {tab === 'suppliers' && <Truck className="h-8 w-8 text-gray-400" />}
                        {tab === 'warehouse' && <Building className="h-8 w-8 text-gray-400" />}
                        {tab === 'employees' && <UserCheck className="h-8 w-8 text-gray-400" />}
                        {tab === 'attendance' && <Clock className="h-8 w-8 text-gray-400" />}
                        {tab === 'payroll' && <Calculator className="h-8 w-8 text-gray-400" />}
                        {tab === 'leaves' && <Calendar className="h-8 w-8 text-gray-400" />}
                        {tab === 'performance' && <Award className="h-8 w-8 text-gray-400" />}
                        {tab === 'expenses' && <CreditCard className="h-8 w-8 text-gray-400" />}
                        {tab === 'revenue' && <TrendingUp className="h-8 w-8 text-gray-400" />}
                        {tab === 'budget' && <Target className="h-8 w-8 text-gray-400" />}
                        {tab === 'tax' && <FileText className="h-8 w-8 text-gray-400" />}
                        {tab === 'banking' && <Building className="h-8 w-8 text-gray-400" />}
                        {tab === 'legal' && <Shield className="h-8 w-8 text-gray-400" />}
                        {tab === 'insurance' && <Shield className="h-8 w-8 text-gray-400" />}
                        {tab === 'documents' && <Archive className="h-8 w-8 text-gray-400" />}
                        {tab === 'users' && <Users className="h-8 w-8 text-gray-400" />}
                        {tab === 'roles' && <UserCheck className="h-8 w-8 text-gray-400" />}
                        {tab === 'settings' && <Settings className="h-8 w-8 text-gray-400" />}
                        {tab === 'backup' && <Database className="h-8 w-8 text-gray-400" />}
                        {tab === 'logs' && <FileText className="h-8 w-8 text-gray-400" />}
                        {tab === 'messages' && <MessageSquare className="h-8 w-8 text-gray-400" />}
                        {tab === 'support' && <HelpCircle className="h-8 w-8 text-gray-400" />}
                        {tab === 'feedback' && <MessageSquare className="h-8 w-8 text-gray-400" />}
                        {tab === 'contact' && <Phone className="h-8 w-8 text-gray-400" />}
                        {tab === 'filter' && <Filter className="h-8 w-8 text-gray-400" />}
                        {tab === 'export' && <Download className="h-8 w-8 text-gray-400" />}
                        {tab === 'import' && <Upload className="h-8 w-8 text-gray-400" />}
                        {tab === 'print' && <Printer className="h-8 w-8 text-gray-400" />}
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
                        {tab === 'reports' && 'التقارير'}
                        {tab === 'customers' && 'إدارة العملاء'}
                        {tab === 'sales' && 'المبيعات'}
                        {tab === 'quotations' && 'عروض الأسعار'}
                        {tab === 'invoices' && 'الفواتير'}
                        {tab === 'service' && 'الخدمات'}
                        {tab === 'parts' && 'قطع الغيار'}
                        {tab === 'suppliers' && 'الموردون'}
                        {tab === 'warehouse' && 'المستودع'}
                        {tab === 'employees' && 'الموظفون'}
                        {tab === 'attendance' && 'الحضور والانصراف'}
                        {tab === 'payroll' && 'الرواتب'}
                        {tab === 'leaves' && 'الإجازات'}
                        {tab === 'performance' && 'تقييم الأداء'}
                        {tab === 'expenses' && 'المصروفات'}
                        {tab === 'revenue' && 'الإيرادات'}
                        {tab === 'budget' && 'الميزانية'}
                        {tab === 'tax' && 'الضرائب'}
                        {tab === 'banking' && 'الحسابات البنكية'}
                        {tab === 'legal' && 'الشؤون القانونية'}
                        {tab === 'insurance' && 'التأمين'}
                        {tab === 'documents' && 'الوثائق'}
                        {tab === 'users' && 'المستخدمون'}
                        {tab === 'roles' && 'الأدوار'}
                        {tab === 'settings' && 'الإعدادات'}
                        {tab === 'backup' && 'النسخ الاحتياطي'}
                        {tab === 'logs' && 'السجلات'}
                        {tab === 'messages' && 'الرسائل'}
                        {tab === 'support' && 'الدعم الفني'}
                        {tab === 'feedback' && 'ملاحظات'}
                        {tab === 'contact' && 'اتصل بنا'}
                        {tab === 'filter' && 'التصفية'}
                        {tab === 'export' && 'التصدير'}
                        {tab === 'import' && 'الاستيراد'}
                        {tab === 'print' && 'الطباعة'}
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
                      <div className="flex gap-2 justify-center">
                        <Button variant="outline">قريباً</Button>
                        <Button variant="outline">
                          <HelpCircle className="mr-2 h-4 w-4" />
                          المساعدة
                        </Button>
                      </div>
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