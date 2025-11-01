'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, Users, TrendingUp, Calendar } from 'lucide-react'

export default function PayrollPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الرواتب</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرواتب</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">850,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              للشهر الحالي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              في قائمة الرواتب
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الراتب</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5,449 ر.س</div>
            <p className="text-xs text-muted-foreground">
              لكل موظف
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تاريخ الدفع</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">25 يناير</div>
            <p className="text-xs text-muted-foreground">
              بعد 7 أيام
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الرواتب</CardTitle>
          <CardDescription>
            ملخص رواتب الموظفين للشهر الحالي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'أحمد محمد', position: 'مدير مبيعات', department: 'المبيعات', salary: '12,000 ر.س', status: 'معتمد' },
              { name: 'فاطمة علي', position: 'محاسب', department: 'المحاسبة', salary: '8,500 ر.س', status: 'معتمد' },
              { name: 'محمد خالد', position: 'فني سيارات', department: 'الصيانة', salary: '6,000 ر.س', status: 'معتمد' },
              { name: 'نورا حسن', position: 'موظفة موارد بشرية', department: 'الموارد البشرية', salary: '7,000 ر.س', status: 'معتمد' },
            ].map((employee, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-sm text-muted-foreground">{employee.position} - {employee.department}</p>
                </div>
                <div className="text-left">
                  <p className="font-medium">{employee.salary}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    {employee.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}