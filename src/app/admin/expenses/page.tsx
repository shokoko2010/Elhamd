'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, TrendingUp, CreditCard, AlertCircle } from 'lucide-react'

export default function ExpensesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة المصروفات</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المصروفات</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">245,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات التشغيلية</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">180,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              73% من إجمالي المصروفات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات الرأسمالية</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">65,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              27% من إجمالي المصروفات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المصروفات غير المعتمدة</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12,500 ر.س</div>
            <p className="text-xs text-muted-foreground">
              تنتظر الموافقة
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل المصروفات</CardTitle>
          <CardDescription>
            آخر المصروفات المسجلة هذا الشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { category: 'الإيجار', amount: '50,000 ر.س', date: '2024-01-01', status: 'مدفوع' },
              { category: 'الرواتب', amount: '120,000 ر.س', date: '2024-01-25', status: 'معلق' },
              { category: 'الكهرباء والمياه', amount: '8,500 ر.س', date: '2024-01-10', status: 'مدفوع' },
              { category: 'التسويق', amount: '15,000 ر.س', date: '2024-01-15', status: 'مدفوع' },
              { category: 'الصيانة', amount: '12,000 ر.س', date: '2024-01-18', status: 'معلق' },
            ].map((expense, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{expense.category}</p>
                  <p className="text-sm text-muted-foreground">{expense.date}</p>
                </div>
                <div className="text-left">
                  <p className="font-medium">{expense.amount}</p>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    expense.status === 'مدفوع' 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {expense.status}
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