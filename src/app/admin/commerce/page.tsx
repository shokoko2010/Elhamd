'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ShoppingCart, DollarSign, Package, Gift, TrendingUp, Store } from 'lucide-react'

export default function AdminCommercePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">إدارة التجارة الإلكترونية</h1>
          <p className="text-gray-600 mt-2">تحكم في جميع جوانب المتجر الإلكتروني والمبيعات</p>
        </div>
        <div className="flex gap-2">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            <Store className="h-4 w-4" />
            معاينة المتجر
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الطلبات</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +23% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847,500 ر.س</div>
            <p className="text-xs text-muted-foreground">
              +18% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط قيمة الطلب</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,285 ر.س</div>
            <p className="text-xs text-muted-foreground">
              +5% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المنتجات</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              منتج نشط
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الطلبات الأخيرة</CardTitle>
            <CardDescription>
              آخر 5 طلبات في المتجر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { orderNumber: 'ORD-2024-001', customer: 'محمد الأحمدي', total: '85,000 ر.س', status: 'مكتمل', date: '2024-01-18' },
                { orderNumber: 'ORD-2024-002', customer: 'عبدالله العلي', total: '110,000 ر.س', status: 'قيد التوصيل', date: '2024-01-17' },
                { orderNumber: 'ORD-2024-003', customer: 'فهد الأحمد', total: '65,000 ر.س', status: 'قيد المعالجة', date: '2024-01-16' },
                { orderNumber: 'ORD-2024-004', customer: 'سالم العتيبي', total: '72,000 ر.س', status: 'مكتمل', date: '2024-01-15' },
                { orderNumber: 'ORD-2024-005', customer: 'خالد العمر', total: '45,000 ر.س', status: 'ملغي', date: '2024-01-14' },
              ].map((order, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{order.orderNumber}</p>
                    <p className="text-sm text-muted-foreground">{order.customer}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{order.total}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        order.status === 'مكتمل' ? 'bg-green-100 text-green-800' :
                        order.status === 'قيد التوصيل' ? 'bg-blue-100 text-blue-800' :
                        order.status === 'قيد المعالجة' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {order.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{order.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>العروض الترويجية النشطة</CardTitle>
            <CardDescription>
              العروض المتاحة حالياً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: 'خصم 15% على جميع السيارات', code: 'SUMMER15', discount: '15%', usage: '45/100', expiry: '2024-02-28' },
                { title: 'توصيل مجاني للطلبات فوق 50,000', code: 'FREESHIP', discount: 'توصيل مجاني', usage: '23/50', expiry: '2024-02-15' },
                { title: 'خصم 5,000 على سيارات تاتا', code: 'TATA5000', discount: '5,000 ر.س', usage: '12/30', expiry: '2024-02-10' },
                { title: 'نقاط مضاعفة', code: 'DOUBLEPOINTS', discount: '2x نقاط', usage: '67/200', expiry: '2024-03-01' },
              ].map((promotion, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{promotion.title}</p>
                    <p className="text-sm text-muted-foreground">الكود: {promotion.code}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{promotion.discount}</p>
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                        {promotion.usage}
                      </span>
                      <span className="text-xs text-muted-foreground">ينتهي: {promotion.expiry}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>إعدادات المتجر</CardTitle>
          <CardDescription>
            إعدادات المتجر الإلكتروني
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">التجارة الإلكترونية</p>
                  <p className="text-sm text-muted-foreground">تفعيل المتجر الإلكتروني</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الشراء عبر الإنترنت</p>
                  <p className="text-sm text-muted-foreground">السماح بالشراء المباشر</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الموافقة التلقائية</p>
                  <p className="text-sm text-muted-foreground">تأكيد الطلبات تلقائياً</p>
                </div>
                <div className="w-12 h-6 bg-gray-300 rounded-full relative">
                  <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">المدفوعات الإلكترونية</p>
                  <p className="text-sm text-muted-foreground">تفعيل الدفع الإلكتروني</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">الشحن</p>
                  <p className="text-sm text-muted-foreground">تفعيل خدمة الشحن</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">التقييمات</p>
                  <p className="text-sm text-muted-foreground">تفعيل تقييم المنتجات</p>
                </div>
                <div className="w-12 h-6 bg-blue-600 rounded-full relative">
                  <div className="absolute right-1 top-1 w-4 h-4 bg-white rounded-full"></div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}