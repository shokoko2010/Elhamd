'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Car, Users } from 'lucide-react'

export default function SalesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المبيعات</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المبيعات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,547,850 ر.س</div>
            <p className="text-xs text-muted-foreground">
              +18% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">السيارات المباعة</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">47</div>
            <p className="text-xs text-muted-foreground">
              +8% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العملاء الجدد</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +23% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">24%</div>
            <p className="text-xs text-muted-foreground">
              +3% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>أحدث المبيعات</CardTitle>
            <CardDescription>
              آخر عمليات البيع المكتملة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { customer: 'محمد الأحمدي', car: 'تاتا نكسون EV', price: '85,000 ر.س', date: '2024-01-18' },
                { customer: 'عبدالله العتيبي', car: 'تاتا هارير', price: '110,000 ر.س', date: '2024-01-17' },
                { customer: 'فهد القحطاني', car: 'تاتا بانش', price: '65,000 ر.س', date: '2024-01-16' },
                { customer: 'سالم الشمري', car: 'تاتا ألتروز', price: '72,000 ر.س', date: '2024-01-15' },
              ].map((sale, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{sale.customer}</p>
                    <p className="text-sm text-muted-foreground">{sale.car}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{sale.price}</p>
                    <p className="text-sm text-muted-foreground">{sale.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>أفضل المندوبين</CardTitle>
            <CardDescription>
              ترتيب مندوبي المبيعات هذا الشهر
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'خالد الرشيد', sales: 8, revenue: '680,000 ر.س' },
                { name: 'ناصر العنزي', sales: 6, revenue: '520,000 ر.س' },
                { name: 'سعد الدوسري', sales: 5, revenue: '410,000 ر.س' },
                { name: 'عمر الشهراني', sales: 4, revenue: '340,000 ر.س' },
              ].map((agent, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{agent.name}</p>
                    <p className="text-sm text-muted-foreground">{agent.sales} سيارات</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{agent.revenue}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}