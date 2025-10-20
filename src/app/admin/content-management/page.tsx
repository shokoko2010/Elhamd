'use client'

import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  FileText, 
  Layout, 
  Type, 
  Palette, 
  Settings,
  ExternalLink,
  Eye,
  Edit,
  Save,
  Home
} from 'lucide-react'

export default function ContentManagementPage() {
  return (
    <AdminRoute>
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">إدارة المحتوى</h1>
            <p className="text-gray-600">إدارة وتخصيص محتوى الموقع بالكامل</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => window.open('/', '_blank')}>
              <Eye className="w-4 h-4 mr-2" />
              معاينة الموقع
            </Button>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="header">الهيدر</TabsTrigger>
            <TabsTrigger value="footer">الفوتر</TabsTrigger>
            <TabsTrigger value="pages">الصفحات</TabsTrigger>
            <TabsTrigger value="seo">SEO</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('/admin/header', '_self')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Layout className="w-5 h-5 text-blue-600" />
                    الهيدر
                  </CardTitle>
                  <CardDescription>
                    تخصيص شريط التن العلوي للموقع
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الشعار</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>القائمة</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>معلومات الاتصال</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل الهيدر
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('/admin/footer', '_self')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Type className="w-5 h-5 text-green-600" />
                    الفوتر
                  </CardTitle>
                  <CardDescription>
                    تخصيص شريط التن السفلي للموقع
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الأعمدة</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الروابط</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>وسائل التواصل</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل الفوتر
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('/admin/site-settings', '_self')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-600" />
                    إعدادات الموقع
                  </CardTitle>
                  <CardDescription>
                    الإعدادات العامة والمظهر
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الألوان</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الخطوط</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>معلومات الاتصال</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل الإعدادات
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('/admin/page-seo', '_self')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="w-5 h-5 text-orange-600" />
                    SEO
                  </CardTitle>
                  <CardDescription>
                    تحسين محركات البحث
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Meta Tags</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الكلمات المفتاحية</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الوصف</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل SEO
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('/admin/content', '_self')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="w-5 h-5 text-red-600" />
                    المحتوى
                  </CardTitle>
                  <CardDescription>
                    إدارة صفحات المحتوى
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الصفحات</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>المقالات</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الوسائط</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل المحتوى
                  </Button>
                </CardContent>
              </Card>

              <Card className="hover:shadow-lg transition-shadow cursor-pointer" onClick={() => window.open('/admin/media', '_self')}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ExternalLink className="w-5 h-5 text-indigo-600" />
                    الوسائط
                  </CardTitle>
                  <CardDescription>
                    إدارة الصور والملفات
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>الصور</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>الملفات</span>
                      <span className="text-green-600">✓</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>المكتبة</span>
                      <span className="text-green-600">✓</span>
                    </div>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    <Edit className="w-4 h-4 mr-2" />
                    تعديل الوسائط
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="header" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الهيدر</CardTitle>
                <CardDescription>
                  تخصيص جميع عناصر الهيدر Including الشعار والقائمة ومعلومات الاتصال
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => window.open('/admin/header', '_self')} className="h-20 flex-col">
                    <Layout className="w-6 h-6 mb-2" />
                    تعديل الهيدر
                  </Button>
                  <Button onClick={() => window.open('/admin/header', '_self')} variant="outline" className="h-20 flex-col">
                    <Settings className="w-6 h-6 mb-2" />
                    إعدادات الهيدر
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="footer" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الفوتر</CardTitle>
                <CardDescription>
                  تخصيص جميع عناصر الفوتر Including الأعمدة والروابط ووسائل التواصل
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => window.open('/admin/footer', '_self')} className="h-20 flex-col">
                    <Type className="w-6 h-6 mb-2" />
                    تعديل الفوتر
                  </Button>
                  <Button onClick={() => window.open('/admin/footer', '_self')} variant="outline" className="h-20 flex-col">
                    <Settings className="w-6 h-6 mb-2" />
                    إعدادات الفوتر
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="pages" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة الصفحات</CardTitle>
                <CardDescription>
                  إدارة محتوى الصفحات المختلفة في الموقع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button onClick={() => window.open('/admin/content', '_self')} className="h-20 flex-col">
                    <FileText className="w-6 h-6 mb-2" />
                    المحتوى العام
                  </Button>
                  <Button onClick={() => window.open('/admin/homepage', '_self')} variant="outline" className="h-20 flex-col">
                    <Home className="w-6 h-6 mb-2" />
                    الصفحة الرئيسية
                  </Button>
                  <Button onClick={() => window.open('/admin/page-seo', '_self')} variant="outline" className="h-20 flex-col">
                    <Palette className="w-6 h-6 mb-2" />
                    SEO
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="seo" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>إدارة SEO</CardTitle>
                <CardDescription>
                  تحسين محركات البحث وإعدادات Meta
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button onClick={() => window.open('/admin/page-seo', '_self')} className="h-20 flex-col">
                    <Palette className="w-6 h-6 mb-2" />
                    إعدادات SEO
                  </Button>
                  <Button onClick={() => window.open('/admin/site-settings', '_self')} variant="outline" className="h-20 flex-col">
                    <Settings className="w-6 h-6 mb-2" />
                    إعدادات الموقع
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminRoute>
  )
}