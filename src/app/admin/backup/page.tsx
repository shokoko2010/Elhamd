'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Database, Download, Upload, Clock } from 'lucide-react'

export default function BackupPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">النسخ الاحتياطي</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">آخر نسخة احتياطية</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2.4 GB</div>
            <p className="text-xs text-muted-foreground">
              منذ 6 ساعات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النسخ المحفوظة</CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">28</div>
            <p className="text-xs text-muted-foreground">
              آخر 30 يوم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المساحة المستخدمة</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45 GB</div>
            <p className="text-xs text-muted-foreground">
              من 100 GB
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">النسخ التلقائي</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">نشط</div>
            <p className="text-xs text-muted-foreground">
              يومياً الساعة 2 ص
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>سجل النسخ الاحتياطي</CardTitle>
          <CardDescription>
            سجل جميع عمليات النسخ الاحتياطي
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { date: '2024-01-18 02:00', size: '2.4 GB', type: 'تلقائي', status: 'نجح' },
              { date: '2024-01-17 02:00', size: '2.3 GB', type: 'تلقائي', status: 'نجح' },
              { date: '2024-01-16 15:30', size: '2.3 GB', type: 'يدوي', status: 'نجح' },
              { date: '2024-01-16 02:00', size: '2.2 GB', type: 'تلقائي', status: 'نجح' },
            ].map((backup, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{backup.date}</p>
                  <p className="text-sm text-muted-foreground">{backup.type} - {backup.size}</p>
                </div>
                <div className="text-left">
                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800">
                    {backup.status}
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