'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Upload, FileText, Database, CheckCircle } from 'lucide-react'

export default function ImportPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">استيراد البيانات</h1>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاستيرادات اليوم</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">
              +3 من الأمس
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">ملفات CSV</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">89</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قواعد البيانات</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">
              استيرادات كاملة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الاستيرادات الناجحة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">98%</div>
            <p className="text-xs text-muted-foreground">
              معدل النجاح
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>قوالب الاستيراد المتاحة</CardTitle>
          <CardDescription>
            القوالب الجاهزة لاستيراد البيانات
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[
              { name: 'استيراد العملاء', format: 'CSV', template: 'customers_template.csv', records: '~1,200 سجل' },
              { name: 'استيراد السيارات', format: 'Excel', template: 'vehicles_template.xlsx', records: '~450 سجل' },
              { name: 'استيراد الموردين', format: 'CSV', template: 'suppliers_template.csv', records: '~85 سجل' },
              { name: 'استيراد المنتجات', format: 'Excel', template: 'products_template.xlsx', records: '~2,300 سجل' },
            ].map((template, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div>
                  <p className="font-medium">{template.name}</p>
                  <p className="text-sm text-muted-foreground">{template.format} - {template.template}</p>
                </div>
                <div className="text-left">
                  <p className="font-medium">{template.records}</p>
                  <div className="flex gap-2">
                    <button className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-800 hover:bg-blue-200">
                      تحميل القالب
                    </button>
                    <button className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-800 hover:bg-green-200">
                      استيراد
                    </button>
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