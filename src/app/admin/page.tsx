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
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">نظرة عامة</h2>
        <p className="text-gray-600">ملخص عن أداء النظام والحالة العامة</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">إجراءات سريعة</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Button
                key={action.id}
                onClick={() => window.location.href = `/admin/${action.id}`}
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
  )
}