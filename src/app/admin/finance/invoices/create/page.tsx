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
  Smartphone
} from 'lucide-react'
import Link from 'next/link'
import { useToast } from '@/hooks/use-toast'

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
  segment?: string
  status?: string
}

interface ServiceItem {
  id: string
  name?: string
  title?: string
  description: string
  price?: number
  category?: string
  icon?: string
  link?: string
  order?: number
  isActive?: boolean
}

interface InvoiceItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxRate: number
  taxAmount: number
}

interface TaxRate {
  id: string
  type: string
  rate: number
  description: string
  isActive: boolean
}

export default function CreateInvoicePage() {
  return (
    <AdminRoute>
      <CreateInvoiceContent />
    </AdminRoute>
  )
}

function CreateInvoiceContent() {
  const [loading, setLoading] = useState(false)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [serviceItems, setServiceItems] = useState<ServiceItem[]>([])
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState('')
  const [invoiceType, setInvoiceType] = useState('SERVICE')
  const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0])
  const [dueDate, setDueDate] = useState('')
  const [notes, setNotes] = useState('')
  const [terms, setTerms] = useState('')
  const [items, setItems] = useState<InvoiceItem[]>([])
  const [showNewCustomerForm, setShowNewCustomerForm] = useState(false)
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    email: '',
    phone: '',
    company: ''
  })
  const [isCreatingCustomer, setIsCreatingCustomer] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    fetchInitialData()
    
    // Set due date to 30 days from issue date
    const dueDate = new Date()
    dueDate.setDate(dueDate.getDate() + 30)
    setDueDate(dueDate.toISOString().split('T')[0])
  }, [])

  const fetchInitialData = async () => {
    try {
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
        // Transform service items to have consistent structure
        const transformedItems = serviceItemsData.map((item: any) => ({
          ...item,
          name: item.name || item.title || '',
          price: item.price || 0
        }))
        setServiceItems(transformedItems || [])
      }

      // Fetch tax rates
      const taxRatesResponse = await fetch('/api/tax/rates')
      if (taxRatesResponse.ok) {
        const taxRatesData = await taxRatesResponse.json()
        setTaxRates(taxRatesData.rates || [])
      } else {
        // Set default tax rates if API fails
        setTaxRates([
          { id: '1', type: 'ضريبة القيمة المضافة', rate: 14, description: 'ضريبة القيمة المضافة القياسية', isActive: true },
          { id: '2', type: 'ضريبة الخدمات', rate: 10, description: 'ضريبة على الخدمات', isActive: true },
          { id: '3', type: 'معفى', rate: 0, description: 'معفى من الضريبة', isActive: true }
        ])
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل البيانات الأساسية',
        variant: 'destructive'
      })
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
        
        // Ensure numeric values are properly initialized
        const quantity = parseFloat(updatedItem.quantity) || 0
        const unitPrice = parseFloat(updatedItem.unitPrice) || 0
        const taxRate = parseFloat(updatedItem.taxRate) || 0
        
        // Recalculate totals
        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
          updatedItem.totalPrice = quantity * unitPrice
          updatedItem.taxAmount = updatedItem.totalPrice * (taxRate / 100)
        }
        
        return updatedItem
      }
      return item
    }))
  }

  const addServiceItem = (serviceItem: ServiceItem) => {
    const price = parseFloat(serviceItem.price?.toString()) || 0
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      description: serviceItem.name || serviceItem.title || '',
      quantity: 1,
      unitPrice: price,
      totalPrice: price,
      taxRate: 14,
      taxAmount: price * 0.14
    }
    setItems([...items, newItem])
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.totalPrice?.toString()) || 0), 0)
    const taxAmount = items.reduce((sum, item) => sum + (parseFloat(item.taxAmount?.toString()) || 0), 0)
    const totalAmount = subtotal + taxAmount
    
    return { subtotal, taxAmount, totalAmount }
  }

  const saveAsDraft = async () => {
    await saveInvoice('DRAFT')
  }

  const sendInvoice = async () => {
    await saveInvoice('SENT')
  }

  const createNewCustomer = async () => {
    if (!newCustomer.email || !newCustomer.name) {
      toast({
        title: 'خطأ',
        description: 'يرجى إدخال اسم العميل والبريد الإلكتروني',
        variant: 'destructive'
      })
      return
    }

    setIsCreatingCustomer(true)
    
    try {
      const response = await fetch('/api/crm/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newCustomer.name,
          email: newCustomer.email,
          phone: newCustomer.phone,
          segment: 'CUSTOMER',
          leadSource: 'OTHER'
        })
      })

      if (response.ok) {
        const customer = await response.json()
        setCustomers([...customers, customer])
        setSelectedCustomer(customer.id)
        setNewCustomer({ name: '', email: '', phone: '', company: '' })
        setShowNewCustomerForm(false)
        toast({
          title: 'نجاح',
          description: 'تم إنشاء العميل الجديد بنجاح'
        })
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create customer')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في إنشاء العميل',
        variant: 'destructive'
      })
    } finally {
      setIsCreatingCustomer(false)
    }
  }

  const saveInvoice = async (status: string) => {
    if (!selectedCustomer || items.length === 0) {
      toast({
        title: 'خطأ',
        description: 'يرجى تحديد العميل وإضافة بنود الفاتورة',
        variant: 'destructive'
      })
      return
    }

    setLoading(true)
    
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
        createdBy: 'admin', // This should come from the authenticated user
        status
      }

      const response = await fetch('/api/finance/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(invoiceData)
      })

      if (response.ok) {
        const invoiceResponse = await response.json()
        const invoiceId = invoiceResponse?.invoice?.id || invoiceResponse?.id

        if (!invoiceId) {
          throw new Error('لم يتم استلام معرف الفاتورة من الخادم')
        }

        toast({
          title: 'نجاح',
          description: status === 'DRAFT' ? 'تم حفظ الفاتورة كمسودة' : 'تم إنشاء وإرسال الفاتورة بنجاح'
        })

        // Redirect to invoice details
        window.location.href = `/admin/finance/invoices/${invoiceId}`
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create invoice')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: error instanceof Error ? error.message : 'فشل في إنشاء الفاتورة',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const { subtotal, taxAmount, totalAmount } = calculateTotals()

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
            <h1 className="text-3xl font-bold">إنشاء فاتورة جديدة</h1>
            <p className="text-gray-600 mt-2">إنشاء فاتورة جديدة للعميل</p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={saveAsDraft} disabled={loading}>
            <Save className="ml-2 h-4 w-4" />
            حفظ كمسودة
          </Button>
          <Button onClick={sendInvoice} disabled={loading}>
            <Send className="ml-2 h-4 w-4" />
            إنشاء وإرسال
          </Button>
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
                <div className="flex gap-2">
                  <Select value={selectedCustomer} onValueChange={setSelectedCustomer}>
                    <SelectTrigger className="flex-1">
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
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowNewCustomerForm(!showNewCustomerForm)}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              {/* New Customer Form */}
              {showNewCustomerForm && (
                <div className="border rounded-lg p-4 space-y-3 bg-blue-50">
                  <h4 className="font-medium text-blue-900">إنشاء عميل جديد</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <Label htmlFor="newCustomerName" className="text-sm">الاسم *</Label>
                      <Input
                        id="newCustomerName"
                        value={newCustomer.name}
                        onChange={(e) => setNewCustomer({...newCustomer, name: e.target.value})}
                        placeholder="اسم العميل"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newCustomerEmail" className="text-sm">البريد الإلكتروني *</Label>
                      <Input
                        id="newCustomerEmail"
                        type="email"
                        value={newCustomer.email}
                        onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                        placeholder="example@email.com"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newCustomerPhone" className="text-sm">رقم الهاتف</Label>
                      <Input
                        id="newCustomerPhone"
                        value={newCustomer.phone}
                        onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                        placeholder="+20 1xx xxx xxxx"
                        className="bg-white"
                      />
                    </div>
                    <div>
                      <Label htmlFor="newCustomerCompany" className="text-sm">الشركة</Label>
                      <Input
                        id="newCustomerCompany"
                        value={newCustomer.company}
                        onChange={(e) => setNewCustomer({...newCustomer, company: e.target.value})}
                        placeholder="اسم الشركة (اختياري)"
                        className="bg-white"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={createNewCustomer}
                      disabled={isCreatingCustomer}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      {isCreatingCustomer ? 'جاري الإنشاء...' : 'إنشاء العميل'}
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="outline"
                      onClick={() => {
                        setShowNewCustomerForm(false)
                        setNewCustomer({ name: '', email: '', phone: '', company: '' })
                      }}
                    >
                      إلغاء
                    </Button>
                  </div>
                </div>
              )}
              
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
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" onClick={addItem}>
                    <Plus className="ml-2 h-4 w-4" />
                    إضافة بند
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Quick Add Service Items */}
              {serviceItems.length > 0 && (
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
                          <p className="font-medium">{serviceItem.name || serviceItem.title}</p>
                          <p className="text-xs text-gray-500">
                            {serviceItem.price ? `${serviceItem.price} ج.م` : 'سعر عند الطلب'}
                          </p>
                        </div>
                      </Button>
                    ))}
                  </div>
                </div>
              )}

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

          {/* Status */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">الحالة</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">العملاء:</span>
                  <Badge variant="outline">{customers.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">البنود:</span>
                  <Badge variant="outline">{items.length}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">الضريبة:</span>
                  <Badge variant="outline">{taxRates.length} معدل</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}