'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { 
  Settings, 
  BarChart3,
  Users,
  Car,
  Calendar,
  Target,
  Layout,
  Palette,
  Search,
  Share2,
  Database,
  LogOut,
  Save,
  Upload,
  Image as ImageIcon,
  Link
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useAuth } from '@/hooks/use-auth'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface SiteSettings {
  id?: string
  logoUrl?: string
  faviconUrl?: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  fontFamily: string
  siteTitle: string
  siteDescription: string
  contactEmail: string
  contactPhone?: string
  contactAddress?: string
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
  }
  headerSettings: {
    showLogo: boolean
    showNavigation: boolean
    showContactInfo: boolean
    showSocialLinks: boolean
    stickyHeader: boolean
    transparentHeader: boolean
  }
  footerSettings: {
    showLogo: boolean
    showNavigation: boolean
    showContactInfo: boolean
    showSocialLinks: boolean
    showNewsletter: boolean
    showCopyright: boolean
    columns: number
  }
}

export default function AdminSiteSettingsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const { user, loading, authenticated } = useAuth()
  
  const defaultSettings: SiteSettings = {
    primaryColor: '#3B82F6',
    secondaryColor: '#10B981',
    accentColor: '#F59E0B',
    fontFamily: 'Inter',
    siteTitle: 'Al-Hamd Cars',
    siteDescription: 'Premium Car Dealership in Egypt',
    contactEmail: 'info@elhamdimport.com',
    contactPhone: '+20 123 456 7890',
    contactAddress: 'Cairo, Egypt',
    socialLinks: {
      facebook: 'https://facebook.com/alhamdcars',
      twitter: 'https://twitter.com/alhamdcars',
      instagram: 'https://instagram.com/alhamdcars',
      linkedin: 'https://linkedin.com/company/alhamdcars'
    },
    headerSettings: {
      showLogo: true,
      showNavigation: true,
      showContactInfo: true,
      showSocialLinks: true,
      stickyHeader: true,
      transparentHeader: false
    },
    footerSettings: {
      showLogo: true,
      showNavigation: true,
      showContactInfo: true,
      showSocialLinks: true,
      showNewsletter: true,
      showCopyright: true,
      columns: 4
    }
  }
  
  const [settings, setSettings] = useState<SiteSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)

  // Helper functions
  const checkIsAdmin = useCallback(() => {
    return user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN'
  }, [user])

  const fetchSiteSettings = useCallback(async () => {
    try {
      const response = await fetch('/api/site-settings')
      if (response.ok) {
        const data = await response.json()
        if (data[0]) {
          setSettings(data[0])
        }
      }
    } catch (error) {
      console.error('Error fetching site settings:', error)
    }
  }, [])

  const updateSettings = useCallback((path: string[], value: any) => {
    setSettings(prev => {
      const newSettings = JSON.parse(JSON.stringify(prev))
      let current: any = newSettings
      
      for (let i = 0; i < path.length - 1; i++) {
        if (!current[path[i]]) {
          current[path[i]] = {}
        }
        current = current[path[i]]
      }
      
      current[path[path.length - 1]] = value
      return newSettings
    })
  }, [])

  const handleSave = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/site-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(settings)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Site settings saved successfully'
        })
      } else {
        const error = await response.json()
        toast({
          title: 'Error',
          description: error.error || 'Failed to save site settings',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save site settings',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }, [settings, toast])

  // Effects
  useEffect(() => {
    if (!loading && !authenticated) {
      router.push('/login')
      return
    }

    if (!loading && authenticated && !checkIsAdmin()) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive"
      })
      router.push('/dashboard')
      return
    }
    
    if (authenticated && checkIsAdmin()) {
      fetchSiteSettings()
    }
  }, [loading, authenticated, user, checkIsAdmin, fetchSiteSettings, router, toast])

  // Loading states
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  if (!authenticated || !checkIsAdmin()) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <Avatar className="w-12 h-12">
            <AvatarImage src={user?.name ? `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}` : undefined} />
            <AvatarFallback>
              {user?.name?.charAt(0).toUpperCase() || 'A'}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">إعدادات الموقع</h1>
            <p className="text-gray-600">إدارة مظهر وإعدادات الموقع</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => router.push('/admin/settings')}>
            <Settings className="w-4 h-4 mr-2" />
            إعدادات الأدمن
          </Button>
          <Button onClick={handleSave} disabled={isLoading}>
            <Save className="w-4 h-4 mr-2" />
            {isLoading ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
        </div>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">أساسي</TabsTrigger>
          <TabsTrigger value="appearance">المظهر</TabsTrigger>
          <TabsTrigger value="header">الهيدر</TabsTrigger>
          <TabsTrigger value="footer">الفوتر</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                المعلومات الأساسية
              </CardTitle>
              <CardDescription>
                معلومات الموقع العامة وبيانات الاتصال
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="siteTitle">عنوان الموقع *</Label>
                  <Input
                    id="siteTitle"
                    value={settings.siteTitle}
                    onChange={(e) => updateSettings(['siteTitle'], e.target.value)}
                    placeholder="أدخل عنوان الموقع"
                  />
                </div>
                <div>
                  <Label htmlFor="contactEmail">البريد الإلكتروني *</Label>
                  <Input
                    id="contactEmail"
                    type="email"
                    value={settings.contactEmail}
                    onChange={(e) => updateSettings(['contactEmail'], e.target.value)}
                    placeholder="أدخل البريد الإلكتروني"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="siteDescription">وصف الموقع</Label>
                <Textarea
                  id="siteDescription"
                  value={settings.siteDescription}
                  onChange={(e) => updateSettings(['siteDescription'], e.target.value)}
                  placeholder="أدخل وصف الموقع"
                  rows={3}
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="contactPhone">رقم الهاتف</Label>
                  <Input
                    id="contactPhone"
                    value={settings.contactPhone || ''}
                    onChange={(e) => updateSettings(['contactPhone'], e.target.value)}
                    placeholder="أدخل رقم الهاتف"
                  />
                </div>
                <div>
                  <Label htmlFor="contactAddress">العنوان</Label>
                  <Input
                    id="contactAddress"
                    value={settings.contactAddress || ''}
                    onChange={(e) => updateSettings(['contactAddress'], e.target.value)}
                    placeholder="أدخل العنوان"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="w-5 h-5" />
                روابط وسائل التواصل الاجتماعي
              </CardTitle>
              <CardDescription>
                ربط حسابات وسائل التواصل الاجتماعي
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={settings.socialLinks?.facebook || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'facebook'], e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={settings.socialLinks?.twitter || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'twitter'], e.target.value)}
                    placeholder="https://twitter.com/yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="instagram">Instagram</Label>
                  <Input
                    id="instagram"
                    value={settings.socialLinks?.instagram || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'instagram'], e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                  />
                </div>
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={settings.socialLinks?.linkedin || ''}
                    onChange={(e) => updateSettings(['socialLinks', 'linkedin'], e.target.value)}
                    placeholder="https://linkedin.com/company/yourcompany"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Palette className="w-5 h-5" />
                الألوان والخطوط
              </CardTitle>
              <CardDescription>
                تخصيص ألوان وخطوط الموقع
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="primaryColor">اللون الأساسي</Label>
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => updateSettings(['primaryColor'], e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => updateSettings(['secondaryColor'], e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="accentColor">لون التمييز</Label>
                  <Input
                    id="accentColor"
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => updateSettings(['accentColor'], e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="fontFamily">نوع الخط</Label>
                <Select value={settings.fontFamily} onValueChange={(value) => updateSettings(['fontFamily'], value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر نوع الخط" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Inter">Inter</SelectItem>
                    <SelectItem value="Roboto">Roboto</SelectItem>
                    <SelectItem value="Open Sans">Open Sans</SelectItem>
                    <SelectItem value="Poppins">Poppins</SelectItem>
                    <SelectItem value="Montserrat">Montserrat</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="header" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                إعدادات الهيدر
              </CardTitle>
              <CardDescription>
                التحكم في مظهر وسلوك الهيدر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">خيارات العرض</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showLogo">عرض الشعار</Label>
                    <Switch
                      id="showLogo"
                      checked={settings.headerSettings.showLogo}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'showLogo'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showNavigation">عرض القائمة</Label>
                    <Switch
                      id="showNavigation"
                      checked={settings.headerSettings.showNavigation}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'showNavigation'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showContactInfo">عرض معلومات الاتصال</Label>
                    <Switch
                      id="showContactInfo"
                      checked={settings.headerSettings.showContactInfo}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'showContactInfo'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showSocialLinks">عرض روابط التواصل</Label>
                    <Switch
                      id="showSocialLinks"
                      checked={settings.headerSettings.showSocialLinks}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'showSocialLinks'], checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">سلوك الهيدر</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="stickyHeader">هيدر ثابت</Label>
                    <Switch
                      id="stickyHeader"
                      checked={settings.headerSettings.stickyHeader}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'stickyHeader'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="transparentHeader">هيدر شفاف</Label>
                    <Switch
                      id="transparentHeader"
                      checked={settings.headerSettings.transparentHeader}
                      onCheckedChange={(checked) => updateSettings(['headerSettings', 'transparentHeader'], checked)}
                    />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="footer" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Layout className="w-5 h-5" />
                إعدادات الفوتر
              </CardTitle>
              <CardDescription>
                التحكم في مظهر ومحتوى الفوتر
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">خيارات العرض</h3>
                  
                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowLogo">عرض الشعار</Label>
                    <Switch
                      id="footerShowLogo"
                      checked={settings.footerSettings.showLogo}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showLogo'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowNavigation">عرض القائمة</Label>
                    <Switch
                      id="footerShowNavigation"
                      checked={settings.footerSettings.showNavigation}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showNavigation'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowContactInfo">عرض معلومات الاتصال</Label>
                    <Switch
                      id="footerShowContactInfo"
                      checked={settings.footerSettings.showContactInfo}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showContactInfo'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowSocialLinks">عرض روابط التواصل</Label>
                    <Switch
                      id="footerShowSocialLinks"
                      checked={settings.footerSettings.showSocialLinks}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showSocialLinks'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowNewsletter">عرض النشرة البريدية</Label>
                    <Switch
                      id="footerShowNewsletter"
                      checked={settings.footerSettings.showNewsletter}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showNewsletter'], checked)}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="footerShowCopyright">عرض حقوق النشر</Label>
                    <Switch
                      id="footerShowCopyright"
                      checked={settings.footerSettings.showCopyright}
                      onCheckedChange={(checked) => updateSettings(['footerSettings', 'showCopyright'], checked)}
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-medium">التخطيط</h3>
                  
                  <div>
                    <Label htmlFor="footerColumns">عدد الأعمدة</Label>
                    <Select 
                      value={settings.footerSettings.columns.toString()} 
                      onValueChange={(value) => updateSettings(['footerSettings', 'columns'], parseInt(value))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="اختر عدد الأعمدة" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">عمود واحد</SelectItem>
                        <SelectItem value="2">عمودان</SelectItem>
                        <SelectItem value="3">ثلاثة أعمدة</SelectItem>
                        <SelectItem value="4">أربعة أعمدة</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>إجراءات سريعة</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button className="w-full justify-start" onClick={() => router.push('/admin')}>
            <BarChart3 className="w-4 h-4 mr-2" />
            لوحة تحكم الأدمن
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/vehicles')}>
            <Car className="w-4 h-4 mr-2" />
            إدارة المركبات
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/customers')}>
            <Users className="w-4 h-4 mr-2" />
            إدارة العملاء
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/bookings')}>
            <Calendar className="w-4 h-4 mr-2" />
            إدارة الحجوزات
          </Button>
          <Button variant="outline" className="w-full justify-start" onClick={() => router.push('/admin/content')}>
            <Layout className="w-4 h-4 mr-2" />
            إدارة المحتوى
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}