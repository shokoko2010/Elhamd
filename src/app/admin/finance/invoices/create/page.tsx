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
import { Switch } from '@/components/ui/switch'
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
import { useAuth } from '@/hooks/use-auth'

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
  itemType: 'SERVICE' | 'PART' | 'VEHICLE'
  inventoryItemId?: string
  vehicleId?: string
  metadata?: Record<string, unknown>
}

interface TaxRate {
  id: string
  type: string
  rate: number
  description: string
  isActive: boolean
}

interface InventoryOption {
  id: string
  name: string
  partNumber: string
  quantity: number
  unitPrice: number
}

interface VehicleOption {
  id: string
  make: string
  model: string
  stockNumber: string
  price: number
  year: number
}

interface InstallmentForm {
  id: string
  amount: number
  dueDate: string
  notes?: string
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
  const [inventoryItems, setInventoryItems] = useState<InventoryOption[]>([])
  const [vehicleOptions, setVehicleOptions] = useState<VehicleOption[]>([])
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
  const [enableInstallments, setEnableInstallments] = useState(false)
  const [installments, setInstallments] = useState<InstallmentForm[]>([])
  const { toast } = useToast()
  const { user } = useAuth()

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

      // Fetch inventory items for spare parts
      const inventoryResponse = await fetch('/api/inventory/items?limit=200')
      if (inventoryResponse.ok) {
        const inventoryData = await inventoryResponse.json()
        const inventoryOptions: InventoryOption[] = (inventoryData.items || []).map((item: any) => ({
          id: item.id,
          name: item.name,
          partNumber: item.partNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice || 0,
        }))
        setInventoryItems(inventoryOptions)
      }

      // Fetch available vehicles
      const vehiclesResponse = await fetch('/api/admin/vehicles?status=AVAILABLE&limit=200')
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json()
        const vehicleOptions: VehicleOption[] = (vehiclesData.vehicles || []).map((vehicle: any) => ({
          id: vehicle.id,
          make: vehicle.make,
          model: vehicle.model,
          stockNumber: vehicle.stockNumber,
          price: vehicle.price || vehicle.pricing?.totalPrice || 0,
          year: vehicle.year,
        }))
        setVehicleOptions(vehicleOptions)
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
      taxAmount: 0,
      itemType: 'SERVICE',
      metadata: { itemType: 'SERVICE' },
    }
    setItems([...items, newItem])
  }

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id))
  }

  const updateItem = (id: string, field: keyof InvoiceItem, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updatedItem: InvoiceItem = { ...item, [field]: value }

        let quantity = parseFloat(updatedItem.quantity?.toString()) || 0
        const unitPrice = parseFloat(updatedItem.unitPrice?.toString()) || 0
        const taxRate = parseFloat(updatedItem.taxRate?.toString()) || 0

        if (updatedItem.itemType === 'VEHICLE') {
          quantity = 1
          updatedItem.quantity = 1
        }

        if (updatedItem.itemType === 'PART' && updatedItem.inventoryItemId) {
          const option = inventoryItems.find((inventory) => inventory.id === updatedItem.inventoryItemId)
          if (option) {
            const maxQty = Math.max(1, option.quantity)
            quantity = Math.min(Math.max(quantity, 1), maxQty)
            updatedItem.quantity = quantity
          }
        }

        if (field === 'quantity' || field === 'unitPrice' || field === 'taxRate') {
          updatedItem.totalPrice = quantity * unitPrice
          updatedItem.taxAmount = updatedItem.totalPrice * (taxRate / 100)
        }

        updatedItem.metadata = {
          ...(updatedItem.metadata || {}),
          itemType: updatedItem.itemType,
          inventoryItemId: updatedItem.inventoryItemId,
          vehicleId: updatedItem.vehicleId,
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
      taxAmount: price * 0.14,
      itemType: 'SERVICE',
      metadata: {
        itemType: 'SERVICE',
        serviceId: serviceItem.id,
      },
    }
    setItems([...items, newItem])
  }

  const handleItemTypeChange = (id: string, nextType: InvoiceItem['itemType']) => {
    setItems(items.map(item => {
      if (item.id !== id) {
        return item
      }

      const updated: InvoiceItem = {
        ...item,
        itemType: nextType,
        metadata: {
          ...(item.metadata || {}),
          itemType: nextType,
        },
      }

      if (nextType === 'SERVICE') {
        updated.inventoryItemId = undefined
        updated.vehicleId = undefined
      }

      if (nextType === 'PART') {
        updated.quantity = Math.max(1, Math.round(item.quantity) || 1)
        updated.unitPrice = 0
        updated.totalPrice = 0
        updated.taxAmount = 0
        updated.inventoryItemId = undefined
        updated.vehicleId = undefined
      }

      if (nextType === 'VEHICLE') {
        updated.quantity = 1
        updated.unitPrice = 0
        updated.totalPrice = 0
        updated.taxAmount = 0
        updated.vehicleId = undefined
        updated.inventoryItemId = undefined
      }

      return updated
    }))
  }

  const handleInventorySelection = (id: string, inventoryId: string) => {
    const inventoryOption = inventoryItems.find(option => option.id === inventoryId)
    setItems(items.map(item => {
      if (item.id !== id) {
        return item
      }

      const safeQuantity = inventoryOption ? Math.min(Math.max(item.quantity, 1), Math.max(1, inventoryOption.quantity)) : Math.max(1, item.quantity)
      const unitPrice = inventoryOption?.unitPrice ?? item.unitPrice

      return {
        ...item,
        itemType: 'PART',
        inventoryItemId: inventoryId,
        vehicleId: undefined,
        description: inventoryOption ? `${inventoryOption.name} (${inventoryOption.partNumber})` : item.description,
        quantity: safeQuantity,
        unitPrice,
        totalPrice: unitPrice * safeQuantity,
        taxAmount: (unitPrice * safeQuantity) * ((item.taxRate || 0) / 100),
        metadata: {
          ...(item.metadata || {}),
          itemType: 'PART',
          inventoryItemId: inventoryId,
          vehicleId: undefined,
          sourceName: inventoryOption?.name,
          partNumber: inventoryOption?.partNumber,
        },
      }
    }))
  }

  const handleVehicleSelection = (id: string, vehicleId: string) => {
    const vehicleOption = vehicleOptions.find(option => option.id === vehicleId)
    setItems(items.map(item => {
      if (item.id !== id) {
        return item
      }

      const unitPrice = vehicleOption?.price ?? item.unitPrice

      return {
        ...item,
        itemType: 'VEHICLE',
        vehicleId,
        inventoryItemId: undefined,
        quantity: 1,
        unitPrice,
        totalPrice: unitPrice,
        taxAmount: unitPrice * ((item.taxRate || 0) / 100),
        description: vehicleOption ? `${vehicleOption.make} ${vehicleOption.model} (${vehicleOption.stockNumber})` : item.description,
        metadata: {
          ...(item.metadata || {}),
          itemType: 'VEHICLE',
          vehicleId,
          inventoryItemId: undefined,
          stockNumber: vehicleOption?.stockNumber,
          make: vehicleOption?.make,
          model: vehicleOption?.model,
        },
      }
    }))
  }

  const calculateTotals = () => {
    const subtotal = items.reduce((sum, item) => sum + (parseFloat(item.totalPrice?.toString()) || 0), 0)
    const taxAmount = items.reduce((sum, item) => sum + (parseFloat(item.taxAmount?.toString()) || 0), 0)
    const totalAmount = subtotal + taxAmount

    return { subtotal, taxAmount, totalAmount }
  }

  const createInstallmentId = () => {
    if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
      return `temp-${crypto.randomUUID()}`
    }
    return `temp-${Math.random().toString(36).slice(2, 10)}`
  }

  const addInstallmentEntry = () => {
    const { totalAmount } = calculateTotals()
    const scheduled = installments.reduce((sum, entry) => sum + (Number.isFinite(entry.amount) ? entry.amount : 0), 0)
    const remaining = Math.max(totalAmount - scheduled, 0)

    const baseAmount = remaining > 0
      ? Number(remaining.toFixed(2))
      : Number((totalAmount / Math.max(installments.length + 1, 1)).toFixed(2))

    const baseDate = new Date(dueDate || issueDate || new Date().toISOString().split('T')[0])
    baseDate.setMonth(baseDate.getMonth() + installments.length + 1)

    setInstallments((prev) => [
      ...prev,
      {
        id: createInstallmentId(),
        amount: Number.isFinite(baseAmount) ? baseAmount : 0,
        dueDate: baseDate.toISOString().split('T')[0],
        notes: '',
      },
    ])
  }

  const removeInstallmentEntry = (installmentId: string) => {
    setInstallments(prev => prev.filter(installment => installment.id !== installmentId))
  }

  const updateInstallmentEntry = (
    installmentId: string,
    field: 'amount' | 'dueDate' | 'notes',
    value: string
  ) => {
    setInstallments(prev => prev.map(installment => {
      if (installment.id !== installmentId) {
        return installment
      }

      if (field === 'amount') {
        const parsed = parseFloat(value)
        return {
          ...installment,
          amount: Number.isFinite(parsed) ? Number(parsed.toFixed(2)) : 0,
        }
      }

      if (field === 'dueDate') {
        return {
          ...installment,
          dueDate: value,
        }
      }

      return {
        ...installment,
        notes: value,
      }
    }))
  }

  const handleInstallmentToggle = (checked: boolean) => {
    setEnableInstallments(checked)
    if (checked) {
      if (installments.length === 0) {
        addInstallmentEntry()
      }
    } else {
      setInstallments([])
    }
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
      
      const derivedInvoiceType = items.some(item => item.itemType === 'VEHICLE') ? 'PRODUCT' : invoiceType

      const installmentsPayload = enableInstallments
        ? installments
            .filter((installment) => installment.amount > 0 && installment.dueDate)
            .map((installment, index) => ({
              id: installment.id.startsWith('temp-') ? undefined : installment.id,
              amount: Number(installment.amount.toFixed(2)),
              dueDate: installment.dueDate,
              sequence: index + 1,
              notes: installment.notes && installment.notes.trim().length > 0 ? installment.notes.trim() : undefined,
            }))
        : []

      const invoiceData: any = {
        customerId: selectedCustomer,
        type: derivedInvoiceType,
        items: items.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          taxRate: item.taxRate,
          metadata: {
            itemType: item.itemType,
            inventoryItemId: item.inventoryItemId,
            vehicleId: item.vehicleId,
          }
        })),
        issueDate,
        dueDate,
        notes,
        terms,
        status
      }

      if (enableInstallments && installmentsPayload.length > 0) {
        const scheduledTotal = installmentsPayload.reduce((sum: number, installment: any) => sum + installment.amount, 0)

        if (Math.abs(scheduledTotal - totalAmount) > 0.5) {
          setLoading(false)
          toast({
            title: 'تنبيه',
            description: 'مجموع الأقساط لا يساوي إجمالي الفاتورة. يرجى تعديل المبالغ قبل الحفظ.',
            variant: 'destructive'
          })
          return
        }

        invoiceData.installments = installmentsPayload
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
  const totalInstallmentAmount = installments.reduce((sum, installment) => sum + (Number.isFinite(installment.amount) ? installment.amount : 0), 0)
  const installmentDifference = totalInstallmentAmount - totalAmount
  const hasInstallmentMismatch = enableInstallments && Math.abs(installmentDifference) > 0.5

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
                {items.map((item, index) => {
                  const inventoryOption = item.inventoryItemId
                    ? inventoryItems.find((option) => option.id === item.inventoryItemId)
                    : undefined
                  const vehicleOption = item.vehicleId
                    ? vehicleOptions.find((option) => option.id === item.vehicleId)
                    : undefined

                  return (
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

                      <div className="space-y-3">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <div>
                            <Label className="text-sm">نوع البند</Label>
                            <Select
                              value={item.itemType}
                              onValueChange={(value) =>
                                handleItemTypeChange(item.id, value as InvoiceItem['itemType'])
                              }
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="SERVICE">خدمة</SelectItem>
                                <SelectItem value="PART">قطعة غيار</SelectItem>
                                <SelectItem value="VEHICLE">مركبة</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>

                          {item.itemType === 'PART' && (
                            <div className="md:col-span-2">
                              <Label className="text-sm">اختر الصنف من المخزون</Label>
                              <Select
                                value={item.inventoryItemId || ''}
                                onValueChange={(value) => handleInventorySelection(item.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر صنف المخزون" />
                                </SelectTrigger>
                                <SelectContent>
                                  {inventoryItems.map((option) => (
                                    <SelectItem
                                      key={option.id}
                                      value={option.id}
                                      disabled={option.quantity <= 0}
                                    >
                                      {option.name} ({option.partNumber}) - المتوفر: {option.quantity}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {inventoryOption && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  المتوفر: {inventoryOption.quantity} قطعة
                                </p>
                              )}
                            </div>
                          )}

                          {item.itemType === 'VEHICLE' && (
                            <div className="md:col-span-2">
                              <Label className="text-sm">اختر المركبة</Label>
                              <Select
                                value={item.vehicleId || ''}
                                onValueChange={(value) => handleVehicleSelection(item.id, value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر المركبة" />
                                </SelectTrigger>
                                <SelectContent>
                                  {vehicleOptions.map((option) => (
                                    <SelectItem key={option.id} value={option.id}>
                                      {option.make} {option.model} ({option.stockNumber}) - {option.price.toLocaleString()} ج.م
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              {vehicleOption && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  رقم المخزون: {vehicleOption.stockNumber} • سنة الصنع: {vehicleOption.year}
                                </p>
                              )}
                            </div>
                          )}
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
                                disabled={item.itemType === 'VEHICLE'}
                              />
                              {item.itemType === 'PART' && item.inventoryItemId && (
                                <p className="text-xs text-muted-foreground mt-1">
                                  سيتم خصم الكمية المحددة من المخزون عند تأكيد الفاتورة
                                </p>
                              )}
                            </div>

                            <div>
                              <Label className="text-sm">السعر</Label>
                              <Input
                                type="number"
                                value={item.unitPrice}
                                onChange={(e) => updateItem(item.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                                min="0"
                                step="0.01"
                                disabled={item.itemType === 'VEHICLE' && !!item.vehicleId}
                              />
                            </div>
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
                  )
                })}
                
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

          {/* Installment Plan */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">خطة التقسيط</CardTitle>
                <Switch checked={enableInstallments} onCheckedChange={handleInstallmentToggle} />
              </div>
              <CardDescription>
                وزع قيمة الفاتورة على دفعات مجدولة يتم تتبعها تلقائياً.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {enableInstallments ? (
                <div className="space-y-3">
                  {installments.map((installment, index) => (
                    <div key={installment.id} className="rounded-lg border p-3 space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">القسط #{index + 1}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeInstallmentEntry(installment.id)}
                          className="text-red-500 hover:text-red-600"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="grid grid-cols-1 gap-3">
                        <div>
                          <Label className="text-xs text-gray-600">تاريخ الاستحقاق</Label>
                          <Input
                            type="date"
                            value={installment.dueDate}
                            onChange={(event) => updateInstallmentEntry(installment.id, 'dueDate', event.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">المبلغ</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.01"
                            value={installment.amount.toString()}
                            onChange={(event) => updateInstallmentEntry(installment.id, 'amount', event.target.value)}
                          />
                        </div>
                        <div>
                          <Label className="text-xs text-gray-600">ملاحظات (اختياري)</Label>
                          <Input
                            value={installment.notes ?? ''}
                            onChange={(event) => updateInstallmentEntry(installment.id, 'notes', event.target.value)}
                            placeholder="مثال: دفعة مقدّم"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex items-center justify-between rounded bg-gray-50 p-3 text-sm">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">إجمالي الأقساط</span>
                        <Badge variant={hasInstallmentMismatch ? 'secondary' : 'outline'}>
                          {totalInstallmentAmount.toFixed(2)} ج.م
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-500 mt-1">
                        الفرق عن الإجمالي: {installmentDifference >= 0 ? '+' : ''}{installmentDifference.toFixed(2)} ج.م
                      </div>
                    </div>
                    <Button variant="outline" size="sm" onClick={addInstallmentEntry}>
                      <Plus className="ml-2 h-4 w-4" />
                      إضافة قسط
                    </Button>
                  </div>

                  {hasInstallmentMismatch && (
                    <p className="text-xs text-amber-600">
                      مجموع الأقساط لا يساوي إجمالي الفاتورة. يرجى تعديل المبالغ لضمان صحة البيانات.
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  فعّل خيار التقسيط لتحديد مواعيد وقيم الدفعات الخاصة بالفاتورة.
                </p>
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