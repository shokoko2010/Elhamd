'use client'

import { useState, useEffect, useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import {
  User,
  Calendar,
  DollarSign,
  Award,
  Phone,
  Mail,
  MapPin,
  Building,
  Clock,
  FileText,
  Settings,
  Bell,
  LogOut,
  Car,
  Package,
  Plus,
  Trash2
} from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { useAuth } from '@/hooks/use-auth'
import { signOut } from 'next-auth/react'
import { useToast } from '@/hooks/use-toast'

interface EmployeeProfile {
  id: string
  employeeNumber: string
  user: {
    id: string
    name: string
    email: string
    phone?: string
    avatar?: string | null
  }
  department: string
  position: string
  hireDate: string
  salary: number
  status: 'ACTIVE' | 'INACTIVE' | 'ON_LEAVE' | 'TERMINATED' | 'SUSPENDED'
  branch?: {
    id: string
    name: string
  }
  emergencyContact?: {
    name: string
    phone: string
    relationship: string
  }
  notes?: string
}

interface LeaveRequest {
  id: string
  leaveType: 'ANNUAL' | 'SICK' | 'MATERNITY' | 'PATERNITY' | 'UNPAID' | 'EMERGENCY' | 'STUDY'
  startDate: string
  endDate: string
  totalDays: number
  reason?: string
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'COMPLETED'
  createdAt: string
}

interface PayrollRecord {
  id: string
  period: string
  basicSalary: number
  allowances: number
  deductions: number
  overtime: number
  bonus: number
  netSalary: number
  payDate?: string
  status: 'PENDING' | 'PROCESSED' | 'APPROVED' | 'PAID' | 'CANCELLED'
}

interface EmployeeInvoiceItem {
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface EmployeeInvoice {
  id: string
  orderId?: string
  customerName: string
  customerEmail: string
  subtotal: number
  tax: number
  total: number
  status: string
  issueDate: string
  dueDate: string
  paidDate?: string
  items: EmployeeInvoiceItem[]
}

interface VehicleInventoryItem {
  id: string
  make: string
  model: string
  year: number
  price: number
  type: string
  status: string
  mileage?: number | null
  fuelType?: string | null
  transmission?: string | null
  description?: string
  images?: string[]
  features?: string[]
  stockNumber?: string
  vin?: string | null
  category?: string
  color?: string | null
}

interface PartInventoryItem {
  id: string
  name: string
  partNumber: string
  category: string
  quantity: number
  unitPrice: number
  status: string
  supplier: string
  location: string
  warehouse: string
  minStockLevel: number
  maxStockLevel: number
  leadTime: number
  updatedAt: string
}

type InvoiceDraftSource = 'CUSTOM' | 'PART' | 'VEHICLE'

interface InvoiceDraftItem extends EmployeeInvoiceItem {
  id: string
  sourceType: InvoiceDraftSource
  sourceId?: string
}

const getDefaultDueDate = () => {
  const dueDate = new Date()
  dueDate.setDate(dueDate.getDate() + 7)
  return dueDate.toISOString().split('T')[0]
}

export default function EmployeeDashboard() {
  const {
    user,
    canViewInventory,
    canManageInventory,
    canViewFinancials,
    canViewFinancialOverview,
    canViewInvoices,
    canCreateInvoices,
    canManagePayments
  } = useAuth()
  const { toast } = useToast()
  const [employeeProfile, setEmployeeProfile] = useState<EmployeeProfile | null>(null)
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([])
  const [payrollRecords, setPayrollRecords] = useState<PayrollRecord[]>([])
  const [invoices, setInvoices] = useState<EmployeeInvoice[]>([])
  const [carsInventory, setCarsInventory] = useState<VehicleInventoryItem[]>([])
  const [partsInventory, setPartsInventory] = useState<PartInventoryItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false)
  const [isLeaveRequestOpen, setIsLeaveRequestOpen] = useState(false)
  const [isInvoiceDialogOpen, setIsInvoiceDialogOpen] = useState(false)
  const [invoiceSubmitting, setInvoiceSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    phone: '',
    emergencyContactName: '',
    emergencyContactPhone: '',
    emergencyContactRelationship: '',
    notes: ''
  })
  const [leaveFormData, setLeaveFormData] = useState({
    leaveType: '',
    startDate: '',
    endDate: '',
    reason: ''
  })
  const [invoiceForm, setInvoiceForm] = useState({
    customerName: '',
    customerEmail: '',
    orderId: '',
    taxRate: '14',
    dueDate: getDefaultDueDate()
  })
  const [invoiceItems, setInvoiceItems] = useState<InvoiceDraftItem[]>([])
  const [newItemType, setNewItemType] = useState<InvoiceDraftSource>('CUSTOM')
  const [newItemSelection, setNewItemSelection] = useState('')
  const [newItemDescription, setNewItemDescription] = useState('')
  const [newItemQuantity, setNewItemQuantity] = useState(1)
  const [newItemUnitPrice, setNewItemUnitPrice] = useState(0)

  const inventoryAccess = canViewInventory() || canManageInventory()
  const invoiceViewAccess = canViewInvoices()
  const invoiceCreateAccess = canCreateInvoices()
  const invoiceManagePaymentsAccess = canManagePayments()
  const allowInvoiceTab = invoiceViewAccess || invoiceCreateAccess || invoiceManagePaymentsAccess
  const allowInvoiceCreation = invoiceCreateAccess
  const allowInvoiceListing = invoiceViewAccess || invoiceManagePaymentsAccess
  const payrollAccess = canViewFinancials() || canViewFinancialOverview()
  const allowInventoryTab = inventoryAccess
  const shouldLoadInventoryData = allowInventoryTab || allowInvoiceCreation

  const tabs = useMemo(
    () => [
      { value: 'profile', label: 'الملف الشخصي', show: true },
      { value: 'leaves', label: 'الإجازات', show: true },
      { value: 'payroll', label: 'الرواتب', show: payrollAccess },
      { value: 'invoices', label: 'الفواتير', show: allowInvoiceTab },
      { value: 'inventory', label: 'المخزون', show: allowInventoryTab },
      { value: 'documents', label: 'المستندات', show: true }
    ],
    [allowInventoryTab, allowInvoiceTab, payrollAccess]
  )

  const createItemId = () =>
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2)

  const invoiceSubtotal = invoiceItems.reduce((sum, item) => sum + item.totalPrice, 0)
  const taxRate = Number(invoiceForm.taxRate) || 0
  const invoiceTaxAmount = invoiceSubtotal * (taxRate / 100)
  const invoiceTotal = invoiceSubtotal + invoiceTaxAmount

  useEffect(() => {
    if (!tabs.some((tab) => tab.value === activeTab && tab.show)) {
      const firstVisible = tabs.find((tab) => tab.show)
      if (firstVisible && firstVisible.value !== activeTab) {
        setActiveTab(firstVisible.value)
      }
    }
  }, [tabs, activeTab])

  const handleLogout = () => {
    void signOut({ callbackUrl: '/login' })
  }

  useEffect(() => {
    if (user) {
      void fetchEmployeeData(true)
    }
  }, [user, payrollAccess, allowInvoiceListing, shouldLoadInventoryData])

  const fetchEmployeeData = async (showSpinner = false) => {
    try {
      if (showSpinner) {
        setLoading(true)
      }

      const profileRes = await fetch('/api/employee/profile')

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setEmployeeProfile(profileData)
        setFormData({
          phone: profileData.user.phone || '',
          emergencyContactName: profileData.emergencyContact?.name || '',
          emergencyContactPhone: profileData.emergencyContact?.phone || '',
          emergencyContactRelationship: profileData.emergencyContact?.relationship || '',
          notes: profileData.notes || ''
        })
      } else {
        setEmployeeProfile(null)
      }

      const leavesRes = await fetch('/api/employee/leave-requests')
      if (leavesRes.ok) {
        const leavesData = await leavesRes.json()
        setLeaveRequests(leavesData)
      } else {
        setLeaveRequests([])
      }

      if (payrollAccess) {
        const payrollRes = await fetch('/api/employee/payroll')
        if (payrollRes.ok) {
          const payrollData = await payrollRes.json()
          setPayrollRecords(payrollData)
        } else {
          setPayrollRecords([])
        }
      } else {
        setPayrollRecords([])
      }

      if (allowInvoiceListing) {
        const invoicesRes = await fetch('/api/employee/invoices')
        if (invoicesRes.ok) {
          const invoicesData = await invoicesRes.json()
          setInvoices(Array.isArray(invoicesData) ? invoicesData : [])
        } else {
          setInvoices([])
        }
      } else {
        setInvoices([])
      }

      if (shouldLoadInventoryData) {
        const [carsRes, partsRes] = await Promise.all([
          fetch('/api/employee/cars?limit=100&status=AVAILABLE'),
          fetch('/api/employee/inventory/parts?limit=100')
        ])

        if (carsRes.ok) {
          const carsData = await carsRes.json()
          setCarsInventory(Array.isArray(carsData) ? carsData : [])
        } else {
          setCarsInventory([])
        }

        if (partsRes.ok) {
          const partsData = await partsRes.json()
          setPartsInventory(Array.isArray(partsData?.items) ? partsData.items : [])
        } else {
          setPartsInventory([])
        }
      } else {
        setCarsInventory([])
        setPartsInventory([])
      }
    } catch (error) {
      console.error('Error fetching employee data:', error)
    } finally {
      if (showSpinner) {
        setLoading(false)
      }
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE':
      case 'APPROVED':
      case 'PAID':
      case 'COMPLETED':
      case 'IN_STOCK':
      case 'AVAILABLE':
        return 'bg-green-100 text-green-800'
      case 'PENDING':
      case 'PROCESSED':
      case 'MAINTENANCE':
        return 'bg-yellow-100 text-yellow-800'
      case 'INACTIVE':
      case 'REJECTED':
      case 'CANCELLED':
      case 'OUT_OF_STOCK':
      case 'SOLD':
        return 'bg-red-100 text-red-800'
      case 'ON_LEAVE':
      case 'SUSPENDED':
      case 'RESERVED':
        return 'bg-blue-100 text-blue-800'
      case 'TERMINATED':
        return 'bg-gray-100 text-gray-800'
      case 'LOW_STOCK':
        return 'bg-orange-100 text-orange-800'
      case 'DRAFT':
        return 'bg-gray-100 text-gray-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'نشط'
      case 'INACTIVE': return 'غير نشط'
      case 'ON_LEAVE': return 'في إجازة'
      case 'TERMINATED': return 'منتهي الخدمة'
      case 'SUSPENDED': return 'موقوف'
      case 'PENDING': return 'قيد الانتظار'
      case 'APPROVED': return 'موافق عليه'
      case 'REJECTED': return 'مرفوض'
      case 'CANCELLED': return 'ملغي'
      case 'COMPLETED': return 'مكتمل'
      case 'PROCESSED': return 'تمت معالجته'
      case 'PAID': return 'مدفوع'
      case 'DRAFT': return 'مسودة'
      case 'IN_STOCK': return 'متوفر'
      case 'LOW_STOCK': return 'مخزون منخفض'
      case 'OUT_OF_STOCK': return 'غير متوفر'
      case 'OVERDUE': return 'متأخر'
      case 'AVAILABLE': return 'متاح'
      case 'SOLD': return 'مباع'
      case 'RESERVED': return 'محجوز'
      case 'MAINTENANCE': return 'قيد الصيانة'
      default: return status
    }
  }

  const getLeaveTypeText = (type: string) => {
    switch (type) {
      case 'ANNUAL': return 'سنوية'
      case 'SICK': return 'مرضية'
      case 'MATERNITY': return 'ولادة'
      case 'PATERNITY': return 'أبوة'
      case 'UNPAID': return 'بدون راتب'
      case 'EMERGENCY': return 'طارئة'
      case 'STUDY': return 'دراسية'
      default: return type
    }
  }

  const handleUpdateProfile = async () => {
    try {
      const response = await fetch('/api/employee/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        void fetchEmployeeData()
        setIsEditProfileOpen(false)
      }
    } catch (error) {
      console.error('Error updating profile:', error)
    }
  }

  const handleLeaveRequest = async () => {
    try {
      const response = await fetch('/api/employee/leave-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(leaveFormData),
      })

      if (response.ok) {
        void fetchEmployeeData()
        setIsLeaveRequestOpen(false)
        setLeaveFormData({
          leaveType: '',
          startDate: '',
          endDate: '',
          reason: ''
        })
      }
    } catch (error) {
      console.error('Error creating leave request:', error)
    }
  }

  const resetInvoiceForm = () => {
    setInvoiceForm({
      customerName: '',
      customerEmail: '',
      orderId: '',
      taxRate: '14',
      dueDate: getDefaultDueDate()
    })
    setInvoiceItems([])
    setNewItemType('CUSTOM')
    setNewItemSelection('')
    setNewItemDescription('')
    setNewItemQuantity(1)
    setNewItemUnitPrice(0)
    setInvoiceSubmitting(false)
  }

  const handleInvoiceDialogChange = (open: boolean) => {
    setIsInvoiceDialogOpen(open)
    if (!open) {
      resetInvoiceForm()
    }
  }

  const handleNewItemTypeChange = (value: InvoiceDraftSource) => {
    setNewItemType(value)
    setNewItemSelection('')
    setNewItemDescription('')
    setNewItemQuantity(1)
    setNewItemUnitPrice(0)
  }

  const handleNewItemSelection = (value: string) => {
    setNewItemSelection(value)

    if (newItemType === 'PART') {
      const selectedPart = partsInventory.find((part) => part.id === value)
      if (selectedPart) {
        setNewItemDescription(`${selectedPart.name} (${selectedPart.partNumber})`)
        setNewItemUnitPrice(selectedPart.unitPrice)
        if (newItemQuantity <= 0) {
          setNewItemQuantity(1)
        }
      }
    } else if (newItemType === 'VEHICLE') {
      const selectedCar = carsInventory.find((car) => car.id === value)
      if (selectedCar) {
        setNewItemDescription(`${selectedCar.make} ${selectedCar.model} ${selectedCar.year}`)
        setNewItemUnitPrice(selectedCar.price)
        setNewItemQuantity(1)
      }
    }
  }

  const handleInvoiceItemChange = (id: string, field: 'quantity' | 'unitPrice', value: number) => {
    const safeValue = Number.isFinite(value) ? value : 0
    const normalizedValue = field === 'quantity' ? Math.max(1, Math.floor(safeValue || 0)) : Math.max(0, safeValue)

    setInvoiceItems((items) =>
      items.map((item) => {
        if (item.id !== id) {
          return item
        }

        const updatedQuantity = field === 'quantity' ? normalizedValue : item.quantity
        const updatedUnitPrice = field === 'unitPrice' ? normalizedValue : item.unitPrice

        return {
          ...item,
          quantity: updatedQuantity,
          unitPrice: updatedUnitPrice,
          totalPrice: updatedQuantity * updatedUnitPrice
        }
      })
    )
  }

  const handleRemoveInvoiceItem = (id: string) => {
    setInvoiceItems((items) => items.filter((item) => item.id !== id))
  }

  const handleAddInvoiceItem = () => {
    let description = newItemDescription.trim()
    let unitPrice = Number.isFinite(newItemUnitPrice) ? newItemUnitPrice : 0
    let sourceId: string | undefined

    if (newItemType === 'PART') {
      if (!newItemSelection) {
        toast({
          title: 'حدد قطعة الغيار',
          description: 'يرجى اختيار قطعة الغيار التي ترغب في إضافتها.',
          variant: 'destructive'
        })
        return
      }

      const selectedPart = partsInventory.find((part) => part.id === newItemSelection)
      if (!selectedPart) {
        toast({
          title: 'العنصر غير متوفر',
          description: 'لم يتم العثور على قطعة الغيار المختارة في المخزون.',
          variant: 'destructive'
        })
        return
      }

      description = `${selectedPart.name} (${selectedPart.partNumber})`
      unitPrice = selectedPart.unitPrice
      sourceId = selectedPart.id
    } else if (newItemType === 'VEHICLE') {
      if (!newItemSelection) {
        toast({
          title: 'حدد المركبة',
          description: 'يرجى اختيار المركبة التي ترغب في إضافتها إلى الفاتورة.',
          variant: 'destructive'
        })
        return
      }

      const selectedCar = carsInventory.find((car) => car.id === newItemSelection)
      if (!selectedCar) {
        toast({
          title: 'المركبة غير متاحة',
          description: 'المركبة المختارة غير متوفرة حالياً في المخزون.',
          variant: 'destructive'
        })
        return
      }

      description = `${selectedCar.make} ${selectedCar.model} ${selectedCar.year}`
      unitPrice = selectedCar.price
      sourceId = selectedCar.id
    } else {
      if (!description) {
        toast({
          title: 'أدخل وصف العنصر',
          description: 'يجب إدخال وصف واضح للعنصر أو الخدمة.',
          variant: 'destructive'
        })
        return
      }

      if (unitPrice <= 0) {
        toast({
          title: 'السعر غير صالح',
          description: 'يرجى إدخال سعر أكبر من صفر.',
          variant: 'destructive'
        })
        return
      }
    }

    const quantityBase = Number.isFinite(newItemQuantity) ? newItemQuantity : 1
    const quantity = Math.max(1, Math.floor(quantityBase))
    const id = createItemId()

    setInvoiceItems((items) => [
      ...items,
      {
        id,
        description,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        sourceType: newItemType,
        sourceId
      }
    ])

    if (newItemType === 'CUSTOM') {
      setNewItemDescription('')
      setNewItemUnitPrice(0)
    }

    setNewItemSelection('')
    setNewItemQuantity(1)
  }

  const handleCreateInvoice = async () => {
    if (!invoiceForm.customerName.trim() || !invoiceForm.customerEmail.trim()) {
      toast({
        title: 'بيانات العميل مطلوبة',
        description: 'يرجى إدخال اسم العميل وبريده الإلكتروني قبل إنشاء الفاتورة.',
        variant: 'destructive'
      })
      return
    }

    if (!invoiceForm.dueDate) {
      toast({
        title: 'تاريخ الاستحقاق مطلوب',
        description: 'يرجى تحديد تاريخ استحقاق الفاتورة.',
        variant: 'destructive'
      })
      return
    }

    if (invoiceItems.length === 0) {
      toast({
        title: 'أضف عناصر الفاتورة',
        description: 'يجب إضافة عنصر واحد على الأقل قبل حفظ الفاتورة.',
        variant: 'destructive'
      })
      return
    }

    const normalizedItems = invoiceItems.map((item) => ({
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.quantity * item.unitPrice
    }))

    const payload: Record<string, unknown> = {
      customerName: invoiceForm.customerName.trim(),
      customerEmail: invoiceForm.customerEmail.trim(),
      items: normalizedItems,
      tax: Math.max(0, Number(invoiceForm.taxRate) || 0),
      dueDate: invoiceForm.dueDate
    }

    if (invoiceForm.orderId.trim()) {
      payload.orderId = invoiceForm.orderId.trim()
    }

    try {
      setInvoiceSubmitting(true)
      const response = await fetch('/api/employee/invoices', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const error = await response.json().catch(() => ({ error: 'فشل إنشاء الفاتورة' }))
        toast({
          title: 'تعذر إنشاء الفاتورة',
          description: error?.error || 'حدث خطأ غير متوقع أثناء حفظ الفاتورة.',
          variant: 'destructive'
        })
        return
      }

      toast({
        title: 'تم إنشاء الفاتورة',
        description: 'تم حفظ الفاتورة بنجاح ويمكنك متابعتها من القائمة.',
        variant: 'default'
      })

      resetInvoiceForm()
      setIsInvoiceDialogOpen(false)
      await fetchEmployeeData()
    } catch (error) {
      console.error('Error creating invoice:', error)
      toast({
        title: 'تعذر إنشاء الفاتورة',
        description: 'حدث خطأ أثناء إنشاء الفاتورة. حاول مرة أخرى.',
        variant: 'destructive'
      })
    } finally {
      setInvoiceSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!employeeProfile) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <h3 className="text-lg font-semibold mb-2">بيانات الموظف غير متاحة</h3>
          <p className="text-gray-600">لا يمكن العثور على بيانات الموظف</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">لوحة تحكم الموظف</h1>
          <p className="text-muted-foreground">مرحباً {employeeProfile.user.name}</p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4 ml-2" />
            الإشعارات
          </Button>
          <Button variant="outline" size="sm">
            <Settings className="h-4 w-4 ml-2" />
            الإعدادات
          </Button>
          <Button variant="destructive" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 ml-2" />
            تسجيل الخروج
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الراتب الأساسي</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Intl.NumberFormat('ar-EG', {
                style: 'currency',
                currency: 'EGP'
              }).format(employeeProfile.salary)}
            </div>
            <p className="text-xs text-muted-foreground">
              شهرياً
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحالة الوظيفية</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge className={getStatusColor(employeeProfile.status)}>
              {getStatusText(employeeProfile.status)}
            </Badge>
            <p className="text-xs text-muted-foreground mt-2">
              منذ {format(new Date(employeeProfile.hireDate), 'dd/MM/yyyy', { locale: ar })}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الإجازات المعلقة</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {leaveRequests.filter(l => l.status === 'PENDING').length}
            </div>
            <p className="text-xs text-muted-foreground">
              تحتاج موافقة
            </p>
          </CardContent>
        </Card>

        {payrollAccess && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الراتب الصافي</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {new Intl.NumberFormat('ar-EG', {
                  style: 'currency',
                  currency: 'EGP'
                }).format(payrollRecords[0]?.netSalary || employeeProfile.salary)}
              </div>
              <p className="text-xs text-muted-foreground">
                للشهر الحالي
              </p>
            </CardContent>
          </Card>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          {tabs.filter((tab) => tab.show).map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>الملف الشخصي</CardTitle>
                  <CardDescription>معلوماتك الشخصية والوظيفية</CardDescription>
                </div>
                <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline">
                      <Settings className="h-4 w-4 ml-2" />
                      تعديل الملف
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>تعديل الملف الشخصي</DialogTitle>
                      <DialogDescription>
                        قم بتحديث بياناتك الشخصية
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                          placeholder="أدخل رقم الهاتف"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactName">اسم الطوارئ</Label>
                        <Input
                          id="emergencyContactName"
                          value={formData.emergencyContactName}
                          onChange={(e) => setFormData({ ...formData, emergencyContactName: e.target.value })}
                          placeholder="اسم جهة الاتصال للطوارئ"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactPhone">هاتف الطوارئ</Label>
                        <Input
                          id="emergencyContactPhone"
                          value={formData.emergencyContactPhone}
                          onChange={(e) => setFormData({ ...formData, emergencyContactPhone: e.target.value })}
                          placeholder="رقم هاتف الطوارئ"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="emergencyContactRelationship">صلة القرابة</Label>
                        <Input
                          id="emergencyContactRelationship"
                          value={formData.emergencyContactRelationship}
                          onChange={(e) => setFormData({ ...formData, emergencyContactRelationship: e.target.value })}
                          placeholder="صلة القرابة"
                        />
                      </div>
                      <div className="space-y-2 col-span-2">
                        <Label htmlFor="notes">ملاحظات</Label>
                        <Textarea
                          id="notes"
                          value={formData.notes}
                          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                          placeholder="أي ملاحظات إضافية"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsEditProfileOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleUpdateProfile}>
                        حفظ التغييرات
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-4 mb-6">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={employeeProfile.user.avatar} />
                  <AvatarFallback className="text-lg">
                    {employeeProfile.user.name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-xl font-semibold">{employeeProfile.user.name}</h3>
                  <p className="text-muted-foreground">{employeeProfile.position}</p>
                  <Badge variant="outline" className="mt-1">{employeeProfile.department}</Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <User className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">الرقم الوظيفي</p>
                      <p className="text-sm text-muted-foreground">{employeeProfile.employeeNumber}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">البريد الإلكتروني</p>
                      <p className="text-sm text-muted-foreground">{employeeProfile.user.email}</p>
                    </div>
                  </div>
                  {employeeProfile.user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">رقم الهاتف</p>
                        <p className="text-sm text-muted-foreground">{employeeProfile.user.phone}</p>
                      </div>
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Building className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">الفرع</p>
                      <p className="text-sm text-muted-foreground">{employeeProfile.branch?.name || 'الرئيسي'}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">تاريخ التعيين</p>
                      <p className="text-sm text-muted-foreground">
                        {format(new Date(employeeProfile.hireDate), 'dd/MM/yyyy', { locale: ar })}
                      </p>
                    </div>
                  </div>
                  {employeeProfile.emergencyContact && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium">اتصال الطوارئ</p>
                        <p className="text-sm text-muted-foreground">
                          {employeeProfile.emergencyContact.name} - {employeeProfile.emergencyContact.phone}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leaves" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>طلبات الإجازات</CardTitle>
                  <CardDescription>إدارة طلبات الإجازات والموافقات</CardDescription>
                </div>
                <Dialog open={isLeaveRequestOpen} onOpenChange={setIsLeaveRequestOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <Calendar className="h-4 w-4 ml-2" />
                      طلب إجازة جديدة
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>طلب إجازة جديدة</DialogTitle>
                      <DialogDescription>
                        أدخل تفاصيل طلب الإجازة
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="leaveType">نوع الإجازة</Label>
                        <select
                          id="leaveType"
                          value={leaveFormData.leaveType}
                          onChange={(e) => setLeaveFormData({ ...leaveFormData, leaveType: e.target.value })}
                          className="w-full p-2 border rounded-md"
                        >
                          <option value="">اختر نوع الإجازة</option>
                          <option value="ANNUAL">إجازة سنوية</option>
                          <option value="SICK">إجازة مرضية</option>
                          <option value="MATERNITY">إجازة ولادة</option>
                          <option value="PATERNITY">إجازة أبوة</option>
                          <option value="UNPAID">إجازة بدون راتب</option>
                          <option value="EMERGENCY">إجازة طارئة</option>
                          <option value="STUDY">إجازة دراسية</option>
                        </select>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="startDate">تاريخ البدء</Label>
                          <Input
                            id="startDate"
                            type="date"
                            value={leaveFormData.startDate}
                            onChange={(e) => setLeaveFormData({ ...leaveFormData, startDate: e.target.value })}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="endDate">تاريخ الانتهاء</Label>
                          <Input
                            id="endDate"
                            type="date"
                            value={leaveFormData.endDate}
                            onChange={(e) => setLeaveFormData({ ...leaveFormData, endDate: e.target.value })}
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="reason">السبب</Label>
                        <Textarea
                          id="reason"
                          value={leaveFormData.reason}
                          onChange={(e) => setLeaveFormData({ ...leaveFormData, reason: e.target.value })}
                          placeholder="أدخل سبب الإجازة"
                          rows={3}
                        />
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setIsLeaveRequestOpen(false)}>
                        إلغاء
                      </Button>
                      <Button onClick={handleLeaveRequest}>
                        إرسال الطلب
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaveRequests.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">لا توجد طلبات إجازات</p>
                ) : (
                  leaveRequests.map((leave) => (
                    <div key={leave.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          <Calendar className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h4 className="font-medium">{getLeaveTypeText(leave.leaveType)}</h4>
                          <p className="text-sm text-muted-foreground">
                            {leave.totalDays} أيام • {format(new Date(leave.startDate), 'dd/MM/yyyy', { locale: ar })} - {format(new Date(leave.endDate), 'dd/MM/yyyy', { locale: ar })}
                          </p>
                          {leave.reason && (
                            <p className="text-xs text-muted-foreground mt-1">
                              السبب: {leave.reason}
                            </p>
                          )}
                        </div>
                      </div>
                      <Badge className={getStatusColor(leave.status)}>
                        {getStatusText(leave.status)}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {payrollAccess && (
          <TabsContent value="payroll" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>سجلات الرواتب</CardTitle>
                <CardDescription>عرض سجلات الرواتب والدفعات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {payrollRecords.length === 0 ? (
                    <p className="text-center text-gray-500 py-8">لا توجد سجلات رواتب</p>
                  ) : (
                    payrollRecords.map((payroll) => (
                      <div key={payroll.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center space-x-4">
                          <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                            <DollarSign className="h-5 w-5 text-green-600" />
                          </div>
                          <div>
                            <h4 className="font-medium">الفترة: {payroll.period}</h4>
                            <div className="flex space-x-4 text-sm text-muted-foreground mt-1">
                              <span>أساسي: {new Intl.NumberFormat('ar-EG', {
                                style: 'currency',
                                currency: 'EGP'
                              }).format(payroll.basicSalary)}</span>
                              <span>بدلات: {new Intl.NumberFormat('ar-EG', {
                                style: 'currency',
                                currency: 'EGP'
                              }).format(payroll.allowances)}</span>
                              <span>خصومات: {new Intl.NumberFormat('ar-EG', {
                                style: 'currency',
                                currency: 'EGP'
                              }).format(payroll.deductions)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-lg font-medium">
                            {new Intl.NumberFormat('ar-EG', {
                              style: 'currency',
                              currency: 'EGP'
                            }).format(payroll.netSalary)}
                          </p>
                          <Badge className={getStatusColor(payroll.status)}>
                            {getStatusText(payroll.status)}
                          </Badge>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        )}

        {allowInvoiceTab && (
          <TabsContent value="invoices" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <CardTitle>الفواتير</CardTitle>
                  <CardDescription>إنشاء الفواتير للعملاء وتتبع حالتها اليومية</CardDescription>
                </div>
                {allowInvoiceCreation ? (
                  <Dialog open={isInvoiceDialogOpen} onOpenChange={handleInvoiceDialogChange}>
                    <DialogTrigger asChild>
                      <Button>
                        <Plus className="h-4 w-4 ml-2" />
                        فاتورة جديدة
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-3xl">
                      <DialogHeader>
                        <DialogTitle>إنشاء فاتورة جديدة</DialogTitle>
                        <DialogDescription>
                          قم بإدخال بيانات العميل وإضافة العناصر أو الخدمات المطلوب تحصيلها.
                        </DialogDescription>
                      </DialogHeader>
                      <div className="space-y-6">
                        <div className="grid gap-4 md:grid-cols-2">
                          <div className="space-y-2">
                            <Label htmlFor="invoiceCustomerName">اسم العميل</Label>
                            <Input
                              id="invoiceCustomerName"
                              value={invoiceForm.customerName}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, customerName: e.target.value })}
                              placeholder="أدخل اسم العميل"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invoiceCustomerEmail">البريد الإلكتروني</Label>
                            <Input
                              id="invoiceCustomerEmail"
                              type="email"
                              value={invoiceForm.customerEmail}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, customerEmail: e.target.value })}
                              placeholder="example@email.com"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invoiceOrderId">رقم الطلب (اختياري)</Label>
                            <Input
                              id="invoiceOrderId"
                              value={invoiceForm.orderId}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, orderId: e.target.value })}
                              placeholder="إن وجد"
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invoiceTax">نسبة الضريبة (%)</Label>
                            <Input
                              id="invoiceTax"
                              type="number"
                              min={0}
                              value={invoiceForm.taxRate}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, taxRate: e.target.value })}
                            />
                          </div>
                          <div className="space-y-2">
                            <Label htmlFor="invoiceDueDate">تاريخ الاستحقاق</Label>
                            <Input
                              id="invoiceDueDate"
                              type="date"
                              value={invoiceForm.dueDate}
                              onChange={(e) => setInvoiceForm({ ...invoiceForm, dueDate: e.target.value })}
                            />
                          </div>
                        </div>

                        <div className="space-y-4">
                          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                            <h4 className="text-lg font-semibold">عناصر الفاتورة</h4>
                            <div className="text-sm text-muted-foreground">
                              المجموع الفرعي:{' '}
                              {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(invoiceSubtotal)}
                            </div>
                          </div>

                          <div className="space-y-3">
                            {invoiceItems.length === 0 ? (
                              <div className="rounded-lg border border-dashed p-6 text-center text-muted-foreground">
                                لم يتم إضافة عناصر إلى الفاتورة بعد
                              </div>
                            ) : (
                              <Table>
                                <TableHeader>
                                  <TableRow>
                                    <TableHead>الوصف</TableHead>
                                    <TableHead>الكمية</TableHead>
                                    <TableHead>سعر الوحدة</TableHead>
                                    <TableHead className="text-right">الإجمالي</TableHead>
                                    <TableHead className="text-right">إجراءات</TableHead>
                                  </TableRow>
                                </TableHeader>
                                <TableBody>
                                  {invoiceItems.map((item) => (
                                    <TableRow key={item.id}>
                                      <TableCell>
                                        <div className="font-medium">{item.description}</div>
                                        <div className="text-xs text-muted-foreground">
                                          {item.sourceType === 'CUSTOM'
                                            ? 'عنصر مخصص'
                                            : item.sourceType === 'PART'
                                              ? 'قطعة غيار من المخزون'
                                              : 'مركبة'}
                                        </div>
                                      </TableCell>
                                      <TableCell className="w-[120px]">
                                        <Input
                                          type="number"
                                          min={1}
                                          value={item.quantity}
                                          onChange={(e) => handleInvoiceItemChange(item.id, 'quantity', Number(e.target.value))}
                                        />
                                      </TableCell>
                                      <TableCell>
                                        <Input
                                          type="number"
                                          min={0}
                                          value={item.unitPrice}
                                          onChange={(e) => handleInvoiceItemChange(item.id, 'unitPrice', Number(e.target.value))}
                                        />
                                      </TableCell>
                                      <TableCell className="text-right">
                                        {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(item.quantity * item.unitPrice)}
                                      </TableCell>
                                      <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleRemoveInvoiceItem(item.id)}>
                                          <Trash2 className="h-4 w-4" />
                                        </Button>
                                      </TableCell>
                                    </TableRow>
                                  ))}
                                </TableBody>
                              </Table>
                            )}
                          </div>

                          <div className="grid gap-3 md:grid-cols-5">
                            <div className="space-y-2">
                              <Label>نوع العنصر</Label>
                              <Select value={newItemType} onValueChange={(value) => handleNewItemTypeChange(value as InvoiceDraftSource)}>
                                <SelectTrigger>
                                  <SelectValue placeholder="اختر نوع العنصر" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="CUSTOM">خدمة أو عنصر مخصص</SelectItem>
                                  <SelectItem value="PART">قطعة غيار من المخزون</SelectItem>
                                  <SelectItem value="VEHICLE">مركبة</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                              <Label>تفاصيل العنصر</Label>
                              {newItemType === 'CUSTOM' ? (
                                <Input
                                  value={newItemDescription}
                                  onChange={(e) => setNewItemDescription(e.target.value)}
                                  placeholder="أدخل وصف العنصر أو الخدمة"
                                />
                              ) : (
                                <Select value={newItemSelection} onValueChange={handleNewItemSelection}>
                                  <SelectTrigger>
                                    <SelectValue placeholder={newItemType === 'PART' ? 'اختر قطعة الغيار' : 'اختر المركبة'} />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {newItemType === 'PART'
                                      ? partsInventory.slice(0, 50).map((part) => (
                                          <SelectItem key={part.id} value={part.id}>
                                            {part.name} • {part.partNumber}
                                          </SelectItem>
                                        ))
                                      : carsInventory.slice(0, 50).map((car) => (
                                          <SelectItem key={car.id} value={car.id}>
                                            {car.make} {car.model} {car.year}
                                          </SelectItem>
                                        ))}
                                  </SelectContent>
                                </Select>
                              )}
                            </div>
                            <div className="space-y-2">
                              <Label>الكمية</Label>
                              <Input
                                type="number"
                                min={1}
                                value={newItemQuantity}
                                onChange={(e) => {
                                  const value = Number(e.target.value)
                                  setNewItemQuantity(Number.isNaN(value) ? 0 : value)
                                }}
                                disabled={newItemType === 'VEHICLE'}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label>سعر الوحدة</Label>
                              <Input
                                type="number"
                                min={0}
                                value={newItemUnitPrice}
                                onChange={(e) => {
                                  const value = Number(e.target.value)
                                  setNewItemUnitPrice(Number.isNaN(value) ? 0 : value)
                                }}
                                disabled={newItemType !== 'CUSTOM'}
                              />
                            </div>
                            <div className="md:col-span-5 flex justify-end">
                              <Button type="button" variant="secondary" onClick={handleAddInvoiceItem}>
                                <Plus className="h-4 w-4 ml-2" />
                                إضافة العنصر
                              </Button>
                            </div>
                          </div>

                          <div className="flex flex-col gap-2 border-t pt-4 md:flex-row md:items-center md:justify-between">
                            <div className="text-sm text-muted-foreground space-y-1">
                              <p>الإجمالي الفرعي: {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(invoiceSubtotal)}</p>
                              <p>
                                الضريبة ({taxRate}%): {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(invoiceTaxAmount)}
                              </p>
                            </div>
                            <div className="text-lg font-semibold">
                              المبلغ المستحق: {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(invoiceTotal)}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end space-x-2">
                          <Button variant="outline" onClick={() => handleInvoiceDialogChange(false)}>
                            إلغاء
                          </Button>
                          <Button onClick={handleCreateInvoice} disabled={invoiceSubmitting}>
                            {invoiceSubmitting ? 'جارٍ الحفظ...' : 'حفظ الفاتورة'}
                          </Button>
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  <Button variant="outline" size="sm" disabled>
                    لا تملك صلاحية إنشاء فاتورة
                  </Button>
                )}
              </CardHeader>
              <CardContent>
                {allowInvoiceListing ? (
                  invoices.length === 0 ? (
                    <p className="text-center text-muted-foreground py-8">لم يتم إصدار أي فواتير حتى الآن</p>
                  ) : (
                    <div className="space-y-3">
                      {invoices.map((invoice) => {
                        const issueDate = invoice.issueDate ? new Date(invoice.issueDate) : null
                        const dueDate = invoice.dueDate ? new Date(invoice.dueDate) : null
                        const issueDateText = issueDate && !Number.isNaN(issueDate.getTime())
                          ? format(issueDate, 'dd/MM/yyyy', { locale: ar })
                          : 'غير متوفر'
                        const dueDateText = dueDate && !Number.isNaN(dueDate.getTime())
                          ? format(dueDate, 'dd/MM/yyyy', { locale: ar })
                          : 'غير محدد'

                        return (
                          <div key={invoice.id} className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                            <div className="space-y-1">
                              <h4 className="font-semibold">فاتورة #{invoice.id.slice(0, 8)}</h4>
                              <p className="text-sm text-muted-foreground">
                                {invoice.customerName} • {invoice.customerEmail}
                              </p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Clock className="h-3.5 w-3.5" />
                                صادرة في {issueDateText} • مستحقة في {dueDateText}
                              </p>
                            </div>
                            <div className="space-y-2 text-right">
                              <p className="text-lg font-semibold">
                                {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(invoice.total)}
                              </p>
                              <Badge className={getStatusColor(invoice.status.toUpperCase())}>
                                {getStatusText(invoice.status.toUpperCase())}
                              </Badge>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )
                ) : (
                  <p className="text-center text-muted-foreground py-8">لا تملك صلاحية عرض الفواتير الحالية</p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        )}
        {allowInventoryTab && (
          <TabsContent value="inventory" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>مخزون السيارات المتاحة</CardTitle>
                <CardDescription>نظرة سريعة على المركبات الجاهزة للبيع أو التسليم</CardDescription>
              </CardHeader>
              <CardContent>
              {carsInventory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد سيارات متاحة حالياً في المخزون</p>
              ) : (
                <div className="space-y-3">
                  {carsInventory.slice(0, 8).map((car) => (
                    <div key={car.id} className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Car className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-semibold">{car.make} {car.model} {car.year}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">رقم المخزون: {car.stockNumber || 'غير متوفر'}</p>
                        <p className="text-sm text-muted-foreground">
                          السعر: {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(car.price)}
                        </p>
                      </div>
                      <div className="space-y-2 text-right">
                        <Badge className={getStatusColor(car.status.toUpperCase())}>
                          {getStatusText(car.status.toUpperCase())}
                        </Badge>
                        <p className="text-xs text-muted-foreground">ناقل الحركة: {car.transmission || 'غير محدد'}</p>
                        <p className="text-xs text-muted-foreground">نوع الوقود: {car.fuelType || 'غير محدد'}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>مخزون قطع الغيار</CardTitle>
                <CardDescription>تتبع سريع لمستويات المخزون والقطع منخفضة الكمية</CardDescription>
              </CardHeader>
              <CardContent>
              {partsInventory.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">لا توجد بيانات متاحة لقطع الغيار</p>
              ) : (
                <div className="space-y-3">
                  {partsInventory.slice(0, 10).map((part) => (
                    <div key={part.id} className="flex flex-col gap-2 rounded-lg border p-4 md:flex-row md:items-center md:justify-between">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <Package className="h-5 w-5 text-muted-foreground" />
                          <h4 className="font-semibold">{part.name}</h4>
                        </div>
                        <p className="text-sm text-muted-foreground">رقم القطعة: {part.partNumber}</p>
                        <p className="text-sm text-muted-foreground flex items-center gap-1">
                          <MapPin className="h-4 w-4" />
                          {part.location || 'غير محدد'} • {part.warehouse || 'غير محدد'}
                        </p>
                        <p className="text-sm text-muted-foreground">المورد: {part.supplier || 'غير معروف'}</p>
                      </div>
                      <div className="space-y-2 text-right">
                        <Badge className={getStatusColor(part.status.toUpperCase())}>
                          {getStatusText(part.status.toUpperCase())}
                        </Badge>
                        <p className={`text-xs ${part.quantity <= part.minStockLevel ? 'text-red-600 font-medium' : 'text-muted-foreground'}`}>
                          الكمية المتاحة: {part.quantity} (الحد الأدنى {part.minStockLevel})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          السعر: {new Intl.NumberFormat('ar-EG', { style: 'currency', currency: 'EGP' }).format(part.unitPrice)}
                        </p>
                        <p className="text-xs text-muted-foreground flex items-center gap-1 justify-end">
                          <Clock className="h-3.5 w-3.5" />
                          زمن التوريد: {part.leadTime} يوم
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
              </CardContent>
            </Card>
          </TabsContent>
        )}

        <TabsContent value="documents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>المستندات</CardTitle>
              <CardDescription>المستندات والشهادات الرسمية</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">المستندات</h3>
                <p className="text-gray-600 mb-4">
                  سيتم إضافة المستندات والشهادات قريباً
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}