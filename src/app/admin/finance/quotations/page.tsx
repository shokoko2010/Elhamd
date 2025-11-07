'use client'

import { useEffect, useState } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  FileText, 
  DollarSign, 
  Search, 
  Plus,
  Filter,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Clock,
  CheckCircle,
  AlertCircle,
  X,
  Mail,
  Download,
  Send,
  Copy,
  RefreshCw,
  TrendingUp,
  Users,
  Car,
  Wrench
} from 'lucide-react'
import Link from 'next/link'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useToast } from '@/hooks/use-toast'

interface QuotationItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxRate: number
  taxAmount: number
  metadata?: Record<string, any>
}

interface Quotation {
  id: string
  quotationNumber: string
  customerId: string
  customer: {
    id: string
    name: string
    email: string
    phone?: string
  }
  status: 'DRAFT' | 'SENT' | 'ACCEPTED' | 'REJECTED' | 'EXPIRED' | 'CONVERTED_TO_INVOICE'
  issueDate: string
  validUntil: string
  subtotal: number
  taxAmount: number
  totalAmount: number
  currency: string
  items: QuotationItem[]
  notes?: string
  terms?: string
  createdAt: string
  updatedAt: string
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  company?: string
}

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  price: number
  category: string
}

interface Service {
  id: string
  name: string
  description: string
  price: number
  category: string
}

export default function QuotationsPage() {
  return (
    <AdminRoute>
      <QuotationsContent />
    </AdminRoute>
  )
}

function QuotationsContent() {
  const [activeTab, setActiveTab] = useState('quotations')
  const [loading, setLoading] = useState(true)
  const [quotations, setQuotations] = useState<Quotation[]>([])
  const [customers, setCustomers] = useState<Customer[]>([])
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateRange, setDateRange] = useState('month')
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  // Form state for new quotation
  const [newQuotation, setNewQuotation] = useState({
    customerId: '',
    validUntil: '',
    notes: '',
    terms: '',
    items: [] as QuotationItem[]
  })

  useEffect(() => {
    fetchQuotationsData()
  }, [dateRange])

  useEffect(() => {
    if (searchParams.get('mode') === 'create') {
      setIsCreateModalOpen(true)
    }
  }, [searchParams])

  const handleModalOpenChange = (open: boolean) => {
    setIsCreateModalOpen(open)

    const params = new URLSearchParams(searchParams)
    if (open) {
      params.set('mode', 'create')
    } else {
      params.delete('mode')
    }

    const query = params.toString()
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false })
  }

  const fetchQuotationsData = async () => {
    try {
      setLoading(true)
      
      // Fetch quotations
      const quotationsResponse = await fetch('/api/finance/quotations')
      if (quotationsResponse.ok) {
        const quotationsData = await quotationsResponse.json()
        setQuotations(quotationsData.quotations || [])
      }

      // Fetch customers
      const customersResponse = await fetch('/api/crm/customers')
      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        setCustomers(customersData.customers || [])
      }

      // Fetch vehicles for quotation items
      const vehiclesResponse = await fetch('/api/vehicles')
      if (vehiclesResponse.ok) {
        const vehiclesData = await vehiclesResponse.json()
        setVehicles(vehiclesData.vehicles || [])
      }

      // Fetch services for quotation items
      const servicesResponse = await fetch('/api/service-items')
      if (servicesResponse.ok) {
        const servicesData = await servicesResponse.json()
        setServices(servicesData || [])
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل بيانات عروض الأسعار',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateQuotation = async () => {
    try {
      const response = await fetch('/api/finance/quotations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newQuotation)
      })

      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم إنشاء عرض السعر بنجاح'
        })
        handleModalOpenChange(false)
        setNewQuotation({
          customerId: '',
          validUntil: '',
          notes: '',
          terms: '',
          items: []
        })
        fetchQuotationsData()
      } else {
        const error = await response.json()
        toast({
          title: 'خطأ',
          description: error.error || 'فشل في إنشاء عرض السعر',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إنشاء عرض السعر',
        variant: 'destructive'
      })
    }
  }

  const handleSendQuotation = async (quotationId: string) => {
    try {
      const response = await fetch(`/api/finance/quotations/${quotationId}/send`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم إرسال عرض السعر بنجاح'
        })
        fetchQuotationsData()
      } else {
        throw new Error('Failed to send quotation')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في إرسال عرض السعر',
        variant: 'destructive'
      })
    }
  }

  const handleConvertToInvoice = async (quotationId: string) => {
    try {
      const response = await fetch(`/api/finance/quotations/${quotationId}/convert-to-invoice`, {
        method: 'POST'
      })
      
      if (response.ok) {
        toast({
          title: 'نجاح',
          description: 'تم تحويل عرض السعر إلى فاتورة بنجاح'
        })
        fetchQuotationsData()
      } else {
        throw new Error('Failed to convert quotation to invoice')
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحويل عرض السعر إلى فاتورة',
        variant: 'destructive'
      })
    }
  }

  const downloadQuotation = async (quotationId: string) => {
    try {
      const response = await fetch(`/api/finance/quotations/${quotationId}/download`)
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `quotation-${quotationId}.pdf`
        a.click()
        window.URL.revokeObjectURL(url)
      }
    } catch (error) {
      toast({
        title: 'خطأ',
        description: 'فشل في تحميل عرض السعر',
        variant: 'destructive'
      })
    }
  }

  const addVehicleToQuotation = (vehicle: Vehicle) => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: `سيارة ${vehicle.make} ${vehicle.model} ${vehicle.year}`,
      quantity: 1,
      unitPrice: vehicle.price,
      totalPrice: vehicle.price,
      taxRate: 14, // VAT rate
      taxAmount: vehicle.price * 0.14,
      metadata: {
        type: 'vehicle',
        vehicleId: vehicle.id
      }
    }
    
    setNewQuotation(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const addServiceToQuotation = (service: Service) => {
    const newItem: QuotationItem = {
      id: Date.now().toString(),
      description: service.name,
      quantity: 1,
      unitPrice: service.price,
      totalPrice: service.price,
      taxRate: 14, // VAT rate
      taxAmount: service.price * 0.14,
      metadata: {
        type: 'service',
        serviceId: service.id
      }
    }
    
    setNewQuotation(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }))
  }

  const removeItemFromQuotation = (itemId: string) => {
    setNewQuotation(prev => ({
      ...prev,
      items: prev.items.filter(item => item.id !== itemId)
    }))
  }

  const filteredQuotations = quotations.filter(quotation => {
    const matchesSearch = 
      quotation.quotationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      quotation.customer.email.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || quotation.status === statusFilter
    
    return matchesSearch && matchesStatus
  })

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      DRAFT: { label: 'مسودة', variant: 'secondary' as const, icon: FileText },
      SENT: { label: 'مرسلة', variant: 'default' as const, icon: Mail },
      ACCEPTED: { label: 'مقبولة', variant: 'default' as const, icon: CheckCircle },
      REJECTED: { label: 'مرفوضة', variant: 'destructive' as const, icon: X },
      EXPIRED: { label: 'منتهية الصلاحية', variant: 'outline' as const, icon: Clock },
      CONVERTED_TO_INVOICE: { label: 'محولة لفاتورة', variant: 'default' as const, icon: FileText }
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
      month: 'short',
      day: 'numeric'
    })
  }

  const quotationStats = {
    totalQuotations: quotations.length,
    draftQuotations: quotations.filter(q => q.status === 'DRAFT').length,
    sentQuotations: quotations.filter(q => q.status === 'SENT').length,
    acceptedQuotations: quotations.filter(q => q.status === 'ACCEPTED').length,
    totalValue: quotations.reduce((sum, q) => sum + q.totalAmount, 0),
    conversionRate: quotations.length > 0 
      ? (quotations.filter(q => q.status === 'ACCEPTED').length / quotations.length * 100).toFixed(1)
      : 0
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">عروض الأسعار</h1>
          <p className="text-gray-600 mt-2">إدارة عروض الأسعار والمبيعات والتحويل إلى فواتير</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => handleModalOpenChange(true)}>
            <Plus className="ml-2 h-4 w-4" />
            عرض سعر جديد
          </Button>
          <Button variant="outline">
            <Download className="ml-2 h-4 w-4" />
            تصدير
          </Button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العروض</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{quotationStats.totalQuotations}</div>
            <p className="text-xs text-muted-foreground">جميع العروض</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العروض المرسلة</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{quotationStats.sentQuotations}</div>
            <p className="text-xs text-muted-foreground">بانتظار الرد</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">العروض المقبولة</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{quotationStats.acceptedQuotations}</div>
            <p className="text-xs text-muted-foreground">تم قبولها</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">نسبة التحويل</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">{quotationStats.conversionRate}%</div>
            <p className="text-xs text-muted-foreground">معدل القبول</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">القيمة الإجمالية</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {formatCurrency(quotationStats.totalValue)}
            </div>
            <p className="text-xs text-muted-foreground">قيمة جميع العروض</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="quotations">عروض الأسعار</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
        </TabsList>

        {/* Quotations Tab */}
        <TabsContent value="quotations" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                الفلاتر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث في عروض الأسعار..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="DRAFT">مسودة</SelectItem>
                    <SelectItem value="SENT">مرسلة</SelectItem>
                    <SelectItem value="ACCEPTED">مقبولة</SelectItem>
                    <SelectItem value="REJECTED">مرفوضة</SelectItem>
                    <SelectItem value="EXPIRED">منتهية الصلاحية</SelectItem>
                    <SelectItem value="CONVERTED_TO_INVOICE">محولة لفاتورة</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger>
                    <SelectValue placeholder="الفترة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="week">هذا الأسبوع</SelectItem>
                    <SelectItem value="month">هذا الشهر</SelectItem>
                    <SelectItem value="quarter">هذا الربع</SelectItem>
                    <SelectItem value="year">هذه السنة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Quotations Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>عروض الأسعار</CardTitle>
                  <CardDescription>إدارة عروض الأسعار والمتابعة والتحويل إلى فواتير</CardDescription>
                </div>
                <Button onClick={() => handleModalOpenChange(true)}>
                  <Plus className="ml-2 h-4 w-4" />
                  عرض سعر جديد
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-right py-3 px-4">رقم العرض</th>
                      <th className="text-right py-3 px-4">العميل</th>
                      <th className="text-right py-3 px-4">التاريخ</th>
                      <th className="text-right py-3 px-4">صالح حتى</th>
                      <th className="text-right py-3 px-4">المبلغ</th>
                      <th className="text-right py-3 px-4">الحالة</th>
                      <th className="text-right py-3 px-4">الإجراءات</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredQuotations.map((quotation) => (
                      <tr key={quotation.id} className="border-b hover:bg-gray-50">
                        <td className="text-right py-3 px-4 font-medium">
                          {quotation.quotationNumber}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div>
                            <div className="font-medium">{quotation.customer.name}</div>
                            <div className="text-sm text-gray-500">{quotation.customer.email}</div>
                          </div>
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatDate(quotation.issueDate)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {formatDate(quotation.validUntil)}
                        </td>
                        <td className="text-right py-3 px-4 font-medium">
                          {formatCurrency(quotation.totalAmount)}
                        </td>
                        <td className="text-right py-3 px-4">
                          {getStatusBadge(quotation.status)}
                        </td>
                        <td className="text-right py-3 px-4">
                          <div className="flex items-center gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => downloadQuotation(quotation.id)}
                            >
                              <Download className="h-4 w-4" />
                            </Button>
                            {quotation.status === 'DRAFT' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSendQuotation(quotation.id)}
                              >
                                <Send className="h-4 w-4" />
                              </Button>
                            )}
                            {quotation.status === 'ACCEPTED' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleConvertToInvoice(quotation.id)}
                              >
                                <FileText className="h-4 w-4" />
                              </Button>
                            )}
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>تحليل أداء المبيعات</CardTitle>
                <CardDescription>نظرة عامة على أداء عروض الأسعار والمبيعات</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>معدل تحويل العروض</span>
                    <span className="font-bold">{quotationStats.conversionRate}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>متوسط قيمة العرض</span>
                    <span className="font-bold">
                      {quotationStats.totalQuotations > 0 
                        ? formatCurrency(quotationStats.totalValue / quotationStats.totalQuotations)
                        : formatCurrency(0)
                      }
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>إجمالي القيمة المحتملة</span>
                    <span className="font-bold text-green-600">
                      {formatCurrency(quotationStats.totalValue)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>توزيع العروض حسب الحالة</CardTitle>
                <CardDescription>توزيع عروض الأسعار حسب حالتها الحالية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>المسودات</span>
                    <Badge variant="secondary">{quotationStats.draftQuotations}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>المرسلة</span>
                    <Badge variant="default">{quotationStats.sentQuotations}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>المقبولة</span>
                    <Badge variant="default" className="bg-green-600">{quotationStats.acceptedQuotations}</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span>المرفوضة</span>
                    <Badge variant="destructive">{quotations.filter(q => q.status === 'REJECTED').length}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Quotation Modal */}
      <Dialog open={isCreateModalOpen} onOpenChange={handleModalOpenChange}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>إنشاء عرض سعر جديد</DialogTitle>
            <DialogDescription>إنشاء عرض سعر جديد للعميل وإضافة السيارات والخدمات</DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6">
            {/* Customer Selection */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="customer">العميل</Label>
                <Select value={newQuotation.customerId} onValueChange={(value) => setNewQuotation(prev => ({ ...prev, customerId: value }))}>
                  <SelectTrigger>
                    <SelectValue placeholder="اختر العميل" />
                  </SelectTrigger>
                  <SelectContent>
                    {customers.map((customer) => (
                      <SelectItem key={customer.id} value={customer.id}>
                        {customer.name} - {customer.email}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="validUntil">صالح حتى</Label>
                <Input
                  id="validUntil"
                  type="date"
                  value={newQuotation.validUntil}
                  onChange={(e) => setNewQuotation(prev => ({ ...prev, validUntil: e.target.value }))}
                />
              </div>
            </div>

            {/* Items Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">إضافة بنود العرض</h3>
              
              <Tabs defaultValue="vehicles" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="vehicles">السيارات</TabsTrigger>
                  <TabsTrigger value="services">الخدمات</TabsTrigger>
                </TabsList>
                
                <TabsContent value="vehicles" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {vehicles.map((vehicle) => (
                      <Card key={vehicle.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{vehicle.make} {vehicle.model}</h4>
                              <p className="text-sm text-gray-500">{vehicle.year} - {vehicle.category}</p>
                              <p className="text-lg font-bold text-blue-600">{formatCurrency(vehicle.price)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addVehicleToQuotation(vehicle)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
                
                <TabsContent value="services" className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                    {services.map((service) => (
                      <Card key={service.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardContent className="p-4">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{service.name}</h4>
                              <p className="text-sm text-gray-500">{service.description}</p>
                              <p className="text-lg font-bold text-green-600">{formatCurrency(service.price)}</p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => addServiceToQuotation(service)}
                            >
                              <Plus className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Selected Items */}
            {newQuotation.items.length > 0 && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">البند المحددة</h3>
                <div className="space-y-2">
                  {newQuotation.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                      <div>
                        <span className="font-medium">{item.description}</span>
                        <span className="text-sm text-gray-500 ml-2">x{item.quantity}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{formatCurrency(item.totalPrice)}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeItemFromQuotation(item.id)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t pt-4">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>الإجمالي:</span>
                    <span>
                      {formatCurrency(newQuotation.items.reduce((sum, item) => sum + item.totalPrice, 0))}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Notes and Terms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="notes">ملاحظات</Label>
                <Textarea
                  id="notes"
                  value={newQuotation.notes}
                  onChange={(e) => setNewQuotation(prev => ({ ...prev, notes: e.target.value }))}
                  placeholder="أي ملاحظات إضافية..."
                />
              </div>
              <div>
                <Label htmlFor="terms">الشروط والأحكام</Label>
                <Textarea
                  id="terms"
                  value={newQuotation.terms}
                  onChange={(e) => setNewQuotation(prev => ({ ...prev, terms: e.target.value }))}
                  placeholder="الشروط والأحكام الخاصة بالعرض..."
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => handleModalOpenChange(false)}>
              إلغاء
            </Button>
            <Button onClick={handleCreateQuotation}>
              إنشاء عرض السعر
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}