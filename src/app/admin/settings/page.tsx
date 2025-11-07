'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  Bell,
  Shield,
  Database,
  Mail,
  Phone,
  MapPin,
  Save,
  RefreshCw
} from 'lucide-react'

interface CompanySettings {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  workingHours: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  bookingAlerts: boolean
  customerAlerts: boolean
  systemAlerts: boolean
}

interface SystemSettings {
  maintenanceMode: boolean
  debugMode: boolean
  cacheEnabled: boolean
  autoBackup: boolean
  sessionTimeout: number
}

export default function AdminSettingsPage() {
  return (
    <AdminRoute>
      <SettingsContent />
    </AdminRoute>
  )
}

function SettingsContent() {
  const [companySettings, setCompanySettings] = useState<CompanySettings>({
    name: 'الحمد للسيارات',
    email: 'info@elhamd-cars.com',
    phone: '+20 2 1234 5678',
    address: 'شارع التحرير',
    city: 'القاهرة',
    country: 'مصر',
    workingHours: '9:00 ص - 8:00 م'
  })

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    emailNotifications: true,
    pushNotifications: true,
    bookingAlerts: true,
    customerAlerts: true,
    systemAlerts: false
  })

  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    maintenanceMode: false,
    debugMode: false,
    cacheEnabled: true,
    autoBackup: true,
    sessionTimeout: 30
  })

  const [loading, setLoading] = useState(false)
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle')
  const [initialLoading, setInitialLoading] = useState(true)

  useEffect(() => {
    fetchSettings()
  }, [])

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/admin/settings')
      if (response.ok) {
        const data = await response.json()
        setCompanySettings(data.company)
        setNotificationSettings(data.notifications)
        setSystemSettings(data.system)
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setInitialLoading(false)
    }
  }

  const handleSaveSettings = async () => {
    setLoading(true)
    setSaveStatus('saving')
    
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: companySettings,
          notifications: notificationSettings,
          system: systemSettings
        })
      })

      if (response.ok) {
        setSaveStatus('success')
        setTimeout(() => setSaveStatus('idle'), 3000)
      } else {
        setSaveStatus('error')
        setTimeout(() => setSaveStatus('idle'), 3000)
      }
    } catch (error) {
      console.error('Error saving settings:', error)
      setSaveStatus('error')
      setTimeout(() => setSaveStatus('idle'), 3000)
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadge = () => {
    switch (saveStatus) {
      case 'saving':
        return <Badge variant="secondary"><RefreshCw className="h-3 w-3 ml-1 animate-spin" />جاري الحفظ...</Badge>
      case 'success':
        return <Badge variant="default" className="bg-green-500">تم الحفظ بنجاح</Badge>
      case 'error':
        return <Badge variant="destructive">فشل الحفظ</Badge>
      default:
        return null
    }
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">الإعدادات</h1>
            <p className="text-gray-600">إدارة إعدادات النظام والشركة</p>
          </div>
          <div className="flex items-center gap-4">
            {getStatusBadge()}
            <Button 
              onClick={handleSaveSettings} 
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="ml-2 h-4 w-4" />
              حفظ التغييرات
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Settings className="h-4 w-4" />
            إعدادات الشركة
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            الإشعارات
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            النظام
          </TabsTrigger>
        </TabsList>

        {/* Company Settings */}
        <TabsContent value="company">
          <Card>
            <CardHeader>
              <CardTitle>معلومات الشركة</CardTitle>
              <CardDescription>
                تحديث معلومات الشركة الأساسية وبيانات الاتصال
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="companyName">اسم الشركة</Label>
                  <Input
                    id="companyName"
                    value={companySettings.name}
                    onChange={(e) => setCompanySettings({...companySettings, name: e.target.value})}
                    placeholder="اسم الشركة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">البريد الإلكتروني</Label>
                  <Input
                    id="email"
                    type="email"
                    value={companySettings.email}
                    onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                    placeholder="البريد الإلكتروني"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">رقم الهاتف</Label>
                  <Input
                    id="phone"
                    value={companySettings.phone}
                    onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                    placeholder="رقم الهاتف"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workingHours">ساعات العمل</Label>
                  <Input
                    id="workingHours"
                    value={companySettings.workingHours}
                    onChange={(e) => setCompanySettings({...companySettings, workingHours: e.target.value})}
                    placeholder="ساعات العمل"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="address">العنوان</Label>
                  <Input
                    id="address"
                    value={companySettings.address}
                    onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                    placeholder="العنوان"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="city">المدينة</Label>
                  <Input
                    id="city"
                    value={companySettings.city}
                    onChange={(e) => setCompanySettings({...companySettings, city: e.target.value})}
                    placeholder="المدينة"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">البلد</Label>
                  <Input
                    id="country"
                    value={companySettings.country}
                    onChange={(e) => setCompanySettings({...companySettings, country: e.target.value})}
                    placeholder="البلد"
                  />
                </div>
              </div>

              <div className="bg-gray-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  معلومات الاتصال المعروضة
                </h4>
                <div className="space-y-2 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <Phone className="h-3 w-3" />
                    <span>{companySettings.phone}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Mail className="h-3 w-3" />
                    <span>{companySettings.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-3 w-3" />
                    <span>{companySettings.address}, {companySettings.city}, {companySettings.country}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notification Settings */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>
                تحكم في الإشعارات التي تتلقاها من النظام
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">الإشعارات البريدية</div>
                    <div className="text-sm text-gray-600">استقبل الإشعارات عبر البريد الإلكتروني</div>
                  </div>
                  <Switch
                    checked={notificationSettings.emailNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, emailNotifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">الإشعارات الفورية</div>
                    <div className="text-sm text-gray-600">استقبل الإشعارات الفورية في المتصفح</div>
                  </div>
                  <Switch
                    checked={notificationSettings.pushNotifications}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, pushNotifications: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">تنبيهات الحجوزات</div>
                    <div className="text-sm text-gray-600">إشعارات عند وجود حجوزات جديدة</div>
                  </div>
                  <Switch
                    checked={notificationSettings.bookingAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, bookingAlerts: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">تنبيهات العملاء</div>
                    <div className="text-sm text-gray-600">إشعارات عند تسجيل عملاء جدد</div>
                  </div>
                  <Switch
                    checked={notificationSettings.customerAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, customerAlerts: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">تنبيهات النظام</div>
                    <div className="text-sm text-gray-600">إشعارات الأخطاء والتحديثات الهامة</div>
                  </div>
                  <Switch
                    checked={notificationSettings.systemAlerts}
                    onCheckedChange={(checked) => 
                      setNotificationSettings({...notificationSettings, systemAlerts: checked})
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات النظام</CardTitle>
              <CardDescription>
                إعدادات متقدمة للنظام والأمان
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">وضع الصيانة</div>
                    <div className="text-sm text-gray-600">تعطيل الوصول للعملاء مؤقتاً</div>
                  </div>
                  <Switch
                    checked={systemSettings.maintenanceMode}
                    onCheckedChange={(checked) => 
                      setSystemSettings({...systemSettings, maintenanceMode: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">وضع التصحيح</div>
                    <div className="text-sm text-gray-600">تفعيل وضع التصحيح للمطورين</div>
                  </div>
                  <Switch
                    checked={systemSettings.debugMode}
                    onCheckedChange={(checked) => 
                      setSystemSettings({...systemSettings, debugMode: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">تفعيل التخزين المؤقت</div>
                    <div className="text-sm text-gray-600">تحسين أداء النظام بالتخزين المؤقت</div>
                  </div>
                  <Switch
                    checked={systemSettings.cacheEnabled}
                    onCheckedChange={(checked) => 
                      setSystemSettings({...systemSettings, cacheEnabled: checked})
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="space-y-1">
                    <div className="font-medium">النسخ الاحتياطي التلقائي</div>
                    <div className="text-sm text-gray-600">إنشاء نسخ احتياطية تلقائية يومياً</div>
                  </div>
                  <Switch
                    checked={systemSettings.autoBackup}
                    onCheckedChange={(checked) => 
                      setSystemSettings({...systemSettings, autoBackup: checked})
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">مدة الجلسة (دقائق)</Label>
                  <Input
                    id="sessionTimeout"
                    type="number"
                    value={systemSettings.sessionTimeout}
                    onChange={(e) => 
                      setSystemSettings({...systemSettings, sessionTimeout: parseInt(e.target.value) || 30})
                    }
                    min="5"
                    max="120"
                  />
                  <p className="text-sm text-gray-600">المدة التي تبقى فيها الجلسة نشطة قبل تسجيل الخروج تلقائياً</p>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <h4 className="font-medium text-yellow-800 mb-2 flex items-center gap-2">
                  <Shield className="h-4 w-4" />
                  تحذير أمان
                </h4>
                <p className="text-sm text-yellow-700">
                  تغيير إعدادات النظام قد يؤثر على أداء وأمان التطبيق. تأكد من فهمك للتغييرات قبل حفظها.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}