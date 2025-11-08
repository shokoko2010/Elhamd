'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  ArrowLeft, 
  Download, 
  Mail, 
  Edit, 
  Trash2, 
  Printer,
  FileText,
  DollarSign,
  Calendar,
  User,
  Package,
  CheckCircle,
  Clock,
  AlertCircle,
  CreditCard,
  Plus,
  Eye,
  X
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface Invoice {
  id: string
  invoiceNumber: string
  customerId: string
  customer: {
    id: string
    name: string
    email: string
    phone?: string
    company?: string
    address?: string
  }
  type: string
  status: 'DRAFT' | 'SENT' | 'PAID' | 'PARTIALLY_PAID' | 'OVERDUE' | 'CANCELLED' | 'REFUNDED'
  issueDate: string
  dueDate: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  currency: string
  items: InvoiceItem[]
  taxes: InvoiceTax[]
  payments: InvoicePayment[]
  notes?: string
  terms?: string
  createdAt: string
  updatedAt: string
  createdBy: string
  isDeleted?: boolean
  deletedAt?: string | null
  deletedBy?: string | null
  deletedReason?: string | null
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxRate: number
  taxAmount: number
  metadata?: Record<string, any>
}

interface InvoiceTax {
  id: string
  taxType: string
  rate: number
  taxAmount: number
  description: string
}

interface InvoicePayment {
  id: string
  payment: {
    id: string
    amount: number
    createdAt: string
    paymentMethod: string
    status: string
    transactionId?: string
    notes?: string
  }
}

export default function InvoiceDetailsPage() {
  return (
    <AdminRoute>
      <InvoiceDetailsContent />
    </AdminRoute>
  )
}

function InvoiceDetailsContent() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  const [loading, setLoading] = useState(true)
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [processingPayment, setProcessingPayment] = useState(false)
  const { toast } = useToast()
  
  // Payment form state
  const [paymentForm, setPaymentForm] = useState({
    amount: '',
    paymentMethod: '',
    notes: '',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    if (invoiceId) {
      fetchInvoice()
    }
  }, [invoiceId])

  const fetchInvoice = async () => {
    try {
      const response = await fetch(`/api/finance/invoices/${invoiceId}`)
      if (response.ok) {
        const invoiceData = await response.json()
        setInvoice(invoiceData)
      } else {
        throw new Error('Invoice not found')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الفاتورة',
        variant: 'destructive'
      })
      router.push('/admin/finance')
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

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'مسودة', variant: 'secondary' as const, icon: FileText },
      SENT: { label: 'مرسلة', variant: 'default' as const, icon: Mail },
      PAID: { label: 'مدفوعة', variant: 'default' as const, icon: CheckCircle },
      PARTIALLY_PAID: { label: 'مدفوعة جزئياً', variant: 'outline' as const, icon: Clock },
      OVERDUE: { label: 'متأخرة', variant: 'destructive' as const, icon: AlertCircle },
      CANCELLED: { label: 'ملغاة', variant: 'secondary' as const, icon: X },
      REFUNDED: { label: 'مستردة', variant: 'outline' as const, icon: CreditCard }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const downloadInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `invoice-${invoice?.invoiceNumber}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل الفاتورة',
        variant: 'destructive'
      })
    }
  }

  const printInvoice = () => {
    // Create a new window for printing
    const printWindow = window.open('', '_blank')
    if (!printWindow) {
      // Fallback to window.print if popup is blocked
      window.print()
      return
    }

    // Create the print content
    const printContent = `
      <!DOCTYPE html>
      <html dir="rtl" lang="ar">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>فاتورة ${invoice?.invoiceNumber}</title>
        <style>
          @media print {
            body { 
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              margin: 0;
              padding: 20px;
              direction: rtl;
            }
            .no-print { display: none !important; }
            .print-break { page-break-inside: avoid; }
            .print-header { 
              border-bottom: 2px solid #333; 
              padding-bottom: 20px; 
              margin-bottom: 30px;
            }
            .print-footer { 
              border-top: 1px solid #ccc; 
              padding-top: 20px; 
              margin-top: 30px;
              font-size: 12px;
              color: #666;
            }
            .invoice-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0;
            }
            .invoice-table th, 
            .invoice-table td { 
              border: 1px solid #ddd; 
              padding: 12px; 
              text-align: right;
            }
            .invoice-table th { 
              background-color: #f5f5f5; 
              font-weight: bold;
            }
            .total-row { 
              font-weight: bold; 
              background-color: #f9f9f9;
            }
            .company-info {
              margin-bottom: 30px;
            }
            .customer-info {
              margin-bottom: 30px;
            }
            .invoice-details {
              margin-bottom: 30px;
            }
            .amount-summary {
              float: left;
              text-align: left;
              direction: ltr;
            }
            .notes-terms {
              margin-top: 30px;
              font-size: 14px;
              color: #666;
            }
          }
        </style>
      </head>
      <body>
        <div class="print-header">
          <div class="company-info">
            <h1>TATA Motors Egypt</h1>
            <p>وكيل معتمد لسيارات تاتا</p>
            <p>القاهرة، مصر</p>
            <p>هاتف: +20 2 12345678</p>
            <p>البريد الإلكتروني: info@tata-egypt.com</p>
          </div>
        </div>

        <div class="invoice-details">
          <h2>فاتورة رقم: ${invoice?.invoiceNumber}</h2>
          <p><strong>التاريخ:</strong> ${formatDate(invoice?.issueDate || '')}</p>
          <p><strong>تاريخ الاستحقاق:</strong> ${formatDate(invoice?.dueDate || '')}</p>
          <p><strong>الحالة:</strong> ${getStatusBadge(invoice?.status || '').props.children}</p>
          <p><strong>العملة:</strong> ${invoice?.currency}</p>
        </div>

        <div class="customer-info">
          <h3>معلومات العميل</h3>
          <p><strong>الاسم:</strong> ${invoice?.customer.name}</p>
          <p><strong>البريد الإلكتروني:</strong> ${invoice?.customer.email}</p>
          ${invoice?.customer.phone ? `<p><strong>الهاتف:</strong> ${invoice.customer.phone}</p>` : ''}
          ${invoice?.customer.company ? `<p><strong>الشركة:</strong> ${invoice.customer.company}</p>` : ''}
          ${invoice?.customer.address ? `<p><strong>العنوان:</strong> ${invoice.customer.address}</p>` : ''}
        </div>

        <table class="invoice-table">
          <thead>
            <tr>
              <th>الوصف</th>
              <th>الكمية</th>
              <th>السعر الواحد</th>
              <th>الإجمالي</th>
            </tr>
          </thead>
          <tbody>
            ${invoice?.items.map(item => `
              <tr class="print-break">
                <td>${item.description}</td>
                <td>${item.quantity}</td>
                <td>${formatCurrency(item.unitPrice)}</td>
                <td>${formatCurrency(item.totalPrice)}</td>
              </tr>
            `).join('')}
            <tr class="total-row">
              <td colspan="3">الإجمالي الفرعي:</td>
              <td>${formatCurrency(invoice?.subtotal || 0)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3">ضريبة القيمة المضافة:</td>
              <td>${formatCurrency(invoice?.taxAmount || 0)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3"><strong>الإجمالي:</strong></td>
              <td><strong>${formatCurrency(invoice?.totalAmount || 0)}</strong></td>
            </tr>
            <tr class="total-row">
              <td colspan="3">المدفوع:</td>
              <td>${formatCurrency(invoice?.paidAmount || 0)}</td>
            </tr>
            <tr class="total-row">
              <td colspan="3">المتبقي:</td>
              <td>${formatCurrency((invoice?.totalAmount || 0) - (invoice?.paidAmount || 0))}</td>
            </tr>
          </tbody>
        </table>

        ${invoice?.notes || invoice?.terms ? `
          <div class="notes-terms">
            ${invoice?.notes ? `<h3>ملاحظات</h3><p>${invoice.notes}</p>` : ''}
            ${invoice?.terms ? `<h3>الشروط والأحكام</h3><p>${invoice.terms}</p>` : ''}
          </div>
        ` : ''}

        <div class="print-footer">
          <p>شكراً لتعاملكم مع TATA Motors Egypt</p>
          <p>هذه الفاتورة تم إنشاؤها بواسطة النظام في ${formatDate(invoice?.createdAt || '')}</p>
        </div>
      </body>
      </html>
    `

    printWindow.document.write(printContent)
    printWindow.document.close()
    printWindow.focus()
    
    // Wait for the content to load before printing
    setTimeout(() => {
      printWindow.print()
      printWindow.close()
    }, 500)
  }

  const sendInvoice = async () => {
    try {
      const response = await fetch(`/api/invoices/${invoiceId}/send`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم إرسال الفاتورة بنجاح'
        })
        fetchInvoice()
      } else {
        throw new Error('Failed to send invoice')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الفاتورة',
        variant: 'destructive'
      })
    }
  }

  const deleteInvoice = async () => {
    if (!invoice) {
      return
    }

    const confirmed = window.confirm('سيتم نقل الفاتورة إلى قسم المحذوفات مع الاحتفاظ ببياناتها. هل تريد المتابعة؟')
    if (!confirmed) {
      return
    }

    const optionalReason = window.prompt('يمكنك إدخال سبب للحذف (اختياري):', '') ?? ''
    const reason = optionalReason.trim()

    try {
      const response = await fetch(`/api/finance/invoices/${invoiceId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ reason: reason || undefined })
      })

      const payload = await response.json().catch(() => null)

      if (response.ok) {
        const archived = payload?.invoice
        toast({
          title: 'تم النقل إلى الأرشيف',
          description: 'أصبحت الفاتورة ضمن قسم المحذوفات ويمكن الرجوع إليها لاحقاً.',
        })

        if (archived) {
          setInvoice((previous) => {
            if (!previous) {
              return previous
            }

            return {
              ...previous,
              isDeleted: true,
              deletedAt: archived.deletedAt ?? new Date().toISOString(),
              deletedBy: archived.deletedBy ?? previous.deletedBy,
              deletedReason: archived.deletedReason ?? reason || previous.deletedReason,
            }
          })
        } else {
          fetchInvoice()
        }

        return
      }

      if (payload?.code === 'INVOICE_ALREADY_ARCHIVED') {
        toast({
          title: 'تنبيه',
          description: 'الفاتورة موجودة بالفعل في الأرشيف.',
        })
        fetchInvoice()
        return
      }

      const message = payload?.error || 'تعذر نقل الفاتورة إلى الأرشيف'
      throw new Error(message)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'فشل في نقل الفاتورة إلى الأرشيف'
      toast({
        title: 'خطأ',
        description: message,
        variant: 'destructive'
      })
    }
  }

  const handlePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!invoice) return
    
    // Validate form
    if (!paymentForm.amount || !paymentForm.paymentMethod) {
      toast({
        title: 'خطأ',
        description: 'يرجى ملء جميع الحقول المطلوبة',
        variant: 'destructive'
      })
      return
    }
    
    const amount = parseFloat(paymentForm.amount)
    if (isNaN(amount) || amount <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال مبلغ صحيح',
        variant: 'destructive'
      })
      return
    }
    
    // Get current remaining amount from server to ensure accuracy
    try {
      const response = await fetch(`/api/finance/invoices/${invoiceId}`)
      if (response.ok) {
        const currentInvoice = await response.json()
        const remainingAmount = currentInvoice.totalAmount - currentInvoice.paidAmount
        
        if (amount > remainingAmount) {
          toast({
            title: 'خطأ',
            description: `المبلغ يتجاوز المبلغ المتبقي (${formatCurrency(remainingAmount)})`,
            variant: 'destructive'
          })
          return
        }
      }
    } catch (error) {
      console.error('Error fetching current invoice:', error)
    }
    
    setProcessingPayment(true)
    
    try {
      const response = await fetch('/api/finance/payments/offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceId,
          amount: paymentForm.amount,
          paymentMethod: paymentForm.paymentMethod,
          notes: paymentForm.notes,
          referenceNumber: paymentForm.referenceNumber,
          paymentDate: paymentForm.paymentDate
        })
      })
      
      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'نجاح',
          description: 'تم تسجيل الدفعة بنجاح'
        })
        
        // Reset form and close modal
        setPaymentForm({
          amount: '',
          paymentMethod: '',
          notes: '',
          referenceNumber: '',
          paymentDate: new Date().toISOString().split('T')[0]
        })
        setShowPaymentModal(false)
        
        // Refresh invoice data
        fetchInvoice()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to process payment')
      }
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في تسجيل الدفعة',
        variant: 'destructive'
      })
    } finally {
      setProcessingPayment(false)
    }
  }
  
  const openPaymentModal = async () => {
    if (invoiceId) {
      try {
        // Fetch current invoice data to get accurate remaining amount
        const response = await fetch(`/api/finance/invoices/${invoiceId}`)
        if (response.ok) {
          const currentInvoice = await response.json()
          const remainingAmount = currentInvoice.totalAmount - currentInvoice.paidAmount
          setPaymentForm({
            ...paymentForm,
            amount: remainingAmount > 0 ? remainingAmount.toString() : ''
          })
        }
      } catch (error) {
        console.error('Error fetching invoice for payment:', error)
        // Fallback to local invoice data
        if (invoice) {
          const remainingAmount = invoice.totalAmount - invoice.paidAmount
          setPaymentForm({
            ...paymentForm,
            amount: remainingAmount > 0 ? remainingAmount.toString() : ''
          })
        }
      }
    }
    setShowPaymentModal(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!invoice) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
          <h2 className="text-xl font-semibold mb-2">الفاتورة غير موجودة</h2>
          <Link href="/admin/finance">
            <Button>العودة للفواتير</Button>
          </Link>
        </div>
      </div>
    )
  }

  const remainingAmount = invoice.totalAmount - invoice.paidAmount
  const isOverdue = new Date(invoice.dueDate) < new Date() && invoice.status !== 'PAID'

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/admin/finance">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">تفاصيل الفاتورة</h1>
            <p className="text-gray-600 mt-2">فاتورة رقم {invoice.invoiceNumber}</p>
            {invoice.isDeleted && (
              <div className="mt-2 flex flex-col gap-1">
                <Badge variant="destructive" className="w-max">فاتورة محذوفة (مؤرشفة)</Badge>
                {invoice.deletedAt && (
                  <span className="text-xs text-gray-500">
                    تم الأرشفة في {new Date(invoice.deletedAt).toLocaleString('ar-EG')}
                  </span>
                )}
                {invoice.deletedReason && (
                  <span className="text-xs text-gray-500">
                    السبب: {invoice.deletedReason}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={downloadInvoice}>
            <Download className="ml-2 h-4 w-4" />
            تحميل PDF
          </Button>
          <Button variant="outline" onClick={printInvoice}>
            <Printer className="ml-2 h-4 w-4" />
            طباعة
          </Button>
          {invoice.status === 'DRAFT' && !invoice.isDeleted && (
            <Button onClick={sendInvoice}>
              <Mail className="ml-2 h-4 w-4" />
              إرسال
            </Button>
          )}
          {!invoice.isDeleted && (
            <Link href={`/admin/finance/invoices/${invoice.id}/edit`}>
              <Button variant="outline">
                <Edit className="ml-2 h-4 w-4" />
                تعديل
              </Button>
            </Link>
          )}
          {!invoice.isDeleted && (
            <Button variant="destructive" onClick={deleteInvoice}>
              <Trash2 className="ml-2 h-4 w-4" />
              حذف
            </Button>
          )}
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحالة</CardTitle>
            {getStatusBadge(invoice.status)}
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {getStatusBadge(invoice.status)}
            </div>
            {isOverdue && (
              <p className="text-xs text-red-600 mt-1">متأخرة</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجمالي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(invoice.totalAmount)}
            </div>
            <p className="text-xs text-muted-foreground">إجمالي الفاتورة</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المدفوع</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(invoice.paidAmount)}
            </div>
            <p className="text-xs text-muted-foreground">المبلغ المدفوع</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المتبقي</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
              {formatCurrency(remainingAmount)}
            </div>
            <p className="text-xs text-muted-foreground">المبلغ المتبقي</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2">
          <Tabs defaultValue="details" className="space-y-6">
            <TabsList>
              <TabsTrigger value="details">التفاصيل</TabsTrigger>
              <TabsTrigger value="items">البنود</TabsTrigger>
              <TabsTrigger value="payments">المدفوعات</TabsTrigger>
              <TabsTrigger value="history">السجل</TabsTrigger>
            </TabsList>

            {/* Details Tab */}
            <TabsContent value="details">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات الفاتورة</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <User className="h-4 w-4" />
                      معلومات العميل
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">الاسم</p>
                          <p className="font-medium">{invoice.customer.name}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">البريد الإلكتروني</p>
                          <p className="font-medium">{invoice.customer.email}</p>
                        </div>
                        {invoice.customer.phone && (
                          <div>
                            <p className="text-sm text-gray-600">الهاتف</p>
                            <p className="font-medium">{invoice.customer.phone}</p>
                          </div>
                        )}
                        {invoice.customer.company && (
                          <div>
                            <p className="text-sm text-gray-600">الشركة</p>
                            <p className="font-medium">{invoice.customer.company}</p>
                          </div>
                        )}
                        {invoice.customer.address && (
                          <div className="md:col-span-2">
                            <p className="text-sm text-gray-600">العنوان</p>
                            <p className="font-medium">{invoice.customer.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Invoice Information */}
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      معلومات الفاتورة
                    </h3>
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">رقم الفاتورة</p>
                          <p className="font-medium">{invoice.invoiceNumber}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">النوع</p>
                          <p className="font-medium">{invoice.type}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">تاريخ الإصدار</p>
                          <p className="font-medium">{formatDate(invoice.issueDate)}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">تاريخ الاستحقاق</p>
                          <p className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                            {formatDate(invoice.dueDate)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">العملة</p>
                          <p className="font-medium">{invoice.currency}</p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">أنشئ بواسطة</p>
                          <p className="font-medium">{invoice.createdBy}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Notes and Terms */}
                  {(invoice.notes || invoice.terms) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {invoice.notes && (
                        <div>
                          <h3 className="font-semibold mb-3">ملاحظات</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{invoice.notes}</p>
                          </div>
                        </div>
                      )}
                      {invoice.terms && (
                        <div>
                          <h3 className="font-semibold mb-3">الشروط والأحكام</h3>
                          <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm whitespace-pre-wrap">{invoice.terms}</p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Items Tab */}
            <TabsContent value="items">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Package className="h-5 w-5" />
                    بنود الفاتورة
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-right py-3 px-4">الوصف</th>
                          <th className="text-right py-3 px-4">الكمية</th>
                          <th className="text-right py-3 px-4">السعر</th>
                          <th className="text-right py-3 px-4">الضريبة</th>
                          <th className="text-right py-3 px-4">الإجمالي</th>
                        </tr>
                      </thead>
                      <tbody>
                        {invoice.items.map((item) => (
                          <tr key={item.id} className="border-b">
                            <td className="text-right py-3 px-4">
                              <div>
                                <p className="font-medium">{item.description}</p>
                                {item.metadata && Object.keys(item.metadata).length > 0 && (
                                  <p className="text-xs text-gray-500">
                                    {Object.entries(item.metadata).map(([key, value]) => 
                                      `${key}: ${value}`
                                    ).join(', ')}
                                  </p>
                                )}
                              </div>
                            </td>
                            <td className="text-right py-3 px-4">{item.quantity}</td>
                            <td className="text-right py-3 px-4">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="text-right py-3 px-4">
                              {item.taxRate}%
                            </td>
                            <td className="text-right py-3 px-4 font-medium">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="border-t-2">
                          <td colSpan={4} className="text-right py-3 px-4 font-medium">
                            الإجمالي الفرعي
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {formatCurrency(invoice.subtotal)}
                          </td>
                        </tr>
                        {invoice.taxes.map((tax) => (
                          <tr key={tax.id}>
                            <td colSpan={4} className="text-right py-3 px-4">
                              {tax.description} ({tax.rate}%)
                            </td>
                            <td className="text-right py-3 px-4">
                              {formatCurrency(tax.taxAmount)}
                            </td>
                          </tr>
                        ))}
                        <tr className="border-t-2">
                          <td colSpan={4} className="text-right py-3 px-4 font-bold text-lg">
                            الإجمالي
                          </td>
                          <td className="text-right py-3 px-4 font-bold text-lg text-blue-600">
                            {formatCurrency(invoice.totalAmount)}
                          </td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Payments Tab */}
            <TabsContent value="payments">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <CreditCard className="h-5 w-5" />
                        المدفوعات
                      </CardTitle>
                      <CardDescription>
                        سجل المدفوعات المرتبطة بهذه الفاتورة
                      </CardDescription>
                    </div>
                    {remainingAmount > 0 && (
                      <Button onClick={openPaymentModal}>
                        <Plus className="ml-2 h-4 w-4" />
                        تسجيل دفعة
                      </Button>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {invoice.payments.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b">
                            <th className="text-right py-3 px-4">التاريخ</th>
                            <th className="text-right py-3 px-4">الطريقة</th>
                            <th className="text-right py-3 px-4">المرجع</th>
                            <th className="text-right py-3 px-4">المبلغ</th>
                            <th className="text-right py-3 px-4">الحالة</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoice.payments.map((invoicePayment) => (
                            <tr key={invoicePayment.id} className="border-b">
                              <td className="text-right py-3 px-4">
                                {formatDate(invoicePayment.payment.createdAt)}
                              </td>
                              <td className="text-right py-3 px-4">
                                {invoicePayment.payment.paymentMethod}
                              </td>
                              <td className="text-right py-3 px-4">
                                {invoicePayment.payment.reference || '-'}
                              </td>
                              <td className="text-right py-3 px-4 font-medium">
                                {formatCurrency(invoicePayment.payment.amount)}
                              </td>
                              <td className="text-right py-3 px-4">
                                <Badge variant={invoicePayment.payment.status === 'COMPLETED' ? 'default' : 'secondary'}>
                                  {invoicePayment.payment.status}
                                </Badge>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>لا توجد مدفوعات مسجلة</p>
                      <p className="text-sm">قم بتسجيل الدفعات لتتبعها هنا</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* History Tab */}
            <TabsContent value="history">
              <Card>
                <CardHeader>
                  <CardTitle>سجل التغييرات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                      <CheckCircle className="h-5 w-5 text-green-600" />
                      <div>
                        <p className="font-medium">إنشاء الفاتورة</p>
                        <p className="text-sm text-gray-600">
                          {formatDate(invoice.createdAt)} - بواسطة {invoice.createdBy}
                        </p>
                      </div>
                    </div>
                    
                    {invoice.status !== 'DRAFT' && (
                      <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                        <Mail className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="font-medium">إرسال الفاتورة</p>
                          <p className="text-sm text-gray-600">
                            تم إرسال الفاتورة للعميل
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {invoice.payments.length > 0 && (
                      <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                        <CreditCard className="h-5 w-5 text-purple-600" />
                        <div>
                          <p className="font-medium">تسجيل الدفعات</p>
                          <p className="text-sm text-gray-600">
                            تم تسجيل {invoice.payments.length} دفعة
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {invoice.updatedAt !== invoice.createdAt && (
                      <div className="flex items-center gap-3 p-3 bg-orange-50 rounded-lg">
                        <Edit className="h-5 w-5 text-orange-600" />
                        <div>
                          <p className="font-medium">تحديث الفاتورة</p>
                          <p className="text-sm text-gray-600">
                            آخر تحديث: {formatDate(invoice.updatedAt)}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={downloadInvoice}
              >
                <Download className="ml-2 h-4 w-4" />
                تحميل PDF
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => window.print()}
              >
                <Printer className="ml-2 h-4 w-4" />
                طباعة الفاتورة
              </Button>
              
              {invoice.status === 'DRAFT' && (
                <Button 
                  className="w-full justify-start"
                  onClick={sendInvoice}
                >
                  <Mail className="ml-2 h-4 w-4" />
                  إرسال للعميل
                </Button>
              )}
              
              <Link href={`/admin/finance/invoices/${invoice.id}/edit`}>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                >
                  <Edit className="ml-2 h-4 w-4" />
                  تعديل الفاتورة
                </Button>
              </Link>
              
              {remainingAmount > 0 && (
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={openPaymentModal}
                >
                  <Plus className="ml-2 h-4 w-4" />
                  تسجيل دفعة
                </Button>
              )}
            </CardContent>
          </Card>

          {/* Payment Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">ملخص الدفع</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">الإجمالي:</span>
                <span className="font-medium">{formatCurrency(invoice.totalAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">المدفوع:</span>
                <span className="font-medium text-green-600">{formatCurrency(invoice.paidAmount)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">المتبقي:</span>
                <span className={`font-medium ${remainingAmount > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {formatCurrency(remainingAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">نسبة الدفع:</span>
                <span className="font-medium">
                  {invoice.totalAmount > 0 ? ((invoice.paidAmount / invoice.totalAmount) * 100).toFixed(1) : '0.0'}%
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Due Date Info */}
          {remainingAmount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">معلومات الاستحقاق</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">تاريخ الاستحقاق:</span>
                  <span className={`font-medium ${isOverdue ? 'text-red-600' : ''}`}>
                    {formatDate(invoice.dueDate)}
                  </span>
                </div>
                
                {isOverdue && (
                  <div className="p-3 bg-red-50 rounded-lg">
                    <p className="text-sm text-red-800 font-medium">
                      الفاتورة متأخرة
                    </p>
                    <p className="text-xs text-red-600">
                      يرجى متابعة العميل للدفع
                    </p>
                  </div>
                )}
                
                {!isOverdue && (
                  <div className="p-3 bg-blue-50 rounded-lg">
                    <p className="text-sm text-blue-800 font-medium">
                      الفاتورة قيد الانتظار
                    </p>
                    <p className="text-xs text-blue-600">
                      متبقي {Math.ceil((new Date(invoice.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))} يوم
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Payment Modal */}
      <Dialog open={showPaymentModal} onOpenChange={setShowPaymentModal}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>تسجيل دفعة جديدة</DialogTitle>
            <DialogDescription>
              تسجيل دفعة للفاتورة رقم {invoice?.invoiceNumber}
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handlePaymentSubmit} className="space-y-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right">
                المبلغ
              </Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={paymentForm.amount}
                onChange={(e) => setPaymentForm({...paymentForm, amount: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentMethod" className="text-right">
                طريقة الدفع
              </Label>
              <Select 
                value={paymentForm.paymentMethod} 
                onValueChange={(value) => setPaymentForm({...paymentForm, paymentMethod: value})}
                required
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="اختر طريقة الدفع" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CASH">نقدي</SelectItem>
                  <SelectItem value="BANK_TRANSFER">تحويل بنكي</SelectItem>
                  <SelectItem value="CHECK">شيك</SelectItem>
                  <SelectItem value="CREDIT_CARD">بطاقة ائتمان</SelectItem>
                  <SelectItem value="DEBIT_CARD">بطاقة خصم مباشر</SelectItem>
                  <SelectItem value="MOBILE_WALLET">محفظة إلكترونية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="paymentDate" className="text-right">
                تاريخ الدفع
              </Label>
              <Input
                id="paymentDate"
                type="date"
                value={paymentForm.paymentDate}
                onChange={(e) => setPaymentForm({...paymentForm, paymentDate: e.target.value})}
                className="col-span-3"
                required
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="referenceNumber" className="text-right">
                الرقم المرجعي
              </Label>
              <Input
                id="referenceNumber"
                placeholder="اختياري"
                value={paymentForm.referenceNumber}
                onChange={(e) => setPaymentForm({...paymentForm, referenceNumber: e.target.value})}
                className="col-span-3"
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="notes" className="text-right">
                ملاحظات
              </Label>
              <Textarea
                id="notes"
                placeholder="ملاحظات اختيارية"
                value={paymentForm.notes}
                onChange={(e) => setPaymentForm({...paymentForm, notes: e.target.value})}
                className="col-span-3"
                rows={3}
              />
            </div>
            
            {invoice && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="flex justify-between text-sm">
                  <span>المبلغ المتبقي:</span>
                  <span className="font-medium">{formatCurrency(invoice.totalAmount - invoice.paidAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>الإجمالي:</span>
                  <span>{formatCurrency(invoice.totalAmount)}</span>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                  <span>المدفوع:</span>
                  <span>{formatCurrency(invoice.paidAmount)}</span>
                </div>
              </div>
            )}
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowPaymentModal(false)}
                disabled={processingPayment}
              >
                إلغاء
              </Button>
              <Button 
                type="submit" 
                disabled={processingPayment}
              >
                {processingPayment ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white ml-2"></div>
                    جاري المعالجة...
                  </>
                ) : (
                  'تسجيل الدفعة'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}