'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, AlertCircle, CheckCircle, Info } from 'lucide-react'

export default function LogsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">سجلات النظام</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي السجلات</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,847</div>
            <p className="text-xs text-muted-foreground">
              آخر 24 ساعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الأخطاء</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground">
              تحتاج للمراجعة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التحذيرات</CardTitle>
            <Info className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">156</div>
            <p className="text-xs text-muted-foreground">
              تحتاج للانتباه
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النجاحات</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15,668</div>
            <p className="text-xs text-muted-foreground">
              عمليات ناجحة
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أحدث السجلات</CardTitle>
          <CardDescription>
            آخر سجلات النظام
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { time: '2024-01-18 14:30:25', level: 'INFO', message: 'تسجيل دخول المستخدم: أحمد محمد', user: 'أحمد محمد' },
              { time: '2024-01-18 14:28:15', level: 'SUCCESS', message: 'تم إنشاء فاتورة جديدة #1234', user: 'فاطمة علي' },
              { time: '2024-01-18 14:25:42', level: 'WARNING', message: 'محاولة تسجيل دخول فاشلة', user: 'مجهول' },
              { time: '2024-01-18 14:22:18', level: 'ERROR', message: 'خطأ في الاتصال بقاعدة البيانات', user: 'النظام' },
              { time: '2024-01-18 14:20:05', level: 'INFO', message: 'تم تحديث بيانات العميل', user: 'خالد العمر' },
            ].map((log, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{log.message}</p>
                  <p className="text-sm text-muted-foreground">{log.time} - {log.user}</p>
                </div>
                <div className="text-left">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    log.level === 'ERROR' ? 'bg-red-100 text-red-800' :
                    log.level === 'WARNING' ? 'bg-yellow-100 text-yellow-800' :
                    log.level === 'SUCCESS' ? 'bg-green-100 text-green-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {log.level}
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