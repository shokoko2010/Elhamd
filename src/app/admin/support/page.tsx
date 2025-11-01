'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Headphones, MessageSquare, Clock, CheckCircle } from 'lucide-react'

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">دعم العملاء</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي التذاكر</CardTitle>
            <Headphones className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              +12 هذا الأسبوع
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15</div>
            <p className="text-xs text-muted-foreground">
              تنتظر الرد
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيد المعالجة</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
            <p className="text-xs text-muted-foreground">
              جاري العمل عليها
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مغلقة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">66</div>
            <p className="text-xs text-muted-foreground">
              تم حلها
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أحدث تذاكر الدعم</CardTitle>
          <CardDescription>
            التذاكر التي تحتاج لاهتمامك
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { customer: 'محمد الأحمدي', subject: 'مشكلة في نظام الملاحة', priority: 'عالية', status: 'في الانتظار', time: '2024-01-18 14:30' },
              { customer: 'فاطمة علي', subject: 'استفسار عن الصيانة الدورية', priority: 'متوسطة', status: 'قيد المعالجة', time: '2024-01-18 12:15' },
              { customer: 'خالد العمر', subject: 'مشكلة في المكيف', priority: 'عالية', status: 'في الانتظار', time: '2024-01-18 10:45' },
              { customer: 'نورا حسن', subject: 'استفسار عن الضمان', priority: 'منخفضة', status: 'قيد المعالجة', time: '2024-01-17 16:20' },
            ].map((ticket, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{ticket.customer}</p>
                  <p className="text-sm text-muted-foreground">{ticket.subject}</p>
                </div>
                <div className="text-left">
                  <p className="text-sm text-muted-foreground">{ticket.time}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      ticket.priority === 'عالية' ? 'bg-red-100 text-red-800' :
                      ticket.priority === 'متوسطة' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.priority}
                    </span>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      ticket.status === 'في الانتظار' ? 'bg-blue-100 text-blue-800' :
                      ticket.status === 'قيد المعالجة' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-green-100 text-green-800'
                    }`}>
                      {ticket.status}
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