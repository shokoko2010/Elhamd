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
  Package,
  Calculator,
  Building,
  CreditCard,
  Shield,
  Database,
  MessageSquare,
  HelpCircle,
  Search,
  Download,
  Upload,
  Wrench,
  UserCheck,
  FileText,
  FileCheck,
  Tool,
  Lock,
  Truck,
  Archive,
  Filter,
  RefreshCw,
  Plus,
  Edit,
  Trash2,
  Printer,
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
  TrendingUp,
  TrendingDown,
  Activity,
  Pulse,
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
  Star,
  Award,
  Target,
  Zap,
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
  Inbox,
  Phone,
  Mail,
  MapPin,
  Euro,
  PoundSterling,
  Yen,
  Thermometer,
  Droplet,
  Wind,
  Cloud,
  CloudRain,
  CloudSnow
} from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview')
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

  const quickActions = [
    { id: 'vehicles', label: 'إضافة مركبة', icon: Car, color: 'bg-blue-500' },
    { id: 'bookings', label: 'حجز جديد', icon: Calendar, color: 'bg-green-500' },
    { id: 'customers', label: 'إضافة عميل', icon: UserPlus, color: 'bg-purple-500' },
    { id: 'invoices', label: 'إنشاء فاتورة', icon: CreditCard, color: 'bg-orange-500' },
    { id: 'maintenance', label: 'صيانة مجدولة', icon: Wrench, color: 'bg-red-500' },
    { id: 'inventory', label: 'طلب قطع غيار', icon: Package, color: 'bg-indigo-500' },
    { id: 'reports', label: 'تقرير مبيعات', icon: BarChart3, color: 'bg-teal-500' },
    { id: 'notifications', label: 'إشعارات جديدة', icon: Bell, color: 'bg-pink-500' },
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
    <div className="space-y-8">
      <div className="overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-500 text-white shadow-xl shadow-blue-200/60">
        <div className="relative flex flex-col gap-6 p-6 sm:p-10 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-xl space-y-2">
            <p className="text-sm font-semibold uppercase tracking-widest text-white/80">لوحة تحكم الإدارة</p>
            <h2 className="text-3xl font-black leading-tight sm:text-4xl">نظرة عامة على الأداء والتشغيل</h2>
            <p className="text-white/80">متابعة فورية للمركبات، الحجوزات، الإيرادات، وإنتاجية الفريق عبر مؤشرات واضحة وإجراءات سريعة.</p>
          </div>
          <div className="grid w-full max-w-lg grid-cols-2 gap-4 rounded-2xl bg-white/10 p-4 backdrop-blur-md sm:grid-cols-4">
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center shadow-inner">
              <p className="text-xs text-white/80">مركبات</p>
              <p className="text-2xl font-bold">{dashboardData?.stats?.totalVehicles || 0}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center shadow-inner">
              <p className="text-xs text-white/80">عملاء</p>
              <p className="text-2xl font-bold">{dashboardData?.stats?.totalCustomers || 0}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center shadow-inner">
              <p className="text-xs text-white/80">حجوزات اليوم</p>
              <p className="text-2xl font-bold">{dashboardData?.stats?.todayBookings || 0}</p>
            </div>
            <div className="rounded-xl bg-white/10 px-4 py-3 text-center shadow-inner">
              <p className="text-xs text-white/80">إيرادات الشهر</p>
              <p className="text-2xl font-bold">{dashboardData?.stats?.monthlyRevenue || 0}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="overflow-hidden border-none bg-gradient-to-br from-blue-50 to-white shadow-lg shadow-blue-100/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-blue-900">إجمالي المركبات</CardTitle>
            <div className="rounded-full bg-blue-100 p-2 text-blue-600">
              <Car className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {dashboardData?.stats?.totalVehicles || 0}
            </div>
            <p className="text-xs text-blue-700/70">
              متاح: {dashboardData?.stats?.availableVehicles || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-cyan-50 to-white shadow-lg shadow-cyan-100/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-cyan-900">إجمالي العملاء</CardTitle>
            <div className="rounded-full bg-cyan-100 p-2 text-cyan-600">
              <Users className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {dashboardData?.stats?.totalCustomers || 0}
            </div>
            <p className="text-xs text-cyan-700/70">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-indigo-50 to-white shadow-lg shadow-indigo-100/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-indigo-900">الحجوزات اليوم</CardTitle>
            <div className="rounded-full bg-indigo-100 p-2 text-indigo-600">
              <Calendar className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {dashboardData?.stats?.todayBookings || 0}
            </div>
            <p className="text-xs text-indigo-700/70">
              قيد الانتظار: {dashboardData?.stats?.pendingBookings || 0}
            </p>
          </CardContent>
        </Card>

        <Card className="overflow-hidden border-none bg-gradient-to-br from-emerald-50 to-white shadow-lg shadow-emerald-100/60">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-semibold text-emerald-900">الإيرادات</CardTitle>
            <div className="rounded-full bg-emerald-100 p-2 text-emerald-600">
              <BarChart3 className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-slate-900">
              {dashboardData?.stats?.totalRevenue || 0} ج.م
            </div>
            <p className="text-xs text-emerald-700/70">
              هذا الشهر: {dashboardData?.stats?.monthlyRevenue || 0} ج.م
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">إجراءات سريعة</h3>
            <p className="text-sm text-gray-500">وصل مباشر لأكثر المهام استخداماً</p>
          </div>
          <Button variant="ghost" size="sm" className="rounded-full border border-blue-100 bg-white text-blue-700 hover:bg-blue-50">
            تخصيص الواجهة
          </Button>
        </div>
        <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <button
                key={action.id}
                onClick={() => window.location.href = `/admin/${action.id}`}
                className="group flex items-center gap-3 rounded-2xl border border-slate-100 bg-white/90 p-4 text-right shadow-sm transition hover:-translate-y-1 hover:shadow-lg hover:shadow-blue-100"
              >
                <span className={`flex h-10 w-10 items-center justify-center rounded-xl text-white ${action.color}`}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-semibold text-slate-900">{action.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-none shadow-lg shadow-blue-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">الحجوزات الأخيرة</CardTitle>
            <CardDescription>آخر الحجوزات في النظام</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(dashboardData?.recentBookings) && dashboardData.recentBookings.slice(0, 5).map((booking: any, index: number) => (
                <div key={booking?.id || index} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50/60 p-3">
                  <div>
                    <p className="font-semibold text-slate-900">{booking?.customerName || 'غير محدد'}</p>
                    <p className="text-sm text-muted-foreground">
                      {booking?.vehicleName || 'غير محدد'} - {booking?.date || 'غير محدد'}
                    </p>
                  </div>
                  <Badge variant="secondary" className="rounded-full bg-blue-50 text-blue-700">
                    {booking?.status || 'قيد الانتظار'}
                  </Badge>
                </div>
              )) || (
                <p className="text-muted-foreground">لا توجد حجوزات حديثة</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-lg shadow-emerald-50">
          <CardHeader>
            <CardTitle className="text-lg font-semibold text-slate-900">المركبات الأخيرة</CardTitle>
            <CardDescription>آخر المركبات المضافة</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Array.isArray(dashboardData?.recentVehicles) && dashboardData.recentVehicles.slice(0, 5).map((vehicle: any, index: number) => (
                <div key={vehicle?.id || index} className="flex items-center justify-between rounded-xl border border-slate-100 bg-white p-3 shadow-sm">
                  <div>
                    <p className="font-semibold text-slate-900">
                      {vehicle?.make || ''} {vehicle?.model || ''} {vehicle?.year || ''}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {vehicle?.price || 0} ج.م
                    </p>
                  </div>
                  <Badge variant="outline" className="rounded-full border-emerald-100 bg-emerald-50 text-emerald-700">
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
  )
}