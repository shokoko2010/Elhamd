'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { MessageSquare, Send, Inbox, Star } from 'lucide-react'

export default function MessagesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">الرسائل</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الرسائل</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">342</div>
            <p className="text-xs text-muted-foreground">
              +45 هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرسائل المرسلة</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">189</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرسائل المستلمة</CardTitle>
            <Inbox className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">153</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الرسائل المهمة</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              تحتاج للرد
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>الرسائل الأخيرة</CardTitle>
          <CardDescription>
            آخر الرسائل المتبادلة
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { from: 'محمد الأحمدي', subject: 'استفسار عن سيارة تاتا نكسون', time: '2024-01-18 14:30', type: 'مستلمة', status: 'جديدة' },
              { from: 'فاطمة علي', subject: 'مواعيد الصيانة', time: '2024-01-18 12:15', type: 'مرسلة', status: 'تم الرد' },
              { from: 'خالد العمر', subject: 'تأكيد موعد اختبار قيادة', time: '2024-01-18 10:45', type: 'مستلمة', status: 'جديدة' },
              { from: 'نورا حسن', subject: 'شكراً على الخدمة الممتازة', time: '2024-01-17 16:20', type: 'مستلمة', status: 'مؤرشفة' },
            ].map((message, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{message.from}</p>
                  <p className="text-sm text-muted-foreground">{message.subject}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">{message.time}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      message.type === 'مستلمة' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                    }`}>
                      {message.type}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      message.status === 'جديدة' ? 'bg-red-100 text-red-800' :
                      message.status === 'تم الرد' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {message.status}
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