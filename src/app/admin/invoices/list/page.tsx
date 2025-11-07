'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useToast } from '@/hooks/use-toast'
import {
  CreditCard,
  Download,
  Edit,
  Eye,
  Filter,
  Loader2,
  Plus,
  RefreshCcw,
  Search,
} from 'lucide-react'

interface InvoiceSummary {
  id: string
  invoiceNumber: string
  customerName: string
  customerEmail?: string
  status: string
  totalAmount: number
  paidAmount: number
  outstanding: number
  currency: string
  issueDate: string
  dueDate: string
  branchName?: string
}

interface PaginationState {
  page: number
  totalPages: number
  total: number
  limit: number
}

interface FiltersState {
  search: string
  status: string
  customerId: string
}

interface PaymentFormState {
  amount: string
  paymentMethod: string
  paymentDate: string
  referenceNumber: string
  notes: string
}

const statusOptions = [
  { value: 'ALL', label: 'جميع الحالات' },
  { value: 'DRAFT', label: 'مسودة' },
  { value: 'SENT', label: 'مرسلة' },
  { value: 'PAID', label: 'مدفوعة' },
  { value: 'PARTIALLY_PAID', label: 'مدفوعة جزئياً' },
  { value: 'OVERDUE', label: 'متأخرة' },
  { value: 'CANCELLED', label: 'ملغاة' },
  { value: 'REFUNDED', label: 'مستردة' }
] as const

const paymentMethodOptions = [
  { value: 'CASH', label: 'نقداً' },
  { value: 'CREDIT_CARD', label: 'بطاقة ائتمان' },
  { value: 'DEBIT_CARD', label: 'بطاقة خصم' },
  { value: 'BANK_TRANSFER', label: 'تحويل بنكي' },
  { value: 'MOBILE_WALLET', label: 'محفظة إلكترونية' },
  { value: 'CHECK', label: 'شيك' },
] as const

const statusMeta: Record<string, { label: string; variant: 'default' | 'secondary' | 'outline' | 'destructive' }> = {
  DRAFT: { label: 'مسودة', variant: 'secondary' },
  SENT: { label: 'مرسلة', variant: 'default' },
  PAID: { label: 'مدفوعة', variant: 'default' },
  PARTIALLY_PAID: { label: 'مدفوعة جزئياً', variant: 'outline' },
  OVERDUE: { label: 'متأخرة', variant: 'destructive' },
  CANCELLED: { label: 'ملغاة', variant: 'secondary' },
  REFUNDED: { label: 'مستردة', variant: 'outline' },
}

const PAGE_SIZE = 20

const parseAmount = (value: unknown): number => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]+/g, '')
    if (!normalized) {
      return 0
    }

    const parsed = Number.parseFloat(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }

  if (typeof value === 'bigint') {
    return Number(value)
  }

  return 0
}

const formatCurrency = (amount: number, currency = 'EGP') => {
  try {
    return new Intl.NumberFormat('ar-EG', {
      style: 'currency',
      currency,
      minimumFractionDigits: 2,
    }).format(amount)
  } catch (error) {
    return `${amount.toFixed(2)} ${currency}`
  }
}

const formatDate = (value: string) => {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) {
    return '-'
  }

  return date.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const calculateDueStatus = (invoice: InvoiceSummary) => {
  const dueDate = new Date(invoice.dueDate)
  if (Number.isNaN(dueDate.getTime())) {
    return { label: '-', className: 'text-gray-400' }
  }

  if (invoice.status === 'PAID') {
    return { label: 'مدفوعة بالكامل', className: 'text-green-600' }
  }

  const today = new Date()
  const normalizedToday = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  const normalizedDue = new Date(dueDate.getFullYear(), dueDate.getMonth(), dueDate.getDate())
  const diffMs = normalizedDue.getTime() - normalizedToday.getTime()
  const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

  if (diffDays < 0) {
    return { label: `متأخرة بـ ${Math.abs(diffDays)} يوم`, className: 'text-red-600' }
  }

  if (diffDays === 0) {
    return { label: 'مستحقة اليوم', className: 'text-orange-500' }
  }

  return { label: `متبقي ${diffDays} يوم`, className: 'text-blue-600' }
}

const createDefaultPaymentForm = (invoice?: InvoiceSummary | null): PaymentFormState => {
  const remaining = invoice ? Math.max(invoice.outstanding, 0) : 0
  return {
    amount: remaining > 0 ? remaining.toFixed(2) : '',
    paymentMethod: '',
    paymentDate: new Date().toISOString().split('T')[0],
    referenceNumber: '',
    notes: '',
  }
}

const initialFilters: FiltersState = {
  search: '',
  status: 'ALL',
  customerId: '',
}

export default function InvoicesListPage() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<InvoiceSummary[]>([])
  const [filters, setFilters] = useState<FiltersState>(initialFilters)
  const [appliedFilters, setAppliedFilters] = useState<FiltersState>(initialFilters)
  const [currentPage, setCurrentPage] = useState(1)
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    totalPages: 1,
    total: 0,
    limit: PAGE_SIZE,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceSummary | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>(() => createDefaultPaymentForm())
  const [processingPayment, setProcessingPayment] = useState(false)
  const [pageTotals, setPageTotals] = useState({
    totalAmount: 0,
    totalPaid: 0,
    outstanding: 0,
  })

  const fetchInvoices = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      params.set('limit', PAGE_SIZE.toString())

      if (appliedFilters.status && appliedFilters.status !== 'ALL') {
        params.set('status', appliedFilters.status)
      }

      if (appliedFilters.search.trim()) {
        params.set('search', appliedFilters.search.trim())
      }

      if (appliedFilters.customerId.trim()) {
        params.set('customerId', appliedFilters.customerId.trim())
      }

      const queryString = params.toString()
      const response = await fetch(`/api/finance/invoices${queryString ? `?${queryString}` : ''}`)
      const payload = await response.json().catch(() => null)

      if (!response.ok) {
        const message = payload?.error || 'فشل في تحميل الفواتير'
        throw new Error(message)
      }

      const invoicesData = payload || {}
      const normalizedInvoices: InvoiceSummary[] = (invoicesData.invoices || []).map((invoice: any) => {
        const totalAmount = parseAmount(invoice.totalAmount ?? invoice.subtotal ?? 0)
        const paidAmount = parseAmount(invoice.paidAmount ?? 0)
        const outstandingRaw = parseAmount(
          invoice.outstanding ?? Math.max(totalAmount - paidAmount, 0)
        )
        const outstanding = Math.max(outstandingRaw, 0)

        return {
          id: invoice.id,
          invoiceNumber: invoice.invoiceNumber ?? 'غير محدد',
          customerName: invoice.customer?.name ?? invoice.customerName ?? 'عميل غير معروف',
          customerEmail: invoice.customer?.email ?? invoice.customerEmail ?? '',
          status: invoice.status ?? 'DRAFT',
          totalAmount,
          paidAmount,
          outstanding,
          currency: invoice.currency ?? 'EGP',
          issueDate: invoice.issueDate ?? invoice.createdAt ?? new Date().toISOString(),
          dueDate: invoice.dueDate ?? invoice.issueDate ?? new Date().toISOString(),
          branchName: invoice.branch?.name ?? invoice.branchName ?? undefined,
        }
      })

      const paginationInfo = invoicesData.pagination || {}
      const resolvedPage = paginationInfo.page ?? currentPage
      const resolvedTotalPages = Math.max(paginationInfo.totalPages ?? 1, 1)
      const resolvedLimit = paginationInfo.limit ?? PAGE_SIZE

      setInvoices(normalizedInvoices)
      setPagination({
        page: resolvedPage,
        totalPages: resolvedTotalPages,
        total: paginationInfo.total ?? normalizedInvoices.length,
        limit: resolvedLimit,
      })

      const computedPageTotals = normalizedInvoices.reduce(
        (acc, invoice) => {
          acc.totalAmount += invoice.totalAmount
          acc.totalPaid += invoice.paidAmount
          acc.outstanding += invoice.outstanding
          return acc
        },
        { totalAmount: 0, totalPaid: 0, outstanding: 0 }
      )

      const summaryTotals = invoicesData.summary?.page
        ? {
            totalAmount: parseAmount(invoicesData.summary.page.totalAmount),
            totalPaid: parseAmount(invoicesData.summary.page.totalPaid),
            outstanding: parseAmount(invoicesData.summary.page.outstanding),
          }
        : computedPageTotals

      setPageTotals(summaryTotals)

      if (resolvedPage !== currentPage) {
        setCurrentPage(resolvedPage)
      }
    } catch (fetchError) {
      const message = fetchError instanceof Error ? fetchError.message : 'فشل في تحميل الفواتير'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [appliedFilters, currentPage])

  useEffect(() => {
    fetchInvoices()
  }, [fetchInvoices])

  const remainingBalance = useMemo(() => {
    if (!selectedInvoice) {
      return 0
    }

    return Math.max(selectedInvoice.outstanding, 0)
  }, [selectedInvoice])

  const handleApplyFilters = () => {
    setCurrentPage(1)
    setAppliedFilters(filters)
  }

  const handleResetFilters = () => {
    setFilters(initialFilters)
    setCurrentPage(1)
    setAppliedFilters(initialFilters)
  }

  const handlePageChange = (page: number) => {
    if (page === currentPage) {
      return
    }

    setCurrentPage(page)
  }

  const handleRefresh = () => {
    fetchInvoices()
  }

  const openPaymentModal = (invoice: InvoiceSummary) => {
    setSelectedInvoice(invoice)
    setPaymentForm(createDefaultPaymentForm(invoice))
    setShowPaymentModal(true)
  }

  const closePaymentModal = () => {
    setShowPaymentModal(false)
    setSelectedInvoice(null)
    setPaymentForm(createDefaultPaymentForm())
  }

  const handlePaymentSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (!selectedInvoice) {
      return
    }

    if (!paymentForm.amount || !paymentForm.paymentMethod) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال مبلغ وطريقة دفع صالحة',
        variant: 'destructive',
      })
      return
    }

    const amountValue = parseFloat(paymentForm.amount)
    if (Number.isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال مبلغ صحيح',
        variant: 'destructive',
      })
      return
    }

    if (amountValue > remainingBalance + 0.01) {
      toast({
        title: 'خطأ',
        description: 'المبلغ يتجاوز المبلغ المتبقي على الفاتورة',
        variant: 'destructive',
      })
      return
    }

    setProcessingPayment(true)

    try {
      const response = await fetch('/api/finance/payments/offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          invoiceId: selectedInvoice.id,
          amount: paymentForm.amount,
          paymentMethod: paymentForm.paymentMethod,
          paymentDate: paymentForm.paymentDate,
          referenceNumber: paymentForm.referenceNumber,
          notes: paymentForm.notes,
        }),
      })

      const result = await response.json().catch(() => null)
      if (!response.ok) {
        const message = result?.error || 'فشل في تسجيل الدفعة'
        throw new Error(message)
      }

      toast({
        title: 'تم التسجيل',
        description: 'تم تسجيل الدفعة بنجاح',
      })

      closePaymentModal()
      await fetchInvoices()
    } catch (paymentError) {
      const message = paymentError instanceof Error ? paymentError.message : 'فشل في تسجيل الدفعة'
      toast({
        title: 'خطأ',
        description: message,
        variant: 'destructive',
      })
    } finally {
      setProcessingPayment(false)
    }
  }

  const startItem = pagination.total === 0 ? 0 : (pagination.page - 1) * pagination.limit + 1
  const endItem = pagination.total === 0 ? 0 : Math.min(pagination.page * pagination.limit, pagination.total)
  const canGoPrev = pagination.page > 1
  const canGoNext = pagination.page < pagination.totalPages

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">جميع الفواتير</h1>
          <p className="mt-2 text-gray-600">إدارة شاملة لجميع الفواتير والمدفوعات</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleRefresh} disabled={loading}>
            {loading ? <Loader2 className="ml-2 h-4 w-4 animate-spin" /> : <RefreshCcw className="ml-2 h-4 w-4" />}
            تحديث البيانات
          </Button>
          <Button asChild>
            <Link href="/admin/finance/invoices/create">
              <Plus className="ml-2 h-4 w-4" />
              فاتورة جديدة
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">إجمالي قيمة الفواتير (الصفحة الحالية)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{formatCurrency(pageTotals.totalAmount)}</div>
            <p className="mt-1 text-sm text-gray-500">يشمل الفواتير المعروضة في الجدول الحالي</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">المدفوعات المستلمة (الصفحة الحالية)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{formatCurrency(pageTotals.totalPaid)}</div>
            <p className="mt-1 text-sm text-gray-500">المبلغ الذي تم تحصيله من هذه القائمة</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-gray-500">الرصيد المستحق (الصفحة الحالية)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{formatCurrency(pageTotals.outstanding)}</div>
            <p className="mt-1 text-sm text-gray-500">المبلغ المتبقي على الفواتير الظاهرة</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>تصفية الفواتير</CardTitle>
          <CardDescription>استخدم خيارات البحث لتحديد الفواتير المطلوبة</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div className="space-y-2">
              <Label htmlFor="invoiceSearch" className="text-right">بحث</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  id="invoiceSearch"
                  placeholder="ابحث برقم الفاتورة أو اسم العميل"
                  className="pl-10"
                  value={filters.search}
                  onChange={(event) => setFilters((prev) => ({ ...prev, search: event.target.value }))}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter') {
                      event.preventDefault()
                      handleApplyFilters()
                    }
                  }}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="invoiceStatus" className="text-right">الحالة</Label>
              <Select
                value={filters.status}
                onValueChange={(value) => setFilters((prev) => ({ ...prev, status: value }))}
              >
                <SelectTrigger id="invoiceStatus">
                  <SelectValue placeholder="اختر الحالة" />
                </SelectTrigger>
                <SelectContent>
                  {statusOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customerId" className="text-right">معرّف العميل</Label>
              <Input
                id="customerId"
                placeholder="بحث بمعرف العميل"
                value={filters.customerId}
                onChange={(event) => setFilters((prev) => ({ ...prev, customerId: event.target.value }))}
              />
            </div>

            <div className="flex items-end gap-2">
              <Button className="w-full" onClick={handleApplyFilters} disabled={loading}>
                <Filter className="ml-2 h-4 w-4" />
                تطبيق التصفية
              </Button>
              <Button variant="outline" className="w-full" onClick={handleResetFilters} disabled={loading}>
                إعادة تعيين
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card>
        <CardHeader>
          <CardTitle>قائمة الفواتير</CardTitle>
          <CardDescription>
            عرض {startItem} - {endItem} من إجمالي {pagination.total} فاتورة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {loading ? (
            <div className="space-y-2">
              {Array.from({ length: 6 }).map((_, index) => (
                <div key={index} className="h-12 w-full animate-pulse rounded-md bg-gray-100" />
              ))}
            </div>
          ) : invoices.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-lg font-medium text-gray-900">لا توجد فواتير مطابقة</p>
              <p className="mt-2 text-gray-500">جرّب تعديل معايير البحث أو إنشاء فاتورة جديدة</p>
              <div className="mt-4">
                <Button asChild>
                  <Link href="/admin/finance/invoices/create">
                    <Plus className="ml-2 h-4 w-4" />
                    إنشاء فاتورة
                  </Link>
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-right">رقم الفاتورة</TableHead>
                    <TableHead className="text-right">العميل</TableHead>
                    <TableHead className="text-right">التواريخ</TableHead>
                    <TableHead className="text-right">المبالغ</TableHead>
                    <TableHead className="text-right">الحالة</TableHead>
                    <TableHead className="text-right">الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoices.map((invoice) => {
                    const status = statusMeta[invoice.status] || { label: invoice.status, variant: 'secondary' as const }
                    const dueStatus = calculateDueStatus(invoice)
                    const remaining = Math.max(invoice.outstanding, 0)

                    return (
                      <TableRow key={invoice.id}>
                        <TableCell className="text-right">
                          <div className="font-medium text-gray-900">{invoice.invoiceNumber}</div>
                          {invoice.branchName && (
                            <div className="text-xs text-gray-500">{invoice.branchName}</div>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-gray-900">{invoice.customerName}</div>
                          <div className="text-xs text-gray-500">{invoice.customerEmail || '—'}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-gray-900">{formatDate(invoice.issueDate)}</div>
                          <div className={`text-xs ${dueStatus.className}`}>{dueStatus.label}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="font-medium text-gray-900">{formatCurrency(invoice.totalAmount, invoice.currency)}</div>
                          <div className="text-xs text-gray-500">المتبقي: {formatCurrency(remaining, invoice.currency)}</div>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="icon" asChild aria-label="عرض الفاتورة">
                              <Link href={`/admin/finance/invoices/${invoice.id}`}>
                                <Eye className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" asChild aria-label="تعديل الفاتورة">
                              <Link href={`/admin/finance/invoices/${invoice.id}/edit`}>
                                <Edit className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              aria-label="تسجيل دفعة"
                              onClick={() => openPaymentModal(invoice)}
                            >
                              <CreditCard className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              asChild
                              aria-label="تحميل الفاتورة"
                            >
                              <Link href={`/api/finance/invoices/${invoice.id}/download`} target="_blank" rel="noopener noreferrer">
                                <Download className="h-4 w-4" />
                              </Link>
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    )
                  })}
                </TableBody>
              </Table>

              <div className="flex flex-col items-center gap-4 border-t pt-4 sm:flex-row sm:justify-between">
                <p className="text-sm text-gray-500">
                  صفحة {pagination.page} من {pagination.totalPages}
                </p>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page - 1)}
                    disabled={!canGoPrev || loading}
                  >
                    السابق
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(pagination.page + 1)}
                    disabled={!canGoNext || loading}
                  >
                    التالي
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={showPaymentModal} onOpenChange={(open) => {
        if (!open) {
          closePaymentModal()
        }
      }}>
        <DialogContent className="sm:max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle>تسجيل دفعة</DialogTitle>
            <DialogDescription>
              {selectedInvoice ? `الفاتورة ${selectedInvoice.invoiceNumber} - المتبقي ${formatCurrency(remainingBalance, selectedInvoice.currency)}` : 'تسجيل دفعة جديدة'}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="paymentAmount" className="text-right">المبلغ</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  min="0"
                  step="0.01"
                  value={paymentForm.amount}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, amount: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentMethod" className="text-right">طريقة الدفع</Label>
                <Select
                  value={paymentForm.paymentMethod}
                  onValueChange={(value) => setPaymentForm((prev) => ({ ...prev, paymentMethod: value }))}
                  required
                >
                  <SelectTrigger id="paymentMethod">
                    <SelectValue placeholder="اختر طريقة الدفع" />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentMethodOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentDate" className="text-right">تاريخ الدفع</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={paymentForm.paymentDate}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, paymentDate: event.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="referenceNumber" className="text-right">رقم المرجع</Label>
                <Input
                  id="referenceNumber"
                  placeholder="اختياري"
                  value={paymentForm.referenceNumber}
                  onChange={(event) => setPaymentForm((prev) => ({ ...prev, referenceNumber: event.target.value }))}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="paymentNotes" className="text-right">ملاحظات</Label>
              <Textarea
                id="paymentNotes"
                placeholder="تفاصيل إضافية حول الدفعة (اختياري)"
                value={paymentForm.notes}
                onChange={(event) => setPaymentForm((prev) => ({ ...prev, notes: event.target.value }))}
              />
            </div>
            <DialogFooter className="gap-2 sm:gap-2">
              <Button type="button" variant="outline" onClick={closePaymentModal} disabled={processingPayment}>
                إلغاء
              </Button>
              <Button type="submit" disabled={processingPayment}>
                {processingPayment ? (
                  <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                ) : (
                  <CreditCard className="ml-2 h-4 w-4" />
                )}
                تسجيل الدفعة
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
