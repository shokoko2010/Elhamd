'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, Calendar, DollarSign, TrendingUp } from 'lucide-react'

export default function HRPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الموارد البشرية</h1>
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
            <CardTitle className="text-sm font-medium">الإجازات المعلقة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              تنتظر الموافقة
            </p>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium">نسبة النشاط</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">91%</div>
            <p className="text-xs text-muted-foreground">
              موظفين نشطين
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
                { name: 'أحمد محمد', position: 'مندوب مبيعات', department: 'المبيعات', date: '2024-01-15' },
                { name: 'فاطمة علي', position: 'محاسب', department: 'المحاسبة', date: '2024-01-10' },
                { name: 'محمد خالد', position: 'فني سيارات', department: 'الصيانة', date: '2024-01-08' },
                { name: 'نورا حسن', position: 'موظفة موارد بشرية', department: 'الموارد البشرية', date: '2024-01-05' },
              ].map((employee, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{employee.name}</p>
                    <p className="text-sm text-muted-foreground">{employee.position} - {employee.department}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">{employee.date}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>طلبات الإجازات</CardTitle>
            <CardDescription>
              الطلبات التي تحتاج لموافقتك
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { name: 'عبدالله سعيد', type: 'إجازة اعتيادية', period: '20-24 يناير', days: 5, status: 'قيد الانتظار' },
                { name: 'نورا حسن', type: 'إجازة مرضية', period: '22-23 يناير', days: 2, status: 'قيد الانتظار' },
                { name: 'خالد عمر', type: 'إجازة طارئة', period: '25 يناير', days: 1, status: 'قيد الانتظار' },
                { name: 'سالم العتيبي', type: 'إجازة اعتيادية', period: '25-30 يناير', days: 6, status: 'معتمد' },
              ].map((leave, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <p className="font-medium">{leave.name}</p>
                    <p className="text-sm text-muted-foreground">{leave.type} - {leave.period}</p>
                  </div>
                  <div className="text-left">
                    <p className="text-sm text-muted-foreground">{leave.days} أيام</p>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      leave.status === 'قيد الانتظار' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توزيع الموظفين حسب الأقسام</CardTitle>
          <CardDescription>
            نظرة عامة على توزيع الموظفين في الأقسام المختلفة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { department: 'المبيعات', employees: 45, percentage: '29%' },
              { department: 'الصيانة', employees: 38, percentage: '24%' },
              { department: 'المحاسبة', employees: 12, percentage: '8%' },
              { department: 'الموارد البشرية', employees: 8, percentage: '5%' },
              { department: 'الإدارة', employees: 15, percentage: '10%' },
              { department: 'العمليات', employees: 38, percentage: '24%' },
            ].map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{dept.department}</p>
                  <p className="text-sm text-muted-foreground">{dept.employees} موظف</p>
                </div>
                <div className="text-left">
                  <p className="font-medium">{dept.percentage}</p>
                  <div className="w-24 h-2 bg-gray-200 rounded-full">
                    <div 
                      className="h-2 bg-blue-500 rounded-full"
                      style={{ width: dept.percentage }}
                    />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}