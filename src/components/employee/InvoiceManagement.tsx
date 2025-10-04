'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog'
import { 
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Download,
  Send,
  DollarSign,
  Calendar,
  User,
  CheckCircle,
  XCircle,
  Clock,
  AlertTriangle,
  Eye,
  Receipt
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface Invoice {
  id: string
  orderId: string
  customerName: string
  customerEmail: string
  items: {
    description: string
    quantity: number
    unitPrice: number
    totalPrice: number
  }[]
  subtotal: number
  tax: number
  total: number
  status: 'draft' | 'sent' | 'paid' | 'overdue'
  issueDate: string
  dueDate: string
  paidDate?: string
}

interface Order {
  id: string
  customerName: string
  customerEmail: string
  carDetails: {
    make: string
    model: string
    year: number
    price: number
  }
  totalAmount: number
}

interface InvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface InvoiceFormData {
  orderId: string
  customerName: string
  customerEmail: string
  items: InvoiceItem[]
  tax: number
  dueDate: string
}

export default function InvoiceManagement() {
  const { toast } = useToast()
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [filteredInvoices, setFilteredInvoices] = useState<Invoice[]>([])
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null)
  const [formData, setFormData] = useState<InvoiceFormData>({
    orderId: '',
    customerName: '',
    customerEmail: '',
    items: [
      { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
    ],
    tax: 0,
    dueDate: ''
  })

  useEffect(() => {
    fetchInvoices()
    fetchOrders()
  }, [])

  useEffect(() => {
    filterInvoices()
  }, [invoices, searchTerm, statusFilter])

  const fetchInvoices = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/employee/invoices')
      if (response.ok) {
        const data = await response.json()
        setInvoices(data)
      } else {
        // If API fails, show empty state
        setInvoices([])
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الفواتير',
        variant: 'destructive'
      })
      // Use empty state as fallback
      setInvoices([])
    } finally {
      setLoading(false)
    }
  }

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/employee/orders')
      if (response.ok) {
        const data = await response.json()
        setOrders(data.filter((order: Order) => order.status === 'completed'))
      } else {
        // If API fails, show empty state
        setOrders([])
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات الطلبات',
        variant: 'destructive'
      })
      // Use empty state as fallback
      setOrders([])
    }
  }

  const filterInvoices = () => {
    let filtered = invoices

    if (searchTerm) {
      filtered = filtered.filter(invoice => 
        invoice.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.customerEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.id.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    if (statusFilter !== 'all') {
      filtered = filtered.filter(invoice => invoice.status === statusFilter)
    }

    setFilteredInvoices(filtered)
  }

  const calculateTotals = (items: InvoiceItem[], tax: number) => {
    const subtotal = items.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
    const taxAmount = subtotal * (tax / 100)
    const total = subtotal + taxAmount
    return { subtotal, taxAmount, total }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const { subtotal, taxAmount, total } = calculateTotals(formData.items, formData.tax)
      
      const invoiceData = {
        ...formData,
        subtotal,
        tax: taxAmount,
        total
      }

      const url = editingInvoice ? `/api/employee/invoices/${editingInvoice.id}` : '/api/employee/invoices'
      const method = editingInvoice ? 'PUT' : 'POST'
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: editingInvoice ? 'تم تحديث الفاتورة بنجاح' : 'تمت إضافة الفاتورة بنجاح'
        })
        fetchInvoices()
        setIsDialogOpen(false)
        resetForm()
      } else {
        throw new Error('فشل في حفظ الفاتورة')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حفظ الفاتورة',
        variant: 'destructive'
      })
    }
  }

  const handleDelete = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/employee/invoices/${invoiceId}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم حذف الفاتورة بنجاح'
        })
        fetchInvoices()
      } else {
        throw new Error('فشل في حذف الفاتورة')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في حذف الفاتورة',
        variant: 'destructive'
      })
    }
  }

  const handleEdit = (invoice: Invoice) => {
    setEditingInvoice(invoice)
    setFormData({
      orderId: invoice.orderId,
      customerName: invoice.customerName,
      customerEmail: invoice.customerEmail,
      items: invoice.items,
      tax: (invoice.tax / invoice.subtotal) * 100,
      dueDate: invoice.dueDate
    })
    setIsDialogOpen(true)
  }

  const handleSendInvoice = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/employee/invoices/${invoiceId}/send`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم إرسال الفاتورة بنجاح'
        })
        fetchInvoices()
      } else {
        throw new Error('فشل في إرسال الفاتورة')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال الفاتورة',
        variant: 'destructive'
      })
    }
  }

  const handleMarkAsPaid = async (invoiceId: string) => {
    try {
      const response = await fetch(`/api/employee/invoices/${invoiceId}/pay`, {
        method: 'POST'
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم تحديث حالة الفاتورة إلى مدفوعة'
        })
        fetchInvoices()
      } else {
        throw new Error('فشل في تحديث حالة الفاتورة')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحديث حالة الفاتورة',
        variant: 'destructive'
      })
    }
  }

  const resetForm = () => {
    setEditingInvoice(null)
    setFormData({
      orderId: '',
      customerName: '',
      customerEmail: '',
      items: [
        { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }
      ],
      tax: 0,
      dueDate: ''
    })
  }

  const addItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { description: '', quantity: 1, unitPrice: 0, totalPrice: 0 }]
    })
  }

  const removeItem = (index: number) => {
    if (formData.items.length > 1) {
      const newItems = formData.items.filter((_, i) => i !== index)
      setFormData({
        ...formData,
        items: newItems
      })
    }
  }

  const updateItem = (index: number, field: keyof InvoiceItem, value: string | number) => {
    const newItems = [...formData.items]
    newItems[index] = {
      ...newItems[index],
      [field]: value
    }
    
    // Recalculate total price for this item
    if (field === 'quantity' || field === 'unitPrice') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].unitPrice
    }
    
    setFormData({
      ...formData,
      items: newItems
    })
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { variant: 'secondary', label: 'مسودة', icon: FileText },
      sent: { variant: 'default', label: 'مرسلة', icon: Send },
      paid: { variant: 'outline', label: 'مدفوعة', icon: CheckCircle },
      overdue: { variant: 'destructive', label: 'متأخرة', icon: AlertTriangle }
    } as const

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.draft
    const Icon = config.icon

    return (
      <Badge variant={config.variant as any} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (dueDate: string, status: string) => {
    return status !== 'paid' && new Date(dueDate) < new Date()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">إدارة الفواتير</h2>
          <p className="text-gray-600">إنشاء وإدارة فواتير المبيعات</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm}>
              <Plus className="w-4 h-4 ml-2" />
              إنشاء فاتورة جديدة
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                {editingInvoice ? 'تعديل فاتورة' : 'إنشاء فاتورة جديدة'}
              </DialogTitle>
              <DialogDescription>
                {editingInvoice ? 'تعديل الفاتورة الموجودة' : 'إنشاء فاتورة جديدة للطلب'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="orderId">الطلب</Label>
                  <Select value={formData.orderId} onValueChange={(value) => {
                    const selectedOrder = orders.find(order => order.id === value)
                    setFormData({
                      ...formData,
                      orderId: value,
                      customerName: selectedOrder?.customerName || '',
                      customerEmail: selectedOrder?.customerEmail || '',
                      items: selectedOrder ? [{
                        description: `${selectedOrder.carDetails.make} ${selectedOrder.carDetails.model} (${selectedOrder.carDetails.year})`,
                        quantity: 1,
                        unitPrice: selectedOrder.totalAmount,
                        totalPrice: selectedOrder.totalAmount
                      }] : formData.items
                    })
                  }}>
                    <SelectTrigger>
                      <SelectValue placeholder="اختر الطلب" />
                    </SelectTrigger>
                    <SelectContent>
                      {orders.map((order) => (
                        <SelectItem key={order.id} value={order.id}>
                          {order.customerName} - {order.carDetails.make} {order.carDetails.model}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="dueDate">تاريخ الاستحقاق</Label>
                  <Input
                    id="dueDate"
                    type="date"
                    value={formData.dueDate}
                    onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerName">اسم العميل</Label>
                  <Input
                    id="customerName"
                    value={formData.customerName}
                    onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="customerEmail">البريد الإلكتروني</Label>
                  <Input
                    id="customerEmail"
                    type="email"
                    value={formData.customerEmail}
                    onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                    required
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-4">
                  <Label>العناصر</Label>
                  <Button type="button" variant="outline" size="sm" onClick={addItem}>
                    <Plus className="w-4 h-4 ml-1" />
                    إضافة عنصر
                  </Button>
                </div>
                <div className="space-y-3">
                  {formData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-end">
                      <div className="col-span-5">
                        <Label className="text-sm">الوصف</Label>
                        <Input
                          value={item.description}
                          onChange={(e) => updateItem(index, 'description', e.target.value)}
                          required
                        />
                      </div>
                      <div className="col-span-2">
                        <Label className="text-sm">الكمية</Label>
                        <Input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value) || 0)}
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-span-3">
                        <Label className="text-sm">السعر</Label>
                        <Input
                          type="number"
                          value={item.unitPrice}
                          onChange={(e) => updateItem(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          min="0"
                          step="0.01"
                          required
                        />
                      </div>
                      <div className="col-span-1">
                        <Label className="text-sm">الإجمالي</Label>
                        <div className="p-2 border rounded bg-gray-50 text-sm">
                          {item.totalPrice.toFixed(2)}
                        </div>
                      </div>
                      <div className="col-span-1">
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeItem(index)}
                          disabled={formData.items.length === 1}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="tax">ضريبة (%)</Label>
                  <Input
                    id="tax"
                    type="number"
                    value={formData.tax}
                    onChange={(e) => setFormData({...formData, tax: parseFloat(e.target.value) || 0})}
                    min="0"
                    max="100"
                    step="0.1"
                  />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>المجموع الفرعي:</span>
                    <span>{calculateTotals(formData.items, formData.tax).subtotal.toFixed(2)} جنيه</span>
                  </div>
                  <div className="flex justify-between">
                    <span>الضريبة:</span>
                    <span>{calculateTotals(formData.items, formData.tax).taxAmount.toFixed(2)} جنيه</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg">
                    <span>الإجمالي:</span>
                    <span>{calculateTotals(formData.items, formData.tax).total.toFixed(2)} جنيه</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingInvoice ? 'تحديث' : 'إنشاء'}
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  إلغاء
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="بحث بالعميل أو رقم الفاتورة..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pr-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-32">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">جميع الحالات</SelectItem>
                  <SelectItem value="draft">مسودة</SelectItem>
                  <SelectItem value="sent">مرسلة</SelectItem>
                  <SelectItem value="paid">مدفوعة</SelectItem>
                  <SelectItem value="overdue">متأخرة</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Invoices List */}
      <div className="space-y-4">
        {filteredInvoices.map((invoice) => (
          <Card key={invoice.id} className={isOverdue(invoice.dueDate, invoice.status) ? 'border-red-200' : ''}>
            <CardContent className="p-6">
              <div className="space-y-4">
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-3">
                      <h3 className="font-semibold text-lg">فاتورة #{invoice.id.slice(-6)}</h3>
                      {getStatusBadge(invoice.status)}
                      {isOverdue(invoice.dueDate, invoice.status) && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3" />
                          متأخرة
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>الإصدار: {formatDate(invoice.issueDate)}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        <span>الاستحقاق: {formatDate(invoice.dueDate)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => handleEdit(invoice)}
                    >
                      <Edit className="w-4 h-4 ml-1" />
                      تعديل
                    </Button>
                    {invoice.status === 'draft' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleSendInvoice(invoice.id)}
                      >
                        <Send className="w-4 h-4 ml-1" />
                        إرسال
                      </Button>
                    )}
                    {invoice.status === 'sent' && (
                      <Button 
                        size="sm" 
                        onClick={() => handleMarkAsPaid(invoice.id)}
                      >
                        <DollarSign className="w-4 h-4 ml-1" />
                        سداد
                      </Button>
                    )}
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>تأكيد الحذف</AlertDialogTitle>
                          <AlertDialogDescription>
                            هل أنت متأكد من حذف فاتورة #{invoice.id.slice(-6)}؟ لا يمكن التراجع عن هذا الإجراء.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>إلغاء</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleDelete(invoice.id)}>
                            حذف
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">معلومات العميل</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-gray-400" />
                          <span>{invoice.customerName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Receipt className="w-4 h-4 text-gray-400" />
                          <span>{invoice.customerEmail}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div>
                      <h4 className="font-medium mb-2">تفاصيل الفاتورة</h4>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>المجموع الفرعي:</span>
                          <span>{invoice.subtotal.toFixed(2)} جنيه</span>
                        </div>
                        <div className="flex justify-between">
                          <span>الضريبة:</span>
                          <span>{invoice.tax.toFixed(2)} جنيه</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>الإجمالي:</span>
                          <span>{invoice.total.toFixed(2)} جنيه</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">العناصر</h4>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="space-y-2">
                      {invoice.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center text-sm">
                          <div>
                            <span className="font-medium">{item.description}</span>
                            <span className="text-gray-600 ml-2">× {item.quantity}</span>
                          </div>
                          <span>{item.totalPrice.toFixed(2)} جنيه</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredInvoices.length === 0 && (
        <Card>
          <CardContent className="text-center py-8">
            <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600 mb-4">لا توجد فواتير مطابقة للبحث</p>
            <Button onClick={() => {
              setSearchTerm('')
              setStatusFilter('all')
            }}>
              مسح الفلاتر
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}