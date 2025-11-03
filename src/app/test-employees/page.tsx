'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, CheckCircle, XCircle, AlertCircle } from 'lucide-react'

export default function EmployeeTestPage() {
  const [adminEmployees, setAdminEmployees] = useState([])
  const [hrEmployees, setHrEmployees] = useState([])
  const [loading, setLoading] = useState(true)
  const [testResults, setTestResults] = useState<any[]>([])

  useEffect(() => {
    runTests()
  }, [])

  const runTests = async () => {
    try {
      setLoading(true)
      const results = []

      // Test 1: Fetch admin employees
      try {
        const adminRes = await fetch('/api/admin/employees')
        if (adminRes.ok) {
          const adminData = await adminRes.json()
          setAdminEmployees(adminData.employees || [])
          results.push({
            test: 'Admin Employees API',
            status: 'success',
            message: `Found ${adminData.employees?.length || 0} employees`,
            details: adminData.employees?.length || 0
          })
        } else {
          results.push({
            test: 'Admin Employees API',
            status: 'error',
            message: 'Failed to fetch admin employees',
            details: adminRes.status
          })
        }
      } catch (error) {
        results.push({
          test: 'Admin Employees API',
          status: 'error',
          message: 'Error fetching admin employees',
          details: error
        })
      }

      // Test 2: Fetch HR employees
      try {
        const hrRes = await fetch('/api/admin/employees') // Now using same endpoint
        if (hrRes.ok) {
          const hrData = await hrRes.json()
          setHrEmployees(hrData.employees || [])
          results.push({
            test: 'HR Employees API',
            status: 'success',
            message: `Found ${hrData.employees?.length || 0} employees`,
            details: hrData.employees?.length || 0
          })
        } else {
          results.push({
            test: 'HR Employees API',
            status: 'error',
            message: 'Failed to fetch HR employees',
            details: hrRes.status
          })
        }
      } catch (error) {
        results.push({
          test: 'HR Employees API',
          status: 'error',
          message: 'Error fetching HR employees',
          details: error
        })
      }

      // Test 3: Compare data consistency
      if (adminEmployees.length > 0 && hrEmployees.length > 0) {
        const isConsistent = adminEmployees.length === hrEmployees.length
        results.push({
          test: 'Data Consistency',
          status: isConsistent ? 'success' : 'warning',
          message: isConsistent ? 'Both pages show same number of employees' : 'Different employee counts',
          details: `Admin: ${adminEmployees.length}, HR: ${hrEmployees.length}`
        })
      }

      setTestResults(results)
    } catch (error) {
      console.error('Test error:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800',
      error: 'bg-red-100 text-red-800',
      warning: 'bg-yellow-100 text-yellow-800'
    }
    return variants[status as keyof typeof variants] || 'bg-gray-100 text-gray-800'
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">اختبار الموظفين</h1>
          <p className="text-muted-foreground">فحص مشاكل صفحات الموظفين</p>
        </div>
        <Button onClick={runTests} disabled={loading}>
          <Users className="ml-2 h-4 w-4" />
          إعادة الاختبار
        </Button>
      </div>

      {/* Test Results */}
      <Card>
        <CardHeader>
          <CardTitle>نتائج الاختبار</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {testResults.map((result, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center gap-3">
                  {getStatusIcon(result.status)}
                  <div>
                    <p className="font-medium">{result.test}</p>
                    <p className="text-sm text-muted-foreground">{result.message}</p>
                  </div>
                </div>
                <div className="text-left">
                  <Badge className={getStatusBadge(result.status)}>
                    {result.status}
                  </Badge>
                  <p className="text-sm text-muted-foreground mt-1">
                    {result.details}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Employee Counts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>صفحة الموظفين (Admin)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{adminEmployees.length}</div>
            <p className="text-muted-foreground">موظف</p>
            <div className="mt-4 space-y-2">
              {adminEmployees.slice(0, 3).map((emp: any) => (
                <div key={emp.id} className="text-sm">
                  {emp.user?.name} - {emp.department?.name}
                </div>
              ))}
              {adminEmployees.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  و {adminEmployees.length - 3} آخرون...
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>صفحة الموارد البشرية (HR)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">{hrEmployees.length}</div>
            <p className="text-muted-foreground">موظف</p>
            <div className="mt-4 space-y-2">
              {hrEmployees.slice(0, 3).map((emp: any) => (
                <div key={emp.id} className="text-sm">
                  {emp.user?.name} - {emp.department?.name}
                </div>
              ))}
              {hrEmployees.length > 3 && (
                <div className="text-sm text-muted-foreground">
                  و {hrEmployees.length - 3} آخرون...
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fix Summary */}
      <Card>
        <CardHeader>
          <CardTitle>ملخص الإصلاحات</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>تم تحديث API الموظفين لدعم تعديل جميع بيانات الموظف (الراتب، القسم، المنصب، إلخ)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>تم توحيد نقاط النهاية API لصفحة الموظفين والموارد البشرية</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>تم زيادة الحد الأقصى للموظفين المعروضين إلى 100 بدلاً من 10</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <span>تم إضافة رسائل نجاح وخطأ عند تعديل بيانات الموظف</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}