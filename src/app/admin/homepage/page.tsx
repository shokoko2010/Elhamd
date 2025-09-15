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
      // Mock data - will be replaced with API calls
      const mockSliderItems: SliderItem[] = [
        {
          id: '1',
          title: 'تاتا نيكسون 2024',
          subtitle: 'سيارة SUV عائلية متطورة',
          description: 'تجربة القيادة المثالية مع أحدث تقنيات السلامة والراحة',
          imageUrl: '/api/placeholder/1200/600',
          ctaText: 'اكتشف المزيد',
          ctaLink: '/vehicles',
          badge: 'جديد',
          badgeColor: 'bg-green-500',
          order: 0,
          isActive: true
        },
        {
          id: '2',
          title: 'عرض خاص على تاتا بانش',
          subtitle: 'خصم 15% على جميع الفئات',
          description: 'فرصة محدودة للحصول على سيارتك المفضلة بأفضل سعر',
          imageUrl: '/api/placeholder/1200/600',
          ctaText: 'اطلب العرض الآن',
          ctaLink: '/vehicles',
          badge: 'عرض خاص',
          badgeColor: 'bg-red-500',
          order: 1,
          isActive: true
        }
      ]

      const mockCompanyInfo: CompanyInfo = {
        id: '1',
        title: 'مرحباً بك في الحمد للسيارات',
        subtitle: 'الوكيل الرسمي المعتمد لسيارات تاتا في مصر',
        description: 'نحن فخورون بتمثيل علامة تاتا التجارية في مصر، حيث نقدم لكم أحدث الموديلات مع ضمان الجودة الأصلي وخدمة ما بعد البيع المتميزة.',
        imageUrl: 'https://source.unsplash.com/800x600/?tata,showroom',
        features: [
          'أحدث موديلات تاتا 2024',
          'ضمان المصنع لمدة 3 سنوات',
          'خدمة صيانة على مدار الساعة',
          'تمويل سيارات بأفضل الأسعار'
        ],
        ctaButtons: [
          { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
          { text: 'قيادة تجريبية', link: '/test-drive', variant: 'secondary' }
        ]
      }

      const mockServiceItems: ServiceItem[] = [
        {
          id: '1',
          title: 'بيع سيارات جديدة',
          description: 'أحدث موديلات تاتا مع ضمان المصنع الكامل',
          icon: 'Car',
          link: '/vehicles',
          order: 0,
          isActive: true
        },
        {
          id: '2',
          title: 'خدمة الصيانة',
          description: 'صيانة احترافية بأسعار تنافسية',
          icon: 'Wrench',
          link: '/maintenance',
          order: 1,
          isActive: true
        }
      ]

      setSliderItems(mockSliderItems)
      setCompanyInfo(mockCompanyInfo)
      setServiceItems(mockServiceItems)
    } catch (error) {
      console.error('Error loading homepage data:', error)
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
      if (editingSlider) {
        // Update existing slider
        setSliderItems(prev => prev.map(item => 
          item.id === editingSlider.id ? { ...item, ...sliderForm } as SliderItem : item
        ))
      } else {
        // Add new slider
        const newSlider: SliderItem = {
          id: Date.now().toString(),
          ...sliderForm,
          order: sliderItems.length,
          isActive: true
        } as SliderItem
        setSliderItems(prev => [...prev, newSlider])
      }
      setShowSliderDialog(false)
      setSliderForm({})
      setEditingSlider(null)
    } catch (error) {
      console.error('Error saving slider:', error)
    }
  }

  const handleDeleteSlider = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذا العنصر؟')) {
      setSliderItems(prev => prev.filter(item => item.id !== id))
    }
  }

  const moveSliderItem = (id: string, direction: 'up' | 'down') => {
    setSliderItems(prev => {
      const items = [...prev]
      const index = items.findIndex(item => item.id === id)
      if (index === -1) return items

      const newIndex = direction === 'up' ? index - 1 : index + 1
      if (newIndex < 0 || newIndex >= items.length) return items

      // Swap items
      [items[index], items[newIndex]] = [items[newIndex], items[index]]
      
      // Update order
      return items.map((item, i) => ({ ...item, order: i }))
    })
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
    { value: 'bg-orange-500', label: 'برتقالي' },
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="slider">السلايدر الرئيسي</TabsTrigger>
          <TabsTrigger value="company">معلومات الشركة</TabsTrigger>
          <TabsTrigger value="services">الخدمات</TabsTrigger>
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
    </div>
  )
}