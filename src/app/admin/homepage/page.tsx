'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Home, 
  Plus, 
  Edit, 
  Trash2, 
  Image as ImageIcon, 
  LayoutTemplate,
  Settings,
  Save,
  X,
  MoveUp,
  MoveDown,
  Eye,
  Upload
} from 'lucide-react'
import { toast } from 'sonner'
import { ImageUpload } from '@/components/admin/ImageUpload'

interface SliderItem {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  ctaText: string
  ctaLink: string
  badge?: string
  badgeColor?: string
  order: number
  isActive: boolean
}

interface CompanyInfo {
  id: string
  title: string
  subtitle: string
  description: string
  imageUrl: string
  features: string[]
  ctaButtons: {
    text: string
    link: string
    variant: 'primary' | 'secondary'
  }[]
}

interface ServiceItem {
  id: string
  title: string
  description: string
  icon: string
  link: string
  order: number
  isActive: boolean
}

interface CompanyFeature {
  id: string
  title: string
  description: string
  icon: string
  color: string
  features: string[]
  order: number
  isActive: boolean
}

interface HomepageSettings {
  showHeroSlider: boolean
  autoPlaySlider: boolean
  sliderInterval: number
  showFeaturedVehicles: boolean
  featuredVehiclesCount: number
  showServices: boolean
  showCompanyInfo: boolean
  theme: 'light' | 'dark' | 'auto'
}

export default function AdminHomepagePage() {
  return <HomepageContent />
}

function HomepageContent() {
  const [sliderItems, setSliderItems] = useState<SliderItem[]>([])
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null)
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [companyFeatures, setCompanyFeatures] = useState<CompanyFeature[]>([])
  const [settings, setSettings] = useState<HomepageSettings>({
    showHeroSlider: true,
    autoPlaySlider: true,
    sliderInterval: 5000,
    showFeaturedVehicles: true,
    featuredVehiclesCount: 6,
    showServices: true,
    showCompanyInfo: true,
    theme: 'light'
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('slider')

  // Dialog states
  const [showSliderDialog, setShowSliderDialog] = useState(false)
  const [showCompanyDialog, setShowCompanyDialog] = useState(false)
  const [showServiceDialog, setShowServiceDialog] = useState(false)
  const [showFeaturesDialog, setShowFeaturesDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)

  // Form states
  const [editingSlider, setEditingSlider] = useState<SliderItem | null>(null)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [sliderForm, setSliderForm] = useState<Partial<SliderItem>>({})
  const [serviceForm, setServiceForm] = useState<Partial<ServiceItem>>({})

  useEffect(() => {
    loadHomepageData()
  }, [])

  const loadHomepageData = async () => {
    setLoading(true)
    try {
      // Fetch sliders from API
      const slidersResponse = await fetch('/api/sliders')
      if (slidersResponse.ok) {
        const slidersData = await slidersResponse.json()
        setSliderItems(slidersData.sliders)
      } else {
        console.error('Failed to fetch sliders')
        // Use empty array on error
        setSliderItems([])
      }

      // Fetch company info from API
      const companyInfoResponse = await fetch('/api/company-info')
      if (companyInfoResponse.ok) {
        const companyInfoData = await companyInfoResponse.json()
        setCompanyInfo(companyInfoData)
      }

      // Fetch service items from API
      const serviceItemsResponse = await fetch('/api/service-items')
      if (serviceItemsResponse.ok) {
        const serviceItemsData = await serviceItemsResponse.json()
        setServiceItems(serviceItemsData)
      }

      // Fetch company features from API
      const featuresResponse = await fetch('/api/about/features')
      if (featuresResponse.ok) {
        const featuresData = await featuresResponse.json()
        setCompanyFeatures(featuresData)
      }
    } catch (error) {
      console.error('Error loading homepage data:', error)
      // Set empty arrays on error
      setSliderItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddSlider = () => {
    setSliderForm({
      title: '',
      subtitle: '',
      description: '',
      imageUrl: '',
      ctaText: '',
      ctaLink: '',
      badge: '',
      badgeColor: 'bg-blue-500',
      order: sliderItems.length,
      isActive: true
    })
    setEditingSlider(null)
    setShowSliderDialog(true)
  }

  const handleEditSlider = (item: SliderItem) => {
    setSliderForm(item)
    setEditingSlider(item)
    setShowSliderDialog(true)
  }

  const handleSaveSlider = async () => {
    try {
      const response = await fetch(editingSlider ? `/api/sliders/${editingSlider.id}` : '/api/sliders', {
        method: editingSlider ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(sliderForm),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ السلايدر')
      }

      const data = await response.json()
      
      // Refresh the sliders list
      await loadHomepageData()
      
      setShowSliderDialog(false)
      setSliderForm({})
      setEditingSlider(null)
    } catch (error) {
      console.error('Error saving slider:', error)
      alert(error instanceof Error ? error.message : 'فشل في حفظ السلايدر')
    }
  }

  const handleDeleteSlider = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      try {
        const response = await fetch(`/api/sliders/${id}`, {
          method: 'DELETE',
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'فشل في حذف السلايدر')
        }

        // Refresh the sliders list
        await loadHomepageData()
      } catch (error) {
        console.error('Error deleting slider:', error)
        alert(error instanceof Error ? error.message : 'فشل في حذف السلايدر')
      }
    }
  }

  const moveSliderItem = async (id: string, direction: 'up' | 'down') => {
    try {
      const currentIndex = sliderItems.findIndex(item => item.id === id)
      if (currentIndex === -1) return

      const newIndex = direction === 'up' ? currentIndex - 1 : currentIndex + 1
      if (newIndex < 0 || newIndex >= sliderItems.length) return

      // Create new order array
      const newOrder: SliderItem[] = [...sliderItems]
      // Swap items
      const temp = newOrder[currentIndex]
      newOrder[currentIndex] = newOrder[newIndex]
      newOrder[newIndex] = temp
      
      // Get the IDs in the new order
      const sliderIds = newOrder.map(item => item.id)

      // Call reorder API
      const response = await fetch('/api/sliders/reorder', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sliderIds }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في إعادة ترتيب السلايدرات')
      }

      // Refresh the sliders list
      await loadHomepageData()
    } catch (error) {
      console.error('Error moving slider item:', error)
      alert(error instanceof Error ? error.message : 'فشل في إعادة ترتيب السلايدرات')
    }
  }

  const handleSaveCompany = async () => {
    try {
      const response = await fetch('/api/company-info', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyInfo),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ معلومات الشركة')
      }

      const data = await response.json()
      setShowCompanyDialog(false)
      toast.success('تم حفظ معلومات الشركة بنجاح')
    } catch (error) {
      console.error('Error saving company info:', error)
      alert(error instanceof Error ? error.message : 'فشل في حفظ معلومات الشركة')
    }
  }

  const handleSaveService = async () => {
    try {
      const response = await fetch('/api/service-items', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serviceItems),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ الخدمات')
      }

      const data = await response.json()
      setShowServiceDialog(false)
      toast.success('تم حفظ الخدمات بنجاح')
    } catch (error) {
      console.error('Error saving service items:', error)
      alert(error instanceof Error ? error.message : 'فشل في حفظ الخدمات')
    }
  }

  const handleSaveFeatures = async () => {
    try {
      const response = await fetch('/api/about/features', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(companyFeatures),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'فشل في حفظ المميزات')
      }

      const data = await response.json()
      setShowFeaturesDialog(false)
      toast.success('تم حفظ المميزات بنجاح')
    } catch (error) {
      console.error('Error saving company features:', error)
      alert(error instanceof Error ? error.message : 'فشل في حفظ المميزات')
    }
  }

  const handleSaveSettings = async () => {
    try {
      // Save settings to API
      console.log('Saving settings:', settings)
      setShowSettingsDialog(false)
    } catch (error) {
      console.error('Error saving settings:', error)
    }
  }

  const badgeColors = [
    { value: 'bg-blue-500', label: 'أزرق' },
    { value: 'bg-green-500', label: 'أخضر' },
    { value: 'bg-red-500', label: 'أحمر' },
    { value: 'bg-blue-600', label: 'أزرق' },
    { value: 'bg-purple-500', label: 'بنفسجي' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الصفحة الرئيسية</h1>
        <p className="text-gray-600">تحكم في جميع عناصر الصفحة الرئيسية والمحتوى الظاهر للزوار</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => setShowSettingsDialog(true)}>
            <Settings className="ml-2 h-4 w-4" />
            الإعدادات العامة
          </Button>
          <Button variant="outline" onClick={() => window.open('/', '_blank')}>
            <Eye className="ml-2 h-4 w-4" />
            معاينة الصفحة
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="slider">السلايدر الرئيسي</TabsTrigger>
          <TabsTrigger value="company">معلومات الشركة</TabsTrigger>
          <TabsTrigger value="services">الخدمات</TabsTrigger>
          <TabsTrigger value="features">مميزاتنا</TabsTrigger>
          <TabsTrigger value="content">المحتوى</TabsTrigger>
        </TabsList>

        {/* Slider Management */}
        <TabsContent value="slider" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة السلايدر الرئيسي</CardTitle>
                  <CardDescription>
                    تحكم في الشرائح الظاهرة في أعلى الصفحة الرئيسية
                  </CardDescription>
                </div>
                <Button onClick={handleAddSlider}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة شريحة جديدة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {sliderItems.map((item, index) => (
                  <Card key={item.id} className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold">{item.title}</h3>
                          <Badge variant={item.isActive ? 'default' : 'secondary'}>
                            {item.isActive ? 'نشط' : 'معطل'}
                          </Badge>
                          {item.badge && (
                            <Badge className={item.badgeColor}>
                              {item.badge}
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{item.subtitle}</p>
                        <p className="text-sm text-gray-500">{item.description}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                          <span>الترتيب: {item.order + 1}</span>
                          <span>الرابط: {item.ctaLink}</span>
                        </div>
                      </div>
                      
                      <div className="flex flex-col gap-2">
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSliderItem(item.id, 'up')}
                            disabled={index === 0}
                          >
                            <MoveUp className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => moveSliderItem(item.id, 'down')}
                            disabled={index === sliderItems.length - 1}
                          >
                            <MoveDown className="h-4 w-4" />
                          </Button>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSlider(item)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSlider(item.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Company Info */}
        <TabsContent value="company" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>معلومات الشركة</CardTitle>
                  <CardDescription>
                    تحكم في معلومات الشركة ونبذة تعريفية
                  </CardDescription>
                </div>
                <Button onClick={() => setShowCompanyDialog(true)}>
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل المعلومات
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {companyInfo && (
                <div className="space-y-4">
                  <div>
                    <h3 className="text-lg font-semibold">{companyInfo.title}</h3>
                    <p className="text-blue-600 font-medium">{companyInfo.subtitle}</p>
                    <p className="text-gray-600 mt-2">{companyInfo.description}</p>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">المميزات:</h4>
                    <ul className="space-y-1">
                      {companyInfo.features.map((feature, index) => (
                        <li key={index} className="text-sm text-gray-600">• {feature}</li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">أزرار الحركة:</h4>
                    <div className="flex gap-2">
                      {companyInfo.ctaButtons.map((button, index) => (
                        <Badge key={index} variant={button.variant === 'primary' ? 'default' : 'secondary'}>
                          {button.text}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Services */}
        <TabsContent value="services" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة الخدمات</CardTitle>
                  <CardDescription>
                    تحكم في الخدمات المعروضة في الصفحة الرئيسية
                  </CardDescription>
                </div>
                <Button onClick={() => setShowServiceDialog(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة خدمة جديدة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {serviceItems.map((service) => (
                  <Card key={service.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{service.title}</h3>
                      <Badge variant={service.isActive ? 'default' : 'secondary'}>
                        {service.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{service.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">الترتيب: {service.order + 1}</span>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Trash2 className="h-4 w-4 text-red-600" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Features Management */}
        <TabsContent value="features" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>مميزات الشركة</CardTitle>
                  <CardDescription>
                    تحكم في قسم "لماذا تختار الحمد للسيارات"
                  </CardDescription>
                </div>
                <Button onClick={() => setShowFeaturesDialog(true)}>
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل المميزات
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {companyFeatures.map((feature) => (
                  <Card key={feature.id} className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold">{feature.title}</h3>
                      <Badge variant={feature.isActive ? 'default' : 'secondary'}>
                        {feature.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{feature.description}</p>
                    <div className="text-xs text-gray-500 mb-2">
                      اللون: {feature.color} • الأيقونة: {feature.icon}
                    </div>
                    <div className="text-xs text-gray-500">
                      الترتيب: {feature.order + 1}
                    </div>
                    {feature.features && feature.features.length > 0 && (
                      <div className="mt-2">
                        <div className="text-xs font-medium text-gray-700 mb-1">المميزات:</div>
                        <ul className="text-xs text-gray-600 space-y-1">
                          {feature.features.map((feat, index) => (
                            <li key={index}>• {feat}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Content Management */}
        <TabsContent value="content" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إدارة المحتوى العام</CardTitle>
              <CardDescription>
                تحكم في النصوص والعناوين والألوان العامة للصفحة
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <LayoutTemplate className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">قريباً</h3>
                <p className="text-gray-600">
                  نظام إدارة المحتوى العام قيد التطوير
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Slider Dialog */}
      <Dialog open={showSliderDialog} onOpenChange={setShowSliderDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingSlider ? 'تعديل شريحة' : 'إضافة شريحة جديدة'}
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات الشريحة الجديدة
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor="title">العنوان الرئيسي *</Label>
              <Input
                id="title"
                value={sliderForm.title || ''}
                onChange={(e) => setSliderForm({...sliderForm, title: e.target.value})}
                placeholder="أدخل العنوان الرئيسي"
              />
            </div>
            
            <div>
              <Label htmlFor="subtitle">العنوان الفرعي *</Label>
              <Input
                id="subtitle"
                value={sliderForm.subtitle || ''}
                onChange={(e) => setSliderForm({...sliderForm, subtitle: e.target.value})}
                placeholder="أدخل العنوان الفرعي"
              />
            </div>
            
            <div>
              <Label htmlFor="description">الوصف *</Label>
              <Textarea
                id="description"
                value={sliderForm.description || ''}
                onChange={(e) => setSliderForm({...sliderForm, description: e.target.value})}
                placeholder="أدخل الوصف"
                rows={3}
              />
            </div>
            
            <div>
              <Label htmlFor="ctaText">نص الزر *</Label>
              <Input
                id="ctaText"
                value={sliderForm.ctaText || ''}
                onChange={(e) => setSliderForm({...sliderForm, ctaText: e.target.value})}
                placeholder="نص الزر"
              />
            </div>
            
            <div>
              <Label htmlFor="ctaLink">رابط الزر *</Label>
              <Input
                id="ctaLink"
                value={sliderForm.ctaLink || ''}
                onChange={(e) => setSliderForm({...sliderForm, ctaLink: e.target.value})}
                placeholder="/example-link"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="badge">الشارة (اختياري)</Label>
                <Input
                  id="badge"
                  value={sliderForm.badge || ''}
                  onChange={(e) => setSliderForm({...sliderForm, badge: e.target.value})}
                  placeholder="جديد"
                />
              </div>
              
              <div>
                <Label htmlFor="badgeColor">لون الشارة</Label>
                <Select value={sliderForm.badgeColor || 'bg-blue-500'} onValueChange={(value) => setSliderForm({...sliderForm, badgeColor: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {badgeColors.map(color => (
                      <SelectItem key={color.value} value={color.value}>
                        {color.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="imageUrl">رابط الصورة</Label>
              <div className="flex gap-2">
                <Input
                  id="imageUrl"
                  value={sliderForm.imageUrl || ''}
                  onChange={(e) => setSliderForm({...sliderForm, imageUrl: e.target.value})}
                  placeholder="/api/placeholder/1200/600"
                  className="flex-1"
                />
                <Button variant="outline" size="sm">
                  <Upload className="h-4 w-4" />
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="isActive"
                checked={sliderForm.isActive || false}
                onCheckedChange={(checked) => setSliderForm({...sliderForm, isActive: checked})}
              />
              <Label htmlFor="isActive">نشط</Label>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowSliderDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveSlider}>
              <Save className="ml-2 h-4 w-4" />
              حفظ
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>إعدادات الصفحة الرئيسية</DialogTitle>
            <DialogDescription>
              تحكم في الإعدادات العامة للصفحة الرئيسية
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Switch
                id="showHeroSlider"
                checked={settings.showHeroSlider}
                onCheckedChange={(checked) => setSettings({...settings, showHeroSlider: checked})}
              />
              <Label htmlFor="showHeroSlider">إظهار السلايدر الرئيسي</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="autoPlaySlider"
                checked={settings.autoPlaySlider}
                onCheckedChange={(checked) => setSettings({...settings, autoPlaySlider: checked})}
              />
              <Label htmlFor="autoPlaySlider">تشغيل تلقائي للسلايدر</Label>
            </div>
            
            <div>
              <Label htmlFor="sliderInterval">الفترة الزمنية للسلايدر (ثانية)</Label>
              <Input
                id="sliderInterval"
                type="number"
                value={settings.sliderInterval / 1000}
                onChange={(e) => setSettings({...settings, sliderInterval: parseInt(e.target.value) * 1000})}
                min="1"
                max="60"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="showFeaturedVehicles"
                checked={settings.showFeaturedVehicles}
                onCheckedChange={(checked) => setSettings({...settings, showFeaturedVehicles: checked})}
              />
              <Label htmlFor="showFeaturedVehicles">إظهار السيارات المميزة</Label>
            </div>
            
            <div>
              <Label htmlFor="featuredVehiclesCount">عدد السيارات المميزة</Label>
              <Input
                id="featuredVehiclesCount"
                type="number"
                value={settings.featuredVehiclesCount}
                onChange={(e) => setSettings({...settings, featuredVehiclesCount: parseInt(e.target.value)})}
                min="1"
                max="12"
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="showServices"
                checked={settings.showServices}
                onCheckedChange={(checked) => setSettings({...settings, showServices: checked})}
              />
              <Label htmlFor="showServices">إظهار الخدمات</Label>
            </div>
            
            <div className="flex items-center gap-2">
              <Switch
                id="showCompanyInfo"
                checked={settings.showCompanyInfo}
                onCheckedChange={(checked) => setSettings({...settings, showCompanyInfo: checked})}
              />
              <Label htmlFor="showCompanyInfo">إظهار معلومات الشركة</Label>
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowSettingsDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveSettings}>
              <Save className="ml-2 h-4 w-4" />
              حفظ الإعدادات
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Features Dialog */}
      <Dialog open={showFeaturesDialog} onOpenChange={setShowFeaturesDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل مميزات الشركة</DialogTitle>
            <DialogDescription>
              تحكم في قسم "لماذا تختار الحمد للسيارات"
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {companyFeatures.map((feature, index) => (
              <Card key={feature.id} className="p-4">
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`title-${feature.id}`}>العنوان *</Label>
                      <Input
                        id={`title-${feature.id}`}
                        value={feature.title}
                        onChange={(e) => {
                          const newFeatures = [...companyFeatures]
                          newFeatures[index].title = e.target.value
                          setCompanyFeatures(newFeatures)
                        }}
                        placeholder="أدخل العنوان"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor={`icon-${feature.id}`}>الأيقونة *</Label>
                      <Select
                        value={feature.icon}
                        onValueChange={(value) => {
                          const newFeatures = [...companyFeatures]
                          newFeatures[index].icon = value
                          setCompanyFeatures(newFeatures)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الأيقونة" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Car">سيارة</SelectItem>
                          <SelectItem value="Wrench">مفتاح ربط</SelectItem>
                          <SelectItem value="Star">نجمة</SelectItem>
                          <SelectItem value="Calendar">تقويم</SelectItem>
                          <SelectItem value="Users">مستخدمون</SelectItem>
                          <SelectItem value="Shield">درع</SelectItem>
                          <SelectItem value="Heart">قلب</SelectItem>
                          <SelectItem value="Lightbulb">لمبة</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor={`color-${feature.id}`}>اللون *</Label>
                      <Select
                        value={feature.color}
                        onValueChange={(value) => {
                          const newFeatures = [...companyFeatures]
                          newFeatures[index].color = value
                          setCompanyFeatures(newFeatures)
                        }}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر اللون" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="blue">أزرق</SelectItem>
                          <SelectItem value="orange">برتقالي</SelectItem>
                          <SelectItem value="green">أخضر</SelectItem>
                          <SelectItem value="red">أحمر</SelectItem>
                          <SelectItem value="purple">بنفسجي</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor={`order-${feature.id}`}>الترتيب</Label>
                      <Input
                        id={`order-${feature.id}`}
                        type="number"
                        value={feature.order}
                        onChange={(e) => {
                          const newFeatures = [...companyFeatures]
                          newFeatures[index].order = parseInt(e.target.value)
                          setCompanyFeatures(newFeatures)
                        }}
                        min="0"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor={`description-${feature.id}`}>الوصف *</Label>
                    <Textarea
                      id={`description-${feature.id}`}
                      value={feature.description}
                      onChange={(e) => {
                        const newFeatures = [...companyFeatures]
                        newFeatures[index].description = e.target.value
                        setCompanyFeatures(newFeatures)
                      }}
                      placeholder="أدخل الوصف"
                      rows={3}
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor={`features-${feature.id}`}>المميزات التفصيلية</Label>
                    <Textarea
                      id={`features-${feature.id}`}
                      value={feature.features ? feature.features.join('\n') : ''}
                      onChange={(e) => {
                        const newFeatures = [...companyFeatures]
                        newFeatures[index].features = e.target.value.split('\n').filter(f => f.trim())
                        setCompanyFeatures(newFeatures)
                      }}
                      placeholder="أدخل المميزات التفصيلية (سطر لكل ميزة)"
                      rows={4}
                    />
                    <p className="text-xs text-gray-500 mt-1">أدخل كل ميزة في سطر منفصل</p>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Switch
                      id={`active-${feature.id}`}
                      checked={feature.isActive}
                      onCheckedChange={(checked) => {
                        const newFeatures = [...companyFeatures]
                        newFeatures[index].isActive = checked
                        setCompanyFeatures(newFeatures)
                      }}
                    />
                    <Label htmlFor={`active-${feature.id}`}>نشط</Label>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowFeaturesDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSaveFeatures}>
              <Save className="ml-2 h-4 w-4" />
              حفظ المميزات
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}