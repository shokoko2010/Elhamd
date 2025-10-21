'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Separator } from '@/components/ui/separator'
import { 
  User, 
  Shield, 
  Settings, 
  Check, 
  X, 
  AlertCircle,
  Lock,
  Unlock,
  Eye,
  FileText,
  CreditCard,
  Receipt,
  TrendingUp
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface User {
  id: string
  name: string
  email: string
  role: string
}

interface FinancePermissionGroup {
  name: string
  displayName: string
  description: string
  permissions: string[]
}

interface FinancePermissionsManagerProps {
  userId: string
  onPermissionsUpdated?: () => void
}

export function FinancePermissionsManager({ userId, onPermissionsUpdated }: FinancePermissionsManagerProps) {
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [currentPermissions, setCurrentPermissions] = useState<string[]>([])
  const [userGroups, setUserGroups] = useState<string[]>([])
  const [availableGroups, setAvailableGroups] = useState<FinancePermissionGroup[]>([])
  const [selectedGroup, setSelectedGroup] = useState<string>('')
  const [customPermissions, setCustomPermissions] = useState<string[]>([])
  const [useCustom, setUseCustom] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchFinancePermissions()
  }, [userId])

  const fetchFinancePermissions = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/users/${userId}/finance-permissions`)
      
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setCurrentPermissions(data.currentPermissions)
        setUserGroups(data.userGroups)
        setAvailableGroups(data.groupDefinitions)
        
        // Set initial selected group if user has one
        if (data.userGroups.length > 0) {
          setSelectedGroup(data.userGroups[0])
        }
      } else {
        const error = await response.json()
        toast({
          title: 'خطأ',
          description: error.error || 'فشل في جلب الصلاحيات المالية',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في جلب الصلاحيات المالية',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const updatePermissions = async () => {
    try {
      setUpdating(true)
      
      const payload = useCustom 
        ? { customPermissions }
        : { group: selectedGroup }

      const response = await fetch(`/api/admin/users/${userId}/finance-permissions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: 'نجاح',
          description: data.message || 'تم تحديث الصلاحيات بنجاح'
        })
        
        // Refresh data
        await fetchFinancePermissions()
        
        if (onPermissionsUpdated) {
          onPermissionsUpdated()
        }
      } else {
        const error = await response.json()
        toast({
          title: 'خطأ',
          description: error.error || 'فشل في تحديث الصلاحيات',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث الصلاحيات',
        variant: 'destructive'
      })
    } finally {
      setUpdating(false)
    }
  }

  const getPermissionIcon = (permission: string) => {
    if (permission.includes('invoice')) return FileText
    if (permission.includes('payment')) return CreditCard
    if (permission.includes('quotation')) return Receipt
    if (permission.includes('report') || permission.includes('overview')) return TrendingUp
    return Shield
  }

  const getPermissionDisplayName = (permission: string) => {
    const names: Record<string, string> = {
      'view_financials': 'عرض البيانات المالية',
      'view_invoices': 'عرض الفواتير',
      'create_invoices': 'إنشاء فواتير',
      'edit_invoices': 'تعديل الفواتير',
      'delete_invoices': 'حذف الفواتير',
      'approve_invoices': 'الموافقة على الفواتير',
      'send_invoices': 'إرسال الفواتير',
      'download_invoices': 'تحميل الفواتير',
      'manage_quotations': 'إدارة عروض الأسعار',
      'approve_quotations': 'الموافقة على عروض الأسعار',
      'convert_quotations': 'تحويل عروض الأسعار',
      'manage_payments': 'إدارة المدفوعات',
      'process_offline_payments': 'معالجة المدفوعات النقدية',
      'manage_payment_methods': 'إدارة طرق الدفع',
      'view_payment_history': 'عرض سجل المدفوعات',
      'refund_payments': 'استرداد المدفوعات',
      'manage_tax_settings': 'إدارة إعدادات الضريبة',
      'view_reports': 'عرض التقارير',
      'export_financial_data': 'تصدير البيانات المالية',
      'view_financial_overview': 'عرض نظرة عامة مالية',
      'access_finance_dashboard': 'الوصول للوحة التحكم المالية'
    }
    return names[permission] || permission
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <p className="text-gray-600">المستخدم غير موجود</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* User Info */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            معلومات المستخدم
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-600">الاسم</label>
              <p className="font-semibold">{user.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">البريد الإلكتروني</label>
              <p className="font-semibold">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-600">الدور</label>
              <Badge variant="outline">{user.role}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Current Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            الصلاحيات المالية الحالية
          </CardTitle>
          <CardDescription>
            الصلاحيات المالية التي يمتلكها المستخدم حالياً
          </CardDescription>
        </CardHeader>
        <CardContent>
          {currentPermissions.length > 0 ? (
            <div className="space-y-3">
              {userGroups.length > 0 && (
                <div>
                  <span className="text-sm font-medium text-gray-600">المجموعات المحددة:</span>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userGroups.map(group => (
                      <Badge key={group} variant="default">
                        {availableGroups.find(g => g.name === group)?.displayName || group}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
              
              <Separator />
              
              <div>
                <span className="text-sm font-medium text-gray-600">الصلاحيات التفصيلية:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 mt-3">
                  {currentPermissions.map(permission => {
                    const Icon = getPermissionIcon(permission)
                    return (
                      <div key={permission} className="flex items-center gap-2 p-2 border rounded-lg">
                        <Icon className="h-4 w-4 text-blue-600" />
                        <span className="text-sm">{getPermissionDisplayName(permission)}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Lock className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">لا يوجد لدى المستخدم صلاحيات مالية حالية</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Update Permissions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            تحديث الصلاحيات المالية
          </CardTitle>
          <CardDescription>
            قم بتعيين صلاحيات مالية جديدة للمستخدم
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Permission Type Selection */}
          <div>
            <label className="text-sm font-medium text-gray-600 mb-3 block">نوع الصلاحيات</label>
            <div className="flex gap-4">
              <Button
                variant={!useCustom ? "default" : "outline"}
                onClick={() => setUseCustom(false)}
              >
                <Shield className="h-4 w-4 ml-2" />
                مجموعات محددة مسبقاً
              </Button>
              <Button
                variant={useCustom ? "default" : "outline"}
                onClick={() => setUseCustom(true)}
              >
                <Settings className="h-4 w-4 ml-2" />
                صلاحيات مخصصة
              </Button>
            </div>
          </div>

          {!useCustom ? (
            /* Predefined Groups */
            <div>
              <label className="text-sm font-medium text-gray-600 mb-3 block">اختر مجموعة الصلاحيات</label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="اختر مجموعة الصلاحيات" />
                </SelectTrigger>
                <SelectContent>
                  {availableGroups.map(group => (
                    <SelectItem key={group.name} value={group.name}>
                      <div>
                        <div className="font-medium">{group.displayName}</div>
                        <div className="text-sm text-gray-600">{group.description}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {selectedGroup && (
                <div className="mt-4 p-4 border rounded-lg">
                  <h4 className="font-medium mb-3">الصلاحيات في هذه المجموعة:</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    {availableGroups.find(g => g.name === selectedGroup)?.permissions.map(permission => {
                      const Icon = getPermissionIcon(permission)
                      return (
                        <div key={permission} className="flex items-center gap-2 text-sm">
                          <Icon className="h-3 w-3 text-green-600" />
                          <Check className="h-3 w-3 text-green-600" />
                          {getPermissionDisplayName(permission)}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </div>
          ) : (
            /* Custom Permissions */
            <div>
              <label className="text-sm font-medium text-gray-600 mb-3 block">اختر الصلاحيات المخصصة</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {availableGroups.length > 0 && availableGroups[0].permissions.map(permission => {
                  const Icon = getPermissionIcon(permission)
                  return (
                    <div key={permission} className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id={permission}
                        checked={customPermissions.includes(permission)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setCustomPermissions([...customPermissions, permission])
                          } else {
                            setCustomPermissions(customPermissions.filter(p => p !== permission))
                          }
                        }}
                      />
                      <label
                        htmlFor={permission}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer flex items-center gap-2"
                      >
                        <Icon className="h-4 w-4 text-blue-600" />
                        {getPermissionDisplayName(permission)}
                      </label>
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Update Button */}
          <div className="flex justify-end">
            <Button 
              onClick={updatePermissions} 
              disabled={updating || (!useCustom && !selectedGroup) || (useCustom && customPermissions.length === 0)}
            >
              {updating ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
              ) : (
                <Check className="h-4 w-4 ml-2" />
              )}
              تحديث الصلاحيات
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}