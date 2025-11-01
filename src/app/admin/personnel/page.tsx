'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, UserCheck, Calendar, TrendingUp } from 'lucide-react'

export default function PersonnelPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الموظفين</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الموظفين</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              +12% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">موظفين نشطين</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">142</div>
            <p className="text-xs text-muted-foreground">
              91% من إجمالي الموظفين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجازات اليوم</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              5 إجازات مرضية، 3 إجازات اعتيادية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الأداء</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">87%</div>
            <p className="text-xs text-muted-foreground">
              +5% من الشهر الماضي
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>الموظفون الجدد</CardTitle>
            <CardDescription>
              آخر الموظفين الذين انضموا للشركة
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'أحمد محمد', position: 'مندوب مبيعات', date: '2024-01-15' },
                { name: 'فاطمة علي', position: 'محاسب', date: '2024-01-10' },
                { name: 'محمد خالد', position: 'فني سيارات', date: '2024-01-08' },
              ].map((employee, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.position}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{employee.date}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>جدول الإجازات القادم</CardTitle>
            <CardDescription>
              الإجازات المعتمدة للأسبوعين القادمين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'عبدالله سعيد', type: 'إجازة اعتيادية', period: '20-24 يناير' },
                { name: 'نورا حسن', type: 'إجازة مرضية', period: '22-23 يناير' },
                { name: 'خالد عمر', type: 'إجازة اعتيادية', period: '25-30 يناير' },
              ].map((leave, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{leave.name}</p>
                    <p className="text-sm text-muted-foreground">{leave.type}</p>
                  </div>
                  <div className="text-sm text-muted-foreground">{leave.period}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}