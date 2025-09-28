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
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Save,
  X,
  Globe,
  Menu,
  Smartphone,
  Monitor,
  Settings,
  Copy,
  Eye,
  ExternalLink,
  Layers,
  Type,
  Image as ImageIcon,
  Palette,
  LayoutTemplate,
  Layout,
  Columns
} from 'lucide-react'

interface ContentPage {
  id: string
  title: string
  slug: string
  content: string
  excerpt?: string
  status: 'published' | 'draft' | 'archived'
  template: string
  seoTitle?: string
  seoDescription?: string
  featuredImage?: string
  author: string
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

interface NavigationItem {
  id: string
  label: string
  link: string
  order: number
  parent?: string
  target: '_self' | '_blank'
  isActive: boolean
  children?: NavigationItem[]
}

interface SiteSettings {
  siteName: string
  siteDescription: string
  siteUrl: string
  logo?: string
  favicon?: string
  primaryColor: string
  secondaryColor: string
  contactEmail: string
  contactPhone: string
  contactAddress: string
  socialLinks: {
    facebook?: string
    twitter?: string
    instagram?: string
    linkedin?: string
    youtube?: string
  }
  seo: {
    metaTitle?: string
    metaDescription?: string
    metaKeywords?: string
  }
}

export default function AdminContentPage() {
  return <ContentContent />
}

function ContentContent() {
  const [pages, setPages] = useState<ContentPage[]>([])
  const [navigation, setNavigation] = useState<NavigationItem[]>([])
  const [settings, setSettings] = useState<SiteSettings | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('pages')
  const [searchTerm, setSearchTerm] = useState('')

  // Dialog states
  const [showPageDialog, setShowPageDialog] = useState(false)
  const [showNavigationDialog, setShowNavigationDialog] = useState(false)
  const [showSettingsDialog, setShowSettingsDialog] = useState(false)
  
  // Form states
  const [editingPage, setEditingPage] = useState<ContentPage | null>(null)
  const [editingNav, setEditingNav] = useState<NavigationItem | null>(null)
  const [pageForm, setPageForm] = useState({
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    status: 'draft' as 'published' | 'draft' | 'archived',
    template: 'default',
    seoTitle: '',
    seoDescription: '',
    featuredImage: ''
  })

  useEffect(() => {
    loadContentData()
  }, [])

  const loadContentData = async () => {
    setLoading(true)
    try {
      // Mock data - will be replaced with API calls
      const mockPages: ContentPage[] = [
        {
          id: '1',
          title: 'من نحن',
          slug: 'about',
          content: '<p>نحن شركة الحمد للسيارات، الوكيل الرسمي المعتمد لسيارات تاتا في مصر...</p>',
          excerpt: 'تعرف على تاريخ شركة الحمد للسيارات وخدماتنا',
          status: 'published',
          template: 'default',
          seoTitle: 'من نحن - الحمد للسيارات',
          seoDescription: 'تعرف على تاريخ شركة الحمد للسيارات وخدماتنا في مصر',
          author: 'admin',
          publishedAt: '2024-01-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-15T10:00:00Z'
        },
        {
          id: '2',
          title: 'اتصل بنا',
          slug: 'contact',
          content: '<p>تواصل معنا عبر الهاتف أو البريد الإلكتروني أو زيارة فروعنا...</p>',
          excerpt: 'معلومات الاتصال بفروع الحمد للسيارات',
          status: 'published',
          template: 'contact',
          seoTitle: 'اتصل بنا - الحمد للسيارات',
          seoDescription: 'عناوين ومعلومات الاتصال بفروع الحمد للسيارات في مصر',
          author: 'admin',
          publishedAt: '2024-01-01T00:00:00Z',
          createdAt: '2024-01-01T00:00:00Z',
          updatedAt: '2024-01-10T15:30:00Z'
        }
      ]

      const mockNavigation: NavigationItem[] = [
        {
          id: '1',
          label: 'الرئيسية',
          link: '/',
          order: 0,
          target: '_self',
          isActive: true
        },
        {
          id: '2',
          label: 'السيارات',
          link: '/vehicles',
          order: 1,
          target: '_self',
          isActive: true
        },
        {
          id: '3',
          label: 'خدماتنا',
          link: '/services',
          order: 2,
          target: '_self',
          isActive: true,
          children: [
            {
              id: '4',
              label: 'صيانة',
              link: '/maintenance',
              order: 0,
              parent: '3',
              target: '_self',
              isActive: true
            },
            {
              id: '5',
              label: 'قيادة تجريبية',
              link: '/test-drive',
              order: 1,
              parent: '3',
              target: '_self',
              isActive: true
            }
          ]
        },
        {
          id: '6',
          label: 'من نحن',
          link: '/about',
          order: 3,
          target: '_self',
          isActive: true
        },
        {
          id: '7',
          label: 'اتصل بنا',
          link: '/contact',
          order: 4,
          target: '_self',
          isActive: true
        }
      ]

      const mockSettings: SiteSettings = {
        siteName: 'الحمد للسيارات',
        siteDescription: 'الوكيل الرسمي المعتمد لسيارات تاتا في مصر',
        siteUrl: 'https://elhamd-cars.com',
        primaryColor: '#2563eb',
        secondaryColor: '#dc2626',
        contactEmail: 'info@elhamd-cars.com',
        contactPhone: '+201234567890',
        contactAddress: 'شارع التحرير، مصر الجديدة، القاهرة',
        socialLinks: {
          facebook: 'https://facebook.com/elhamdcars',
          instagram: 'https://instagram.com/elhamdcars'
        },
        seo: {
          metaTitle: 'الحمد للسيارات - الوكيل الرسمي لتاتا في مصر',
          metaDescription: 'الحمد للسيارات هي الوكيل الرسمي المعتمد لسيارات تاتا في مصر. نقدم أحدث الموديلات مع ضمان الجودة الأصلي.',
          metaKeywords: 'تاتا, سيارات, مصر, وكيل, معتمد, الحمد, سيارات جديدة, صيانة'
        }
      }

      setPages(mockPages)
      setNavigation(mockNavigation)
      setSettings(mockSettings)
    } catch (error) {
      console.error('Error loading content data:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredPages = pages.filter(page =>
    page.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    page.slug.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const handleAddPage = () => {
    setPageForm({
      title: '',
      slug: '',
      content: '',
      excerpt: '',
      status: 'draft',
      template: 'default',
      seoTitle: '',
      seoDescription: '',
      featuredImage: ''
    })
    setEditingPage(null)
    setShowPageDialog(true)
  }

  const handleEditPage = (page: ContentPage) => {
    setEditingPage(page)
    setPageForm({
      title: page.title,
      slug: page.slug,
      content: page.content,
      excerpt: page.excerpt || '',
      status: page.status,
      template: page.template,
      seoTitle: page.seoTitle || '',
      seoDescription: page.seoDescription || '',
      featuredImage: page.featuredImage || ''
    })
    setShowPageDialog(true)
  }

  const handleSavePage = async () => {
    try {
      if (editingPage) {
        // Update existing page
        setPages(prev => prev.map(page => 
          page.id === editingPage.id 
            ? { 
                ...page, 
                ...pageForm,
                updatedAt: new Date().toISOString()
              }
            : page
        ))
      } else {
        // Add new page
        const newPage: ContentPage = {
          id: Date.now().toString(),
          ...pageForm,
          author: 'admin',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
        setPages(prev => [...prev, newPage])
      }
      setShowPageDialog(false)
      setPageForm({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        status: 'draft',
        template: 'default',
        seoTitle: '',
        seoDescription: '',
        featuredImage: ''
      })
      setEditingPage(null)
    } catch (error) {
      console.error('Error saving page:', error)
    }
  }

  const handleDeletePage = async (id: string) => {
    if (confirm('هل أنت متأكد من حذف هذه الصفحة؟')) {
      setPages(prev => prev.filter(page => page.id !== id))
    }
  }

  const handleAddNavigation = () => {
    setEditingNav({
      id: '',
      label: '',
      link: '',
      order: navigation.length,
      target: '_self',
      isActive: true
    })
    setShowNavigationDialog(true)
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

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      published: { variant: 'default' as const, label: 'منشورة' },
      draft: { variant: 'secondary' as const, label: 'مسودة' },
      archived: { variant: 'outline' as const, label: 'مؤرشفة' }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const templateOptions = [
    { value: 'default', label: 'افتراضي' },
    { value: 'contact', label: 'اتصال' },
    { value: 'about', label: 'من نحن' },
    { value: 'services', label: 'خدمات' },
    { value: 'full-width', label: 'عرض كامل' }
  ]

  return (
    <div className="max-w-7xl mx-auto">
      {/* Page Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة المحتوى</h1>
        <p className="text-gray-600">تحكم في صفحات الموقع والقوالب والقوائم</p>
        <div className="mt-4 flex gap-3">
          <Button onClick={() => setShowSettingsDialog(true)}>
            <Settings className="ml-2 h-4 w-4" />
            إعدادات الموقع
          </Button>
          <Button variant="outline" onClick={() => router.push('/admin/site-settings')}>
            <Palette className="ml-2 h-4 w-4" />
            المظهر والإعدادات المتقدمة
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pages">الصفحات</TabsTrigger>
          <TabsTrigger value="navigation">القائمة</TabsTrigger>
          <TabsTrigger value="templates">القوالب</TabsTrigger>
        </TabsList>

        {/* Pages Management */}
        <TabsContent value="pages" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة الصفحات</CardTitle>
                  <CardDescription>
                    إنشاء وتعديل صفحات الموقع الثابتة
                  </CardDescription>
                </div>
                <Button onClick={handleAddPage}>
                  <Plus className="ml-2 h-4 w-4" />
                  صفحة جديدة
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="relative mb-4">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="بحث في الصفحات..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
              
              <div className="space-y-4">
                {filteredPages.map((page) => (
                  <Card key={page.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="text-lg font-semibold">{page.title}</h3>
                            {getStatusBadge(page.status)}
                          </div>
                          <p className="text-sm text-gray-600 mb-1">
                            المسار: /{page.slug}
                          </p>
                          <p className="text-sm text-gray-500 mb-2">
                            {page.excerpt}
                          </p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>القالب: {page.template}</span>
                            <span>آخر تحديث: {new Date(page.updatedAt).toLocaleDateString('ar-EG')}</span>
                            {page.publishedAt && (
                              <span>منشورة: {new Date(page.publishedAt).toLocaleDateString('ar-EG')}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm" onClick={() => window.open(`/${page.slug}`, '_blank')}>
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleEditPage(page)}>
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDeletePage(page.id)}>
                            <Trash2 className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Navigation Management */}
        <TabsContent value="navigation" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة القائمة</CardTitle>
                  <CardDescription>
                    تحكم في عناصر القائمة الرئيسية لل موقع
                  </CardDescription>
                </div>
                <Button onClick={handleAddNavigation}>
                  <Plus className="ml-2 h-4 w-4" />
                  عنصر جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {navigation.map((item) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-lg">
                    <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                      <Menu className="h-4 w-4 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{item.label}</div>
                      <div className="text-sm text-gray-600">{item.link}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={item.isActive ? 'default' : 'secondary'}>
                        {item.isActive ? 'نشط' : 'معطل'}
                      </Badge>
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Management */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>إدارة القوالب</CardTitle>
                  <CardDescription>
                    تحكم في قوالب الصفحات وتصميمات المحتوى
                  </CardDescription>
                </div>
                <Button>
                  <Plus className="ml-2 h-4 w-4" />
                  قالب جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <LayoutTemplate className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-semibold mb-2">قالب افتراضي</h3>
                    <p className="text-sm text-gray-600 mb-4">قالب أساسي للصفحات العامة</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">نشط</Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <Smartphone className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-semibold mb-2">قالب الاتصال</h3>
                    <p className="text-sm text-gray-600 mb-4">قالب مخصص لصفحة الاتصال</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="secondary">نشط</Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="aspect-video bg-gray-100 rounded-lg mb-4 flex items-center justify-center">
                      <Monitor className="h-12 w-12 text-gray-400" />
                    </div>
                    <h3 className="font-semibold mb-2">قالب عرض كامل</h3>
                    <p className="text-sm text-gray-600 mb-4">قالب بدون جانب للعرض الكامل</p>
                    <div className="flex items-center justify-between">
                      <Badge variant="outline">غير نشط</Badge>
                      <div className="flex gap-2">
                        <Button variant="ghost" size="sm">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>إعدادات التخطيط</CardTitle>
              <CardDescription>
                تحكم في تخطيط الصفحات وهيكلة المحتوى
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="font-medium">تخطيط الصفحة الرئيسية</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded flex items-center justify-center">
                          <Layout className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <div className="font-medium">تخطيط قياسي</div>
                          <div className="text-sm text-gray-600">رأس، جانب، رئيسي، تذييل</div>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center">
                          <Columns className="h-4 w-4 text-gray-600" />
                        </div>
                        <div>
                          <div className="font-medium">تخطيط عريض</div>
                          <div className="text-sm text-gray-600">بدون جانب، عرض كامل</div>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h4 className="font-medium">عرض المحتوى</h4>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-green-100 rounded flex items-center justify-center">
                          <Type className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <div className="font-medium">نص عادي</div>
                          <div className="text-sm text-gray-600">عرض النصوص بشكل عادي</div>
                        </div>
                      </div>
                      <Switch defaultChecked />
                    </div>
                    <div className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-purple-100 rounded flex items-center justify-center">
                          <ImageIcon className="h-4 w-4 text-purple-600" />
                        </div>
                        <div>
                          <div className="font-medium">عرض البطاقات</div>
                          <div className="text-sm text-gray-600">عرض المحتوى كبطاقات</div>
                        </div>
                      </div>
                      <Switch />
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Page Dialog */}
      <Dialog open={showPageDialog} onOpenChange={setShowPageDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPage ? 'تعديل صفحة' : 'إضافة صفحة جديدة'}
            </DialogTitle>
            <DialogDescription>
              أدخل بيانات الصفحة
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">العنوان *</Label>
                <Input
                  id="title"
                  value={pageForm.title}
                  onChange={(e) => setPageForm({...pageForm, title: e.target.value})}
                  placeholder="عنوان الصفحة"
                />
              </div>
              
              <div>
                <Label htmlFor="slug">المسار *</Label>
                <Input
                  id="slug"
                  value={pageForm.slug}
                  onChange={(e) => setPageForm({...pageForm, slug: e.target.value})}
                  placeholder="page-slug"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="excerpt">ملخص</Label>
              <Textarea
                id="excerpt"
                value={pageForm.excerpt}
                onChange={(e) => setPageForm({...pageForm, excerpt: e.target.value})}
                placeholder="ملخص قصير عن الصفحة"
                rows={2}
              />
            </div>
            
            <div>
              <Label htmlFor="content">المحتوى</Label>
              <Textarea
                id="content"
                value={pageForm.content}
                onChange={(e) => setPageForm({...pageForm, content: e.target.value})}
                placeholder="محتوى الصفحة"
                rows={8}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="status">الحالة</Label>
                <Select value={pageForm.status} onValueChange={(value) => setPageForm({...pageForm, status: value as any})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="published">منشورة</SelectItem>
                    <SelectItem value="draft">مسودة</SelectItem>
                    <SelectItem value="archived">مؤرشفة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="template">القالب</Label>
                <Select value={pageForm.template} onValueChange={(value) => setPageForm({...pageForm, template: value})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {templateOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            
            <div>
              <Label htmlFor="seoTitle">عنوان SEO</Label>
              <Input
                id="seoTitle"
                value={pageForm.seoTitle}
                onChange={(e) => setPageForm({...pageForm, seoTitle: e.target.value})}
                placeholder="عنوان الصفحة لمحركات البحث"
              />
            </div>
            
            <div>
              <Label htmlFor="seoDescription">وصف SEO</Label>
              <Textarea
                id="seoDescription"
                value={pageForm.seoDescription}
                onChange={(e) => setPageForm({...pageForm, seoDescription: e.target.value})}
                placeholder="وصف الصفحة لمحركات البحث"
                rows={2}
              />
            </div>
          </div>
          
          <div className="flex gap-3 mt-6">
            <Button variant="outline" onClick={() => setShowPageDialog(false)}>
              إلغاء
            </Button>
            <Button onClick={handleSavePage}>
              <Save className="ml-2 h-4 w-4" />
              حفظ الصفحة
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Dialog */}
      <Dialog open={showSettingsDialog} onOpenChange={setShowSettingsDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إعدادات الموقع</DialogTitle>
            <DialogDescription>
              تحكم في الإعدادات العامة للموقع
            </DialogDescription>
          </DialogHeader>
          
          {settings && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4">المعلومات الأساسية</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="siteName">اسم الموقع</Label>
                    <Input
                      id="siteName"
                      value={settings.siteName}
                      onChange={(e) => setSettings({...settings, siteName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteDescription">وصف الموقع</Label>
                    <Textarea
                      id="siteDescription"
                      value={settings.siteDescription}
                      onChange={(e) => setSettings({...settings, siteDescription: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="siteUrl">رابط الموقع</Label>
                    <Input
                      id="siteUrl"
                      value={settings.siteUrl}
                      onChange={(e) => setSettings({...settings, siteUrl: e.target.value})}
                    />
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-semibold mb-4">معلومات الاتصال</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="contactEmail">البريد الإلكتروني</Label>
                    <Input
                      id="contactEmail"
                      type="email"
                      value={settings.contactEmail}
                      onChange={(e) => setSettings({...settings, contactEmail: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactPhone">رقم الهاتف</Label>
                    <Input
                      id="contactPhone"
                      value={settings.contactPhone}
                      onChange={(e) => setSettings({...settings, contactPhone: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="contactAddress">العنوان</Label>
                    <Textarea
                      id="contactAddress"
                      value={settings.contactAddress}
                      onChange={(e) => setSettings({...settings, contactAddress: e.target.value})}
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
          
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