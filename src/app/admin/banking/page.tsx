'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { DollarSign, CreditCard, Building, TrendingUp } from 'lucide-react'

export default function BankingPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">إدارة الحسابات البنكية</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرصيد الإجمالي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1,847,500 ر.س</div>
            <p className="text-xs text-muted-foreground">
              جميع الحسابات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحساب الجاري</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">825,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              الحساب الرئيسي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">حساب التوفير</CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">750,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              احتياطي نقدي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التدفقات النقدية</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+125,000 ر.س</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تفاصيل الحسابات البنكية</CardTitle>
          <CardDescription>
            نظرة عامة على جميع الحسابات البنكية للشركة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { bank: 'الراجحي', account: 'الحساب الجاري', number: 'SA1234567890', balance: '825,000 ر.س', status: 'نشط' },
              { bank: 'الراجحي', account: 'حساب التوفير', number: 'SA0987654321', balance: '750,000 ر.س', status: 'نشط' },
              { bank: 'الأهلي', account: 'حساب الرواتب', number: 'SA1122334455', balance: '272,500 ر.س', status: 'نشط' },
            ].map((account, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{account.bank} - {account.account}</p>
                  <p className="text-sm text-muted-foreground">رقم الحساب: {account.number}</p>
                </div>
                <div className="text-left">
                  <p className="font-medium">{account.balance}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    {account.status}
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