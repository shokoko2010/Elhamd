'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  Save, 
  Send, 
  Plus, 
  Trash2, 
  Calculator,
  FileText,
  DollarSign,
  Calendar,
  User,
  Package,
  Smartphone,
  CreditCard,
  Banknote,
  CheckCircle,
  AlertCircle,
  Clock,
  XCircle
} from 'lucide-react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
}

interface ServiceItem {
  id: string
  name: string
  description: string
  price: number
  category: string
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

interface TaxRate {
  id: string
  type: string
  rate: number
  description: string
  isActive: boolean
}

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
  payments?: InvoicePayment[]
  taxes: any[]
  notes?: string
  terms?: string
  createdAt: string
  updatedAt: string
  createdBy: string
}

interface InvoicePayment {
  id: string
  amount: number
  paymentDate: string
  paymentMethod: string
  transactionId?: string
  notes?: string
  payment: {
    id: string
    status: string
    metadata?: any
  }
}

export default function EditInvoicePage() {
  return (
    <AdminRoute>
      <EditInvoiceContent />
    </AdminRoute>
  )
}

function EditInvoiceContent() {
  const params = useParams()
  const router = useRouter()
  const invoiceId = params.id as string
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [invoice, setInvoice] = useState<Invoice | null>(null)
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [invoiceType, setInvoiceType] = useState('SERVICE')
  const [issueDate, setIssueDate] = useState('')
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [showOfflinePayment, setShowOfflinePayment] = useState(false)
  const [showStatusUpdate, setShowStatusUpdate] = useState(false)
  const [offlinePayment, setOfflinePayment] = useState({
    amount: '',
    paymentMethod: 'CASH',
    notes: '',
    referenceNumber: '',
    paymentDate: new Date().toISOString().split('T')[0]
  })
  const [statusUpdate, setStatusUpdate] = useState({
    status: '',
    notes: '',
    sendNotification: false
  })
  const { toast } = useToast()

  useEffect(() => {
    if (invoiceId) {
      fetchInvoiceData()
    }
  }, [invoiceId])

  const fetchInvoiceData = async () => {
    try {
      setLoading(true)
      
      // Fetch invoice
      const invoiceResponse = await fetch(`/api/finance/invoices/${invoiceId}`)
      if (invoiceResponse.ok) {
        const invoiceData = await invoiceResponse.json()
        setInvoice(invoiceData)
        setSelectedCustomer(invoiceData.customerId)
        setInvoiceType(invoiceData.type)
        setIssueDate(new Date(invoiceData.issueDate).toISOString().split('T')[0])
        setDueDate(new Date(invoiceData.dueDate).toISOString().split('T')[0])
        setNotes(invoiceData.notes || '')
        setTerms(invoiceData.terms || '')
        setItems(invoiceData.items)
      }

      // Fetch customers
      const customersResponse = await fetch('/api/crm/customers')
      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        setCustomers(customersData.customers || [])
      }

      // Fetch service items
      const serviceItemsResponse = await fetch('/api/service-items')
      if (serviceItemsResponse.ok) {
        const serviceItemsData = await serviceItemsResponse.json()
        setServiceItems(serviceItemsData || [])
      }

      // Fetch tax rates
      const taxRatesResponse = await fetch('/api/tax/rates')
      if (taxRatesResponse.ok) {
        const taxRatesData = await taxRatesResponse.json()
        setTaxRates(taxRatesData.rates || [])
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

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      totalPrice: 0,
      taxRate: 14, // Default VAT rate
      taxAmount: 0
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem = { ...item, [field]: value }
        
        // Recalculate totals
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
          updatedItem.totalPrice = updatedItem.quantity * updatedItem.unitPrice
          updatedItem.taxAmount = updatedItem.totalPrice * (updatedItem.taxRate / 100)
        }
        
        return updatedItem
      }
      return item
    }))
  }

  const addServiceItem = (serviceItem: ServiceItem) => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: serviceItem.name,
      quantity: 1,
      unitPrice: serviceItem.price,
      totalPrice: serviceItem.price,
      taxRate: 14,
      taxAmount: serviceItem.price * 0.14
    }
    setItems([...items, newItem])
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + item.totalPrice, 0)
    const taxAmount = items.reduce((sum, item) => sum + item.taxAmount, 0)
    const totalAmount = subtotal + taxAmount
    
    return { subtotal, taxAmount, totalAmount }
  }

  const saveInvoice = async () => {
    if (!selectedCustomer || items.length === 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى تحديد العميل وإضافة بنود الفاتورة',
        variant: 'destructive'
      })
      return
    }

    setSaving(true)
    
    try {
      const { subtotal, taxAmount, totalAmount } = calculateTotals()
      
      const invoiceData = {
        customerId: selectedCustomer,
        type: invoiceType,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate
        })),
        issueDate,
        dueDate,
        notes,
        terms,
        status: invoice?.status || 'DRAFT'
      }

      const response = await fetch(`/api/finance/invoices/${invoiceId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      })

      if (response.ok) {
        const updatedInvoice = await response.json()
        toast({
          title: 'نجاح',
          description: 'تم تحديث الفاتورة بنجاح'
        })
        
        // Redirect to invoice details
        router.push(`/admin/finance/invoices/${updatedInvoice.id}`)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update invoice')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في تحديث الفاتورة',
        variant: 'destructive'
      })
    } finally {
      setSaving(false)
    }
  }

  const recordOfflinePayment = async () => {
    if (!offlinePayment.amount || parseFloat(offlinePayment.amount) <= 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال مبلغ الدفع',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch('/api/finance/payments/offline', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          invoiceId,
          amount: parseFloat(offlinePayment.amount),
          paymentMethod: offlinePayment.paymentMethod,
          notes: offlinePayment.notes,
          referenceNumber: offlinePayment.referenceNumber,
          paymentDate: offlinePayment.paymentDate
        })
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'نجاح',
          description: 'تم تسجيل الدفع بنجاح'
        })
        
        // Reset form and refresh invoice data
        setOfflinePayment({
          amount: '',
          paymentMethod: 'CASH',
          notes: '',
          referenceNumber: '',
          paymentDate: new Date().toISOString().split('T')[0]
        })
        setShowOfflinePayment(false)
        fetchInvoiceData()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to record payment')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في تسجيل الدفع',
        variant: 'destructive'
      })
    }
  }

  const updateInvoiceStatus = async () => {
    if (!statusUpdate.status) {
      toast({
        title: 'خطأ',
        description: 'يرجى اختيار الحالة الجديدة',
        variant: 'destructive'
      })
      return
    }

    try {
      const response = await fetch(`/api/finance/invoices/${invoiceId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(statusUpdate)
      })

      if (response.ok) {
        const result = await response.json()
        toast({
          title: 'نجاح',
          description: 'تم تحديث حالة الفاتورة بنجاح'
        })
        
        // Reset form and refresh invoice data
        setStatusUpdate({
          status: '',
          notes: '',
          sendNotification: false
        })
        setShowStatusUpdate(false)
        fetchInvoiceData()
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to update status')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في تحديث الحالة',
        variant: 'destructive'
      })
    }
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { color: 'bg-gray-100 text-gray-800', icon: FileText, label: 'مسودة' },
      SENT: { color: 'bg-blue-100 text-blue-800', icon: Send, label: 'مرسلة' },
      PAID: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'مدفوعة' },
      PARTIALLY_PAID: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'مدفوعة جزئياً' },
      OVERDUE: { color: 'bg-red-100 text-red-800', icon: AlertCircle, label: 'متأخرة' },
      CANCELLED: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'ملغية' },
      REFUNDED: { color: 'bg-purple-100 text-purple-800', icon: AlertCircle, label: 'مستردة' }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.DRAFT
    const Icon = config.icon

    return (
      <Badge className={config.color}>
        <Icon className="w-3 h-3 ml-1" />
        {config.label}
      </Badge>
    )
  }

  const { subtotal, taxAmount, totalAmount } = calculateTotals()

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href={`/admin/finance/invoices/${invoiceId}`}>
            <Button variant="ghost" size="sm">
              <ArrowLeft className="ml-2 h-4 w-4" />
              العودة
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold">تعديل الفاتورة</h1>
            <div className="flex items-center gap-2 mt-2">
              <p className="text-gray-600">فاتورة رقم {invoice.invoiceNumber}</p>
              {getStatusBadge(invoice.status)}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowStatusUpdate(true)}
            className="flex items-center gap-2"
          >
            <AlertCircle className="h-4 w-4" />
            تحديث الحالة
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setShowOfflinePayment(true)}
            className="flex items-center gap-2"
          >
            <Banknote className="h-4 w-4" />
            دفع أوفلاين
          </Button>
          <Button variant="outline" onClick={saveInvoice} disabled={saving}>
            <Save className="ml-2 h-4 w-4" />
            {saving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
          </Button>
          {invoice.status === 'DRAFT' && (
            <Button onClick={saveInvoice} disabled={saving}>
              <Send className="ml-2 h-4 w-4" />
              حفظ وإرسال
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                معلومات العميل
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="customer">العميل</Label>
                <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        <div>
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-sm text-gray-500">{customer.email}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="invoiceType">نوع الفاتورة</Label>
                  <Select value={invoiceType} onValueChange={setInvoiceType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="SERVICE">خدمة</SelectItem>
                      <SelectItem value="PRODUCT">منتج</SelectItem>
                      <SelectItem value="SUBSCRIPTION">اشتراك</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="issueDate">تاريخ الإصدار</Label>
                  <Input
                    id="issueDate"
                    type="date"
                    value={issueDate}
                    onChange={(e) => setIssueDate(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                <Input
                  id="dueDate"
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Items */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  بنود الفاتورة
                </CardTitle>
                <Button variant="outline" size="sm" onClick={addItem}>
                  <Plus className="ml-2 h-4 w-4" />
                  إضافة بند
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Add Service Items */}
              <div>
                <Label className="text-sm text-gray-600">إضافة خدمة سريعة</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                  {serviceItems.slice(0, 4).map((serviceItem) => (
                    <Button
                      key={serviceItem.id}
                      variant="outline"
                      size="sm"
                      className="justify-start"
                      onClick={() => addServiceItem(serviceItem)}
                    >
                      <div className="text-right">
                        <p className="font-medium">{serviceItem.name}</p>
                        <p className="text-xs text-gray-500">{serviceItem.price} ج.م</p>
                      </div>
                    </Button>
                  ))}
                </div>
              </div>

              {/* Items Table */}
              <div className="space-y-4">
                {items.map((item, index) => (
                  <div key={item.id} className="border rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-medium">بند #{index + 1}</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeItem(item.id)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">الوصف</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(item.id, 'description', e.target.value)}
                          placeholder="وصف البند"
                        />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label className="text-sm">الكمية</Label>
                          <Input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateItem(item.id, 'quantity', parseFloat(e.target.value) || 0)}
                            min="1"
                          />
                        </div>
                        
                        <div>
                          <Label className="text-sm">السعر</Label>
                          <Input
                            type="number"
                            value={item.unitPrice}
                            onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                            min="0"
                            step="0.01"
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-sm">ضريبة (%)</Label>
                        <Select 
                          value={item.taxRate.toString()} 
                          onValueChange={(value) => updateItem(item.id, 'taxRate', parseFloat(value))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {taxRates.map((tax) => (
                              <SelectItem key={tax.id} value={tax.rate.toString()}>
                                {tax.type} ({tax.rate}%)
                              </SelectItem>
                            ))}
                            <SelectItem value="0">معفى</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      
                      <div>
                        <Label className="text-sm">المجموع</Label>
                        <div className="p-2 bg-gray-50 rounded font-medium">
                          {(item.totalPrice || 0).toFixed(2)} ج.م
                        </div>
                      </div>
                      
                      <div>
                        <Label className="text-sm">الضريبة</Label>
                        <div className="p-2 bg-gray-50 rounded font-medium">
                          {(item.taxAmount || 0).toFixed(2)} ج.م
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {items.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Package className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                    <p>لا توجد بنود في الفاتورة</p>
                    <p className="text-sm">اضغط على "إضافة بند" للبدء</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Notes and Terms */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">ملاحظات</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية للفاتورة..."
                  rows={4}
                />
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">الشروط والأحكام</CardTitle>
              </CardHeader>
              <CardContent>
                <Textarea
                  value={terms}
                  onChange={(e) => setTerms(e.target.value)}
                  placeholder="الشروط والأحكام الخاصة بالفاتورة..."
                  rows={4}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calculator className="h-5 w-5" />
                ملخص الفاتورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">الإجمالي الفرعي:</span>
                  <span className="font-medium">{(subtotal || 0).toFixed(2)} ج.م</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">الضريبة:</span>
                  <span className="font-medium">{(taxAmount || 0).toFixed(2)} ج.م</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span className="text-blue-600">{(totalAmount || 0).toFixed(2)} ج.م</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">معلومات الحالة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">الحالة الحالية:</span>
                {getStatusBadge(invoice.status)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">المدفوع:</span>
                <span className="font-medium">{(invoice.paidAmount || 0).toFixed(2)} ج.م</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">المتبقي:</span>
                <span className={`font-medium ${(totalAmount - invoice.paidAmount) > 0 ? 'text-orange-600' : 'text-green-600'}`}>
                  {((totalAmount || 0) - (invoice.paidAmount || 0)).toFixed(2)} ج.م
                </span>
              </div>
              
              {/* Payment History */}
              {invoice.payments && invoice.payments.length > 0 && (
                <div className="border-t pt-3">
                  <p className="text-sm font-medium mb-2">سجل الدفعات:</p>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {invoice.payments.map((payment) => (
                      <div key={payment.id} className="text-xs bg-gray-50 p-2 rounded">
                        <div className="flex justify-between">
                          <span>{payment.paymentMethod}</span>
                          <span className="font-medium">{payment.amount.toFixed(2)} ج.م</span>
                        </div>
                        <div className="text-gray-500">
                          {new Date(payment.paymentDate).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">إجراءات سريعة</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={addItem}
              >
                <Plus className="ml-2 h-4 w-4" />
                إضافة بند جديد
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  setTerms('الشروط الافتراضية:\n- الدفع خلال 30 يوم\n- جميع الأسعار شاملة الضريبة\n- لا يسمح بالإرجاع بعد 7 أيام')
                }}
              >
                <FileText className="ml-2 h-4 w-4" />
                إدراج شروط افتراضية
              </Button>
              
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => {
                  const dueDate = new Date(issueDate)
                  dueDate.setDate(dueDate.getDate() + 15)
                  setDueDate(dueDate.toISOString().split('T')[0])
                }}
              >
                <Calendar className="ml-2 h-4 w-4" />
                تاريخ استحقاق 15 يوم
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Offline Payment Modal */}
      {showOfflinePayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Banknote className="h-5 w-5" />
                تسجيل دفع أوفلاين
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="paymentAmount">المبلغ</Label>
                <Input
                  id="paymentAmount"
                  type="number"
                  value={offlinePayment.amount}
                  onChange={(e) => setOfflinePayment(prev => ({ ...prev, amount: e.target.value }))}
                  placeholder="أدخل المبلغ"
                  step="0.01"
                  min="0"
                  max={((totalAmount || 0) - (invoice?.paidAmount || 0)).toFixed(2)}
                />
                <p className="text-xs text-gray-500 mt-1">
                  المتبقي للسداد: {((totalAmount || 0) - (invoice?.paidAmount || 0)).toFixed(2)} ج.م
                </p>
              </div>

              <div>
                <Label htmlFor="paymentMethod">طريقة الدفع</Label>
                <Select 
                  value={offlinePayment.paymentMethod} 
                  onValueChange={(value) => setOfflinePayment(prev => ({ ...prev, paymentMethod: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="CASH">نقدي</SelectItem>
                    <SelectItem value="BANK_TRANSFER">تحويل بنكي</SelectItem>
                    <SelectItem value="CHECK">شيك</SelectItem>
                    <SelectItem value="CREDIT_CARD">بطاقة ائتمان</SelectItem>
                    <SelectItem value="DEBIT_CARD">بطاقة خصم مباشر</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="paymentDate">تاريخ الدفع</Label>
                <Input
                  id="paymentDate"
                  type="date"
                  value={offlinePayment.paymentDate}
                  onChange={(e) => setOfflinePayment(prev => ({ ...prev, paymentDate: e.target.value }))}
                />
              </div>

              <div>
                <Label htmlFor="referenceNumber">رقم المرجع (اختياري)</Label>
                <Input
                  id="referenceNumber"
                  value={offlinePayment.referenceNumber}
                  onChange={(e) => setOfflinePayment(prev => ({ ...prev, referenceNumber: e.target.value }))}
                  placeholder="رقم العملية أو الشيك"
                />
              </div>

              <div>
                <Label htmlFor="paymentNotes">ملاحظات (اختياري)</Label>
                <Textarea
                  id="paymentNotes"
                  value={offlinePayment.notes}
                  onChange={(e) => setOfflinePayment(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="أي ملاحظات إضافية..."
                  rows={3}
                />
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowOfflinePayment(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={recordOfflinePayment}
                  className="flex-1"
                  disabled={!offlinePayment.amount || parseFloat(offlinePayment.amount) <= 0}
                >
                  تسجيل الدفع
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Status Update Modal */}
      {showStatusUpdate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md mx-4">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                تحديث حالة الفاتورة
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="newStatus">الحالة الجديدة</Label>
                <Select 
                  value={statusUpdate.status} 
                  onValueChange={(value) => setStatusUpdate(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الحالة الجديدة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="DRAFT">مسودة</SelectItem>
                    <SelectItem value="SENT">مرسلة</SelectItem>
                    <SelectItem value="PAID">مدفوعة</SelectItem>
                    <SelectItem value="PARTIALLY_PAID">مدفوعة جزئياً</SelectItem>
                    <SelectItem value="OVERDUE">متأخرة</SelectItem>
                    <SelectItem value="CANCELLED">ملغية</SelectItem>
                    <SelectItem value="REFUNDED">مستردة</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="statusNotes">ملاحظات التغيير (اختياري)</Label>
                <Textarea
                  id="statusNotes"
                  value={statusUpdate.notes}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="سبب تغيير الحالة..."
                  rows={3}
                />
              </div>

              <div className="flex items-center space-x-2 space-x-reverse">
                <input
                  type="checkbox"
                  id="sendNotification"
                  checked={statusUpdate.sendNotification}
                  onChange={(e) => setStatusUpdate(prev => ({ ...prev, sendNotification: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="sendNotification" className="text-sm">
                  إرسال إشعار للعميل
                </Label>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setShowStatusUpdate(false)}
                  className="flex-1"
                >
                  إلغاء
                </Button>
                <Button 
                  onClick={updateInvoiceStatus}
                  className="flex-1"
                  disabled={!statusUpdate.status}
                >
                  تحديث الحالة
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}