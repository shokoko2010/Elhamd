'use client'

import { useState, useEffect } from 'react'
import { CustomerRoute } from '@/components/auth/CustomerRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  LayoutDashboard, 
  Car, 
  Calendar, 
  Wrench, 
  User,
  Settings,
  Bell,
  CreditCard,
  FileText,
  Star,
  Clock,
  MapPin,
  Phone,
  Mail,
  Eye,
  Edit
} from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth-safe'

interface CustomerBooking {
  id: string
  type: 'test-drive' | 'service'
  vehicleName: string
  date: string
  time: string
  status: 'pending' | 'confirmed' | 'completed' | 'cancelled'
  location?: string
  notes?: string
}

interface CustomerVehicle {
  id: string
  make: string
  model: string
  year: number
  licensePlate: string
  status: string
  lastService?: string
  nextService?: string
}

interface CustomerProfile {
  id: string
  name: string
  email: string
  phone: string
  address: string
  licenseNumber?: string
  joinDate: string
  totalBookings: number
  completedBookings: number
  favoriteVehicleType?: string
}

export default function CustomerDashboard() {
  return (
    <CustomerRoute>
      <DashboardContent />
    </CustomerRoute>
  )
}

function DashboardContent() {
  const { user } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [bookings, setBookings] = useState<CustomerBooking[]>([])
  const [vehicles, setVehicles] = useState<CustomerVehicle[]>([])
  const [profile, setProfile] = useState<CustomerProfile | null>(null)

  useEffect(() => {
    fetchCustomerData()
  }, [])

  const fetchCustomerData = async () => {
    try {
      setLoading(true)
      
      // Fetch customer bookings
      const bookingsResponse = await fetch('/api/customer/bookings')
      if (bookingsResponse.ok) {
        const bookingsData = await bookingsResponse.json()
        setBookings(bookingsData.bookings || [])
      }

      // Fetch customer vehicles
      const vehiclesResponse = await fetch('/api/customer/vehicles')
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json()
        setVehicles(vehiclesData.vehicles || [])
      }

      // Fetch customer profile
      const profileResponse = await fetch('/api/customer/profile')
      if (profileResponse.ok) {
        const profileData = await profileResponse.json()
        setProfile(profileData.profile)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load customer data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'قيد الانتظار', color: 'bg-yellow-100 text-yellow-800' },
      confirmed: { variant: 'default' as const, label: 'مؤكد', color: 'bg-green-100 text-green-800' },
      completed: { variant: 'outline' as const, label: 'مكتمل', color: 'bg-blue-100 text-blue-800' },
      cancelled: { variant: 'destructive' as const, label: 'ملغي', color: 'bg-red-100 text-red-800' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    return <Badge className={config.color}>{config.label}</Badge>
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getBookingTypeIcon = (type: string) => {
    return type === 'test-drive' ? <Car className="w-4 h-4" /> : <Wrench className="w-4 h-4" />
  }

  const getBookingTypeLabel = (type: string) => {
    return type === 'test-drive' ? 'قيادة تجريبية' : 'خدمة صيانة'
  }

  const stats = {
    totalBookings: bookings.length,
    pendingBookings: bookings.filter(b => b.status === 'pending').length,
    completedBookings: bookings.filter(b => b.status === 'completed').length,
    upcomingBookings: bookings.filter(b => new Date(b.date) > new Date()).length
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">لوحة التحكم الخاصة بك</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Bell className="w-4 h-4 ml-2" />
                الإشعارات
              </Button>
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 ml-2" />
                الإعدادات
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900">
            مرحباً بك، {profile?.name || user?.name || 'عميل عزيز'}
          </h2>
          <p className="text-gray-600 mt-2">
            إدارة حجوزاتك ومركباتك وملفك الشخصي بكل سهولة
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي الحجوزات</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalBookings}</div>
              <p className="text-xs text-muted-foreground">
                منذ الانضمام
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">حجوزات قيد الانتظار</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.pendingBookings}</div>
              <p className="text-xs text-muted-foreground">
                تحتاج إلى تأكيد
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الحجوزات المكتملة</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.completedBookings}</div>
              <p className="text-xs text-muted-foreground">
                خدمات مكتملة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الحجوزات القادمة</CardTitle>
              <Car className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.upcomingBookings}</div>
              <p className="text-xs text-muted-foreground">
                مقررة قريباً
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="bookings">حجوزاتي</TabsTrigger>
            <TabsTrigger value="vehicles">مركباتي</TabsTrigger>
            <TabsTrigger value="profile">ملفي الشخصي</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Bookings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>أحدث الحجوزات</CardTitle>
                    <CardDescription>آخر حجوزاتك وأنشطتك</CardDescription>
                  </div>
                  <Button onClick={() => setActiveTab('bookings')}>
                    <Eye className="w-4 h-4 ml-2" />
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-8">
                    <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حجوزات</h3>
                    <p className="text-gray-500 mb-4">
                      قم بحجز قيادة تجريبية أو خدمة صيانة للبدء
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => router.push('/(public)/test-drive')}>
                        <Car className="w-4 h-4 ml-2" />
                        حجز قيادة تجريبية
                      </Button>
                      <Button onClick={() => router.push('/(public)/service-booking')} variant="outline">
                        <Wrench className="w-4 h-4 ml-2" />
                        حجز خدمة صيانة
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.slice(0, 5).map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {getBookingTypeIcon(booking.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{booking.vehicleName}</h3>
                            <p className="text-sm text-gray-600">
                              {getBookingTypeLabel(booking.type)} • {formatDate(booking.date)} • {booking.time}
                            </p>
                            {booking.location && (
                              <p className="text-xs text-gray-500">
                                <MapPin className="w-3 h-3 inline ml-1" />
                                {booking.location}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(booking.status)}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 ml-1" />
                            عرض
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-blue-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-blue-600">حجز قيادة تجريبية</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    جرب أحدث مركباتنا قبل الشراء
                  </p>
                  <Button onClick={() => router.push('/(public)/test-drive')} className="w-full">
                    <Car className="w-4 h-4 ml-2" />
                    احجز الآن
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-green-600">حجز خدمة صيانة</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    صيانة احترافية لمركبتك
                  </p>
                  <Button onClick={() => router.push('/(public)/service-booking')} className="w-full">
                    <Wrench className="w-4 h-4 ml-2" />
                    احجز الآن
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-purple-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-purple-600">تصفح المركبات</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-gray-600 mb-4">
                    اكتشف مجموعة مركباتنا
                  </p>
                  <Button onClick={() => router.push('/(public)/vehicles')} className="w-full">
                    <Car className="w-4 h-4 ml-2" />
                    تصفح الآن
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="bookings" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>حجوزاتي</CardTitle>
                    <CardDescription>جميع حجوزاتك القيادة التجريبية والخدمات</CardDescription>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={() => router.push('/(public)/test-drive')}>
                      <Car className="w-4 h-4 ml-2" />
                      قيادة تجريبية
                    </Button>
                    <Button onClick={() => router.push('/(public)/service-booking')} variant="outline">
                      <Wrench className="w-4 h-4 ml-2" />
                      خدمة صيانة
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : bookings.length === 0 ? (
                  <div className="text-center py-12">
                    <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد حجوزات</h3>
                    <p className="text-gray-500 mb-4">
                      قم بحجز قيادة تجريبية أو خدمة صيانة للبدء
                    </p>
                    <div className="flex gap-2 justify-center">
                      <Button onClick={() => router.push('/(public)/test-drive')}>
                        <Car className="w-4 h-4 ml-2" />
                        حجز قيادة تجريبية
                      </Button>
                      <Button onClick={() => router.push('/(public)/service-booking')} variant="outline">
                        <Wrench className="w-4 h-4 ml-2" />
                        حجز خدمة صيانة
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookings.map((booking) => (
                      <div key={booking.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                            {getBookingTypeIcon(booking.type)}
                          </div>
                          <div>
                            <h3 className="font-semibold">{booking.vehicleName}</h3>
                            <p className="text-sm text-gray-600">
                              {getBookingTypeLabel(booking.type)} • {formatDate(booking.date)} • {booking.time}
                            </p>
                            {booking.location && (
                              <p className="text-xs text-gray-500">
                                <MapPin className="w-3 h-3 inline ml-1" />
                                {booking.location}
                              </p>
                            )}
                            {booking.notes && (
                              <p className="text-xs text-gray-500 mt-1">
                                ملاحظات: {booking.notes}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          {getStatusBadge(booking.status)}
                          <Button variant="outline" size="sm">
                            <Eye className="w-4 h-4 ml-1" />
                            عرض التفاصيل
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="vehicles" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>مركباتي</CardTitle>
                    <CardDescription>إدارة مركباتك وتاريخ الصيانة</CardDescription>
                  </div>
                  <Button>
                    <Car className="w-4 h-4 ml-2" />
                    إضافة مركبة
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : vehicles.length === 0 ? (
                  <div className="text-center py-12">
                    <Car className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا توجد مركبات</h3>
                    <p className="text-gray-500 mb-4">
                      أضف مركباتك لتتبع الصيانة والحصول على خدمات مخصصة
                    </p>
                    <Button>
                      <Car className="w-4 h-4 ml-2" />
                      إضافة مركبة
                    </Button>
                  </div>
                ) : (
                  <div className="grid gap-4">
                    {vehicles.map((vehicle) => (
                      <div key={vehicle.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                            <Car className="w-5 h-5 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-semibold">{vehicle.make} {vehicle.model}</h3>
                            <p className="text-sm text-gray-600">
                              {vehicle.year} • {vehicle.licensePlate}
                            </p>
                            <div className="flex items-center gap-4 mt-1">
                              {vehicle.lastService && (
                                <span className="text-xs text-gray-500">
                                  آخر خدمة: {formatDate(vehicle.lastService)}
                                </span>
                              )}
                              {vehicle.nextService && (
                                <span className="text-xs text-blue-600">
                                  الخدمة القادمة: {formatDate(vehicle.nextService)}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant={vehicle.status === 'active' ? 'default' : 'secondary'}>
                            {vehicle.status === 'active' ? 'نشط' : 'غير نشط'}
                          </Badge>
                          <Button variant="outline" size="sm">
                            <Edit className="w-4 h-4 ml-1" />
                            تعديل
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>ملفي الشخصي</CardTitle>
                    <CardDescription>إدارة معلوماتك الشخصية وإعدادات الحساب</CardDescription>
                  </div>
                  <Button>
                    <Edit className="w-4 h-4 ml-2" />
                    تعديل الملف
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="flex items-center justify-center h-32">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                  </div>
                ) : profile ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">المعلومات الشخصية</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <User className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">الاسم الكامل</p>
                            <p className="font-medium">{profile.name}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Mail className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">البريد الإلكتروني</p>
                            <p className="font-medium">{profile.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Phone className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">رقم الهاتف</p>
                            <p className="font-medium">{profile.phone}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">العنوان</p>
                            <p className="font-medium">{profile.address}</p>
                          </div>
                        </div>
                        {profile.licenseNumber && (
                          <div className="flex items-center gap-3">
                            <CreditCard className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">رقم رخصة القيادة</p>
                              <p className="font-medium">{profile.licenseNumber}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold mb-4">معلومات الحساب</h3>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <Calendar className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">تاريخ الانضمام</p>
                            <p className="font-medium">{formatDate(profile.joinDate)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">إجمالي الحجوزات</p>
                            <p className="font-medium">{profile.totalBookings} حجز</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Star className="w-5 h-5 text-gray-400" />
                          <div>
                            <p className="text-sm text-gray-500">الحجوزات المكتملة</p>
                            <p className="font-medium">{profile.completedBookings} حجز</p>
                          </div>
                        </div>
                        {profile.favoriteVehicleType && (
                          <div className="flex items-center gap-3">
                            <Car className="w-5 h-5 text-gray-400" />
                            <div>
                              <p className="text-sm text-gray-500">نوع المركبة المفضل</p>
                              <p className="font-medium">{profile.favoriteVehicleType}</p>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">لا يمكن تحميل الملف الشخصي</h3>
                    <p className="text-gray-500">يرجى المحاولة مرة أخرى لاحقاً</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}