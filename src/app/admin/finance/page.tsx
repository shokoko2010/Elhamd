'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, CreditCard, AlertTriangle } from 'lucide-react'

export default function FinancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الإدارة المالية</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الإيرادات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,847,850 ر.س</div>
            <p className="text-xs text-muted-foreground">
              +18% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المعلقة</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground">
              بانتظار الدفع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الفواتير المتأخرة</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              تحتاج للمتابعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">صافي الربح</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">485,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              17% هامش ربح
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>أحدث الفواتير</CardTitle>
            <CardDescription>
              آخر الفواتير الصادرة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { number: 'INV-2024-001', customer: 'محمد الأحمدي', amount: '85,000 ر.س', status: 'مدفوعة', date: '2024-01-18' },
                { number: 'INV-2024-002', customer: 'عبدالله العلي', amount: '110,000 ر.س', status: 'معلقة', date: '2024-01-17' },
                { number: 'INV-2024-003', customer: 'فهد الأحمد', amount: '65,000 ر.س', status: 'مدفوعة', date: '2024-01-16' },
                { number: 'INV-2024-004', customer: 'سالم العتيبي', amount: '72,000 ر.س', status: 'متأخرة', date: '2024-01-15' },
              ].map((invoice, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-sm text-muted-foreground">{invoice.customer}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{invoice.amount}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        invoice.status === 'مدفوعة' ? 'bg-green-100 text-green-800' :
                        invoice.status === 'معلقة' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {invoice.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{invoice.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>المدفوعات الأخيرة</CardTitle>
            <CardDescription>
              آخر المدفوعات المسجلة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { invoice: 'INV-2024-001', amount: '85,000 ر.س', method: 'تحويل بنكي', date: '2024-01-18' },
                { invoice: 'INV-2024-003', amount: '65,000 ر.س', method: 'بطاقة ائتمان', date: '2024-01-16' },
                { invoice: 'INV-2024-005', amount: '45,000 ر.س', method: 'نقدي', date: '2024-01-14' },
                { invoice: 'INV-2024-006', amount: '92,000 ر.س', method: 'تحويل بنكي', date: '2024-01-13' },
              ].map((payment, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{payment.invoice}</p>
                    <p className="text-sm text-muted-foreground">{payment.method}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{payment.amount}</p>
                    <p className="text-xs text-muted-foreground">{payment.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>ملخص مالي شهري</CardTitle>
          <CardDescription>
            نظرة عامة على الأداء المالي هذا الشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { category: 'مبيعات سيارات', revenue: '2,547,850 ر.س', expenses: '1,850,000 ر.س', profit: '697,850 ر.س', margin: '27%' },
              { category: 'خدمات صيانة', revenue: '300,000 ر.س', expenses: '180,000 ر.س', profit: '120,000 ر.س', margin: '40%' },
              { category: 'قطع غيار', revenue: '180,000 ر.س', expenses: '135,000 ر.س', profit: '45,000 ر.س', margin: '25%' },
              { category: 'خدمات إضافية', revenue: '120,000 ر.س', expenses: '60,000 ر.س', profit: '60,000 ر.س', margin: '50%' },
            ].map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{item.category}</p>
                  <p className="text-sm text-muted-foreground">إيرادات: {item.revenue} | مصروفات: {item.expenses}</p>
                </div>
                <div className="text-left">
                  <p className="font-medium text-green-600">{item.profit}</p>
                  <p className="text-xs text-muted-foreground">هامش: {item.margin}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}