'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Car, Users, Calendar, BarChart3, Bell, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function AdminDashboard() {
  const router = useRouter()
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
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <Car className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">لوحة تحكم الإدارة</h1>
              <p className="text-sm text-gray-500">نظام إدارة بيع السيارات</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              الإشعارات
            </Button>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
              <span className="text-sm font-medium">المدير</span>
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

      {/* Main Content */}
      <main className="p-6">
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

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>الحجوزات الأخيرة</CardTitle>
              <CardDescription>آخر الحجوزات في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {Array.isArray(dashboardData?.recentBookings) && dashboardData.recentBookings.slice(0, 5).map((booking: any) => (
                  <div key={booking?.id || Math.random()} className="flex items-center justify-between">
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
                {Array.isArray(dashboardData?.recentVehicles) && dashboardData.recentVehicles.slice(0, 5).map((vehicle: any) => (
                  <div key={vehicle?.id || Math.random()} className="flex items-center justify-between">
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
      </main>
    </div>
  )
}