'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { FinancePermissionsManager } from '@/components/admin/finance-permissions-manager'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, Shield, User } from 'lucide-react'
import Link from 'next/link'
import { useParams } from 'next/navigation'

export default function FinancePermissionsPage() {
  const params = useParams()
  const userId = params.id as string

  return (
    <AdminRoute>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/admin/permissions">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 ml-2" />
                العودة للصلاحيات
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-2">
                <Shield className="h-8 w-8 text-blue-600" />
                إدارة الصلاحيات المالية
              </h1>
              <p className="text-gray-600 mt-2">
                إدارة صلاحيات المستخدم المالية والتحكم في الوصول للنظام المالي
              </p>
            </div>
          </div>
        </div>

        {/* Quick Info */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              معلومات سريعة
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900">مجموعات الصلاحيات</h4>
                <p className="text-sm text-blue-700 mt-1">
                  5 مجموعات محددة مسبقاً للصلاحيات المالية
                </p>
              </div>
              <div className="p-4 bg-green-50 rounded-lg">
                <h4 className="font-medium text-green-900">صلاحيات مخصصة</h4>
                <p className="text-sm text-green-700 mt-1">
                  إمكانية تحديد صلاحيات دقيقة للمستخدم
                </p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg">
                <h4 className="font-medium text-purple-900">تحكم كامل</h4>
                <p className="text-sm text-purple-700 mt-1">
                  إدارة كاملة للوصول للنظام المالي
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Finance Permissions Manager */}
        <FinancePermissionsManager 
          userId={userId}
          onPermissionsUpdated={() => {
            console.log('Permissions updated')
          }}
        />
      </div>
    </AdminRoute>
  )
}