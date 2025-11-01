'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Clock, Users, CheckCircle, AlertTriangle } from 'lucide-react'

export default function AttendancePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">نظام الحضور والانصراف</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحاضرين اليوم</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
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
            <CardTitle className="text-sm font-medium">المتأخرين</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              5% من إجمالي الموظفين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في إجازة</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">6</div>
            <p className="text-xs text-muted-foreground">
              4% من إجمالي الموظفين
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الغياب</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              لا يوجد غياب اليوم
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل الحضور اليوم</CardTitle>
          <CardDescription>
            سجل حضور وانصراف الموظفين ليوم {new Date().toLocaleDateString('ar-SA')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'أحمد محمد', department: 'المبيعات', checkIn: '07:45', checkOut: '-', status: 'حاضر' },
              { name: 'فاطمة علي', department: 'المحاسبة', checkIn: '07:50', checkOut: '-', status: 'حاضر' },
              { name: 'محمد خالد', department: 'الصيانة', checkIn: '08:15', checkOut: '-', status: 'متأخر' },
              { name: 'نورا حسن', department: 'الموارد البشرية', checkIn: '-', checkOut: '-', status: 'إجازة' },
            ].map((record, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{record.name}</p>
                  <p className="text-sm text-muted-foreground">{record.department}</p>
                </div>
                <div className="text-left">
                  <div className="flex items-center gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">دخول</p>
                      <p className="font-medium">{record.checkIn}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">خروج</p>
                      <p className="font-medium">{record.checkOut}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      record.status === 'حاضر' ? 'bg-green-100 text-green-800' :
                      record.status === 'متأخر' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {record.status}
                    </span>
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