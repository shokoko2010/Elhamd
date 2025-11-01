'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, Clock, CheckCircle, AlertCircle } from 'lucide-react'

export default function QuotationsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة عروض الأسعار</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العروض</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">234</div>
            <p className="text-xs text-muted-foreground">
              +12% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              تنتظر موافقة العميل
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معتمدة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              تمت الموافقة عليها
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">منتهية الصلاحية</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              تحتاج للتجديد
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>أحدث عروض الأسعار</CardTitle>
            <CardDescription>
              العروض التي تم إنشاؤها مؤخراً
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { customer: 'سالم محمد', car: 'تاتا نكسون EV', price: '85,000 ر.س', status: 'في الانتظار', date: '2024-01-18' },
                { customer: 'ناصر العلي', car: 'تاتا هارير', price: '110,000 ر.س', status: 'معتمد', date: '2024-01-17' },
                { customer: 'فهد الأحمد', car: 'تاتا بانش', price: '65,000 ر.س', status: 'في الانتظار', date: '2024-01-16' },
                { customer: 'عبدالله خالد', car: 'تاتا ألتروز', price: '72,000 ر.س', status: 'معتمد', date: '2024-01-15' },
              ].map((quotation, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{quotation.customer}</p>
                    <p className="text-sm text-muted-foreground">{quotation.car}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{quotation.price}</p>
                    <div className="flex items-center gap-2">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        quotation.status === 'معتمد' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {quotation.status}
                      </span>
                      <span className="text-xs text-muted-foreground">{quotation.date}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>عروض قريبة الانتهاء</CardTitle>
            <CardDescription>
              العروض التي ستنتهي صلاحيتها خلال 3 أيام
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { customer: 'محمد السعيد', car: 'تاتا تياجو', price: '45,000 ر.س', expiresIn: 'يوم واحد' },
                { customer: 'خالد العمر', car: 'تاتا سفاري', price: '125,000 ر.س', expiresIn: 'يومان' },
                { customer: 'عمر الحربي', car: 'تاتا زينون', price: '95,000 ر.س', expiresIn: '3 أيام' },
              ].map((quotation, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{quotation.customer}</p>
                    <p className="text-sm text-muted-foreground">{quotation.car}</p>
                  </div>
                  <div className="text-left">
                    <p className="font-medium">{quotation.price}</p>
                    <p className="text-xs text-red-600">ينتهي خلال {quotation.expiresIn}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}