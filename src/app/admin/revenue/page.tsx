'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { TrendingUp, DollarSign, Car, Users } from 'lucide-react'

export default function RevenuePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تقارير الإيرادات</h1>
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
            <CardTitle className="text-sm font-medium">مبيعات السيارات</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,547,850 ر.س</div>
            <p className="text-xs text-muted-foreground">
              89% من إجمالي الإيرادات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الخدمات</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">300,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              11% من إجمالي الإيرادات
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

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الإيرادات الشهرية</CardTitle>
          <CardDescription>
            تحليل الإيرادات حسب المصدر لهذا الشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { source: 'مبيعات سيارات جديدة', amount: '1,850,000 ر.س', percentage: '65%', trend: '+12%' },
              { source: 'مبيعات سيارات مستعملة', amount: '697,850 ر.س', percentage: '24%', trend: '+8%' },
              { source: 'خدمات الصيانة', amount: '180,000 ر.س', percentage: '6%', trend: '+15%' },
              { source: 'قطع غيار', amount: '75,000 ر.س', percentage: '3%', trend: '+5%' },
              { source: 'خدمات إضافية', amount: '45,000 ر.س', percentage: '2%', trend: '+10%' },
            ].map((revenue, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{revenue.source}</p>
                  <p className="text-sm text-muted-foreground">{revenue.percentage} من إجمالي الإيرادات</p>
                </div>
                <div className="text-left">
                  <p className="font-medium">{revenue.amount}</p>
                  <p className="text-xs text-green-600">{revenue.trend} من الشهر الماضي</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}