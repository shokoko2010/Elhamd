'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, AlertCircle, CheckCircle } from 'lucide-react'

export default function BudgetPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الميزانية</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الميزانية الإجمالية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3,500,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              للسنة المالية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2,245,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              64% من الميزانية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتبقي</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,255,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              36% من الميزانية
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحذيرات</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">
              أقسام تجاوزت الميزانية
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>توزيع الميزانية حسب الأقسام</CardTitle>
          <CardDescription>
            نظرة عامة على الميزانية المخصصة لكل قسم
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { department: 'المبيعات', budget: '800,000 ر.س', spent: '650,000 ر.س', remaining: '150,000 ر.س', status: 'آمن' },
              { department: 'التسويق', budget: '400,000 ر.س', spent: '380,000 ر.س', remaining: '20,000 ر.س', status: 'تحذير' },
              { department: 'الصيانة', budget: '600,000 ر.س', spent: '450,000 ر.س', remaining: '150,000 ر.س', status: 'آمن' },
              { department: 'الموارد البشرية', budget: '500,000 ر.س', spent: '520,000 ر.س', remaining: '-20,000 ر.س', status: 'تجاوز' },
              { department: 'العمليات', budget: '700,000 ر.س', spent: '245,000 ر.س', remaining: '455,000 ر.س', status: 'آمن' },
            ].map((dept, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{dept.department}</p>
                  <p className="text-sm text-muted-foreground">الميزانية: {dept.budget}</p>
                </div>
                <div className="text-left">
                  <p className="font-medium">المصروف: {dept.spent}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      dept.status === 'آمن' ? 'bg-green-100 text-green-800' :
                      dept.status === 'تحذير' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {dept.status}
                    </span>
                    <span className="text-xs text-muted-foreground">متبقي: {dept.remaining}</span>
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