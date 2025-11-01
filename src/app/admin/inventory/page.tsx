'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Package, TrendingUp, AlertTriangle, Truck } from 'lucide-react'

export default function InventoryPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المخزون</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الأصناف</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,247</div>
            <p className="text-xs text-muted-foreground">
              +12% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة المخزون</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847,500 ر.س</div>
            <p className="text-xs text-muted-foreground">
              +8% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تنبيهات المخزون</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              أصناف تحتاج للطلب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموردون</CardTitle>
            <Truck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              مورد نشط
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الأصناف الأكثر طلباً</CardTitle>
            <CardDescription>
              الأصناف التي تحتاج لإعادة طلب قريباً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'زيت محرك تاتا', stock: 15, minStock: 50, status: 'منخفض' },
                { name: 'فلتر هواء', stock: 8, minStock: 30, status: 'منخفض جداً' },
                { name: 'بطاريات سيارات', stock: 12, minStock: 25, status: 'منخفض' },
                { name: 'إطارات', stock: 45, minStock: 60, status: 'منخفض' },
              ].map((item, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{item.name}</p>
                    <p className="text-sm text-muted-foreground">المخزون: {item.stock} / الحد الأدنى: {item.minStock}</p>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    item.status === 'منخفض جداً' ? 'bg-red-100 text-red-800' :
                    item.status === 'منخفض' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المستودعات</CardTitle>
            <CardDescription>
              حالة المستودعات والمخزون المتاح
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'المستودع الرئيسي', location: 'الرياض', capacity: '85%', items: 847 },
                { name: 'مستودع الفرع', location: 'جدة', capacity: '62%', items: 312 },
                { name: 'مستودع الصيانة', location: 'الدمام', capacity: '45%', items: 88 },
              ].map((warehouse, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{warehouse.name}</p>
                    <p className="text-sm text-muted-foreground">{warehouse.location} - {warehouse.items} صنف</p>
                  </div>
                  <div className="text-left">
                    <div className="text-sm font-medium">{warehouse.capacity}</div>
                    <div className="w-16 h-2 bg-gray-200 rounded-full">
                      <div 
                        className={`h-2 rounded-full ${
                          parseInt(warehouse.capacity) > 80 ? 'bg-red-500' :
                          parseInt(warehouse.capacity) > 60 ? 'bg-yellow-500' :
                          'bg-green-500'
                        }`}
                        style={{ width: warehouse.capacity }}
                      />
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
          <CardTitle>أحدث الحركات</CardTitle>
          <CardDescription>
            آخر حركات المخزون المسجلة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { item: 'زيت محرك تاتا', type: 'وارد', quantity: 100, supplier: 'شركة النفط العربية', date: '2024-01-18' },
              { item: 'فلتر هواء', type: 'صادر', quantity: 25, customer: 'ورشة الأحمد', date: '2024-01-17' },
              { item: 'بطاريات سيارات', type: 'وارد', quantity: 50, supplier: 'شركة البطاريات الوطنية', date: '2024-01-16' },
              { item: 'إطارات', type: 'صادر', quantity: 30, customer: 'وكالة السيارات', date: '2024-01-15' },
            ].map((movement, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{movement.item}</p>
                  <p className="text-sm text-muted-foreground">
                    {movement.type === 'وارد' ? movement.supplier : movement.customer}
                  </p>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      movement.type === 'وارد' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {movement.type}
                    </span>
                    <span className="font-medium">{movement.quantity} قطعة</span>
                  </div>
                  <p className="text-xs text-muted-foreground">{movement.date}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}