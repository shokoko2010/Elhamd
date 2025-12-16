'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Plus,
  Eye,
  Download,
  Printer
} from 'lucide-react'
import Link from 'next/link'

interface Quotation {
  id: string
  quotationNumber: string
  customer: {
    name: string
    email: string
    phone?: string
  }
  vehicle: {
    make: string
    model: string
    year: number
  }
  items: Array<{
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }>
  totalAmount: number
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED'
  issueDate: Date
  validUntil: Date
  createdAt: Date
  createdBy: {
    name: string
    email: string
  }
}

interface QuotationStats {
  total: number
  draft: number
  sent: number
  accepted: number
  converted: number
  expired: number
  totalValue: number
  monthlyGrowth: {
    total: number
    value: number
  }
}

export default function QuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [stats, setStats] = useState<QuotationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    loadQuotations()
  }, [])

  const loadQuotations = async () => {
    setLoading(true)
    setError(null)

    try {
      // Load quotations stats
      const statsResponse = await fetch('/api/finance/quotations?stats=true')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Load recent quotations
      const quotationsResponse = await fetch('/api/finance/quotations?limit=10&sortBy=createdAt&order=desc')
      if (quotationsResponse.ok) {
        const quotationsData = await quotationsResponse.json()
        setQuotations(quotationsData.quotations || [])
      }
    } catch (error) {
      console.error('Error loading quotations:', error)
      setError('فشل في تحميل عروض الأسعار')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency: 'EGP',
      minimumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'DRAFT': { variant: 'secondary' as const, label: 'مسودة' },
      'SENT': { variant: 'default' as const, label: 'أرسلت' },
      'ACCEPTED': { variant: 'default' as const, label: 'مقبولة' },
      'REJECTED': { variant: 'destructive' as const, label: 'مرفوضة' },
      'EXPIRED': { variant: 'outline' as const, label: 'منتهية الصلاحية' },
      'CONVERTED': { variant: 'default' as const, label: 'محولة لفاتورة' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    return (
      <Badge variant={config.variant}>
        {config.label}
      </Badge>
    )
  }

  const getExpiringSoon = () => {
    const threeDaysFromNow = new Date()
    threeDaysFromNow.setDate(threeDaysFromNow.getDate() + 3)

    return quotations
      .filter(q =>
        q.status === 'SENT' &&
        new Date(q.validUntil) <= threeDaysFromNow &&
        new Date(q.validUntil) > new Date()
      )
      .slice(0, 5)
  }

  const getDaysUntilExpiry = (validUntil: Date | string) => {
    const days = Math.ceil((new Date(validUntil).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
    if (days === 0) return 'ينتهي اليوم'
    if (days === 1) return 'ينتهي غداً'
    return `ينتهي خلال ${days} أيام`
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة عروض الأسعار</h1>
          <Button variant="outline" disabled>
            <RefreshCw className="ml-2 h-4 w-4 animate-spin" />
            جاري التحميل...
          </Button>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 w-20 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 w-16 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 w-24 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة عروض الأسعار</h1>
          <Button variant="outline" onClick={loadQuotations}>
            <RefreshCw className="ml-2 h-4 w-4" />
            إعادة المحاولة
          </Button>
        </div>

        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  const expiringSoon = getExpiringSoon()

  return (
    <AdminRoute>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">إدارة عروض الأسعار</h1>
          <div className="flex gap-2">
            <Link href="/admin/finance/quotations/create">
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                عرض سعر جديد
              </Button>
            </Link>
            <Button variant="outline" onClick={loadQuotations}>
              <RefreshCw className="ml-2 h-4 w-4" />
              تحديث
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي العروض</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.total || 0}</div>
              <p className="text-xs text-muted-foreground">
                {stats?.monthlyGrowth?.total && stats.monthlyGrowth.total > 0 ? '+' : ''}{stats?.monthlyGrowth?.total || 0}% من الشهر الماضي
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">في الانتظار</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.sent || 0}</div>
              <p className="text-xs text-muted-foreground">
                تنتظر موافقة العميل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معتمدة</CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.accepted || 0}</div>
              <p className="text-xs text-muted-foreground">
                تمت الموافقة عليها
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">محولة</CardTitle>
              <AlertCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats?.converted || 0}</div>
              <p className="text-xs text-muted-foreground">
                تحولت لفواتير
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Quotations */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>أحدث عروض الأسعار</CardTitle>
                  <CardDescription>
                    العروض التي تم إنشاؤها مؤخراً
                  </CardDescription>
                </div>
                <Link href="/admin/finance/quotations">
                  <Button variant="outline" size="sm">
                    <Eye className="ml-2 h-4 w-4" />
                    عرض الكل
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              {quotations.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد عروض أسعار</p>
              ) : (
                <div className="space-y-4">
                  {quotations.slice(0, 5).map((quotation) => (
                    <div key={quotation.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{quotation.customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {quotation.vehicle?.make} {quotation.vehicle?.model} {quotation.vehicle?.year}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{formatCurrency(quotation.totalAmount)}</p>
                        <div className="flex items-center gap-2 justify-end">
                          <p className="text-xs text-muted-foreground">{formatDate(quotation.issueDate)}</p>
                          {getStatusBadge(quotation.status)}
                          <Link href={`/admin/quotations/${quotation.id}/print`} target="_blank">
                            <Button variant="ghost" size="icon" title="طباعة / تصدير PDF">
                              <Printer className="h-4 w-4" />
                            </Button>
                          </Link>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Expiring Soon */}
          <Card>
            <CardHeader>
              <CardTitle>عروض قريبة الانتهاء</CardTitle>
              <CardDescription>
                العروض التي ستنتهي صلاحيتها خلال 3 أيام
              </CardDescription>
            </CardHeader>
            <CardContent>
              {expiringSoon.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">لا توجد عروض قريبة الانتهاء</p>
              ) : (
                <div className="space-y-4">
                  {expiringSoon.map((quotation) => (
                    <div key={quotation.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{quotation.customer.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {quotation.vehicle?.make} {quotation.vehicle?.model}
                        </p>
                      </div>
                      <div className="text-left">
                        <p className="font-medium">{formatCurrency(quotation.totalAmount)}</p>
                        <p className="text-xs text-red-600">{getDaysUntilExpiry(quotation.validUntil)}</p>
                        <Link href={`/admin/quotations/${quotation.id}/print`} target="_blank">
                          <Button variant="ghost" size="icon" className="h-6 w-6" title="طباعة / تصدير PDF">
                            <Printer className="h-3 w-3" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </AdminRoute>
  )
}