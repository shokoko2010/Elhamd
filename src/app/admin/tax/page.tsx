'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Calculator, 
  FileText, 
  TrendingUp, 
  TrendingDown, 
  Calendar,
  Download,
  Plus,
  Edit,
  Trash2,
  Eye,
  AlertTriangle,
  CheckCircle,
  Clock,
  Percent,
  DollarSign,
  Receipt,
  Search,
  Filter
} from 'lucide-react'

interface TaxRate {
  id: string
  name: string
  rate: number
  type: 'standard' | 'reduced' | 'zero' | 'exempt'
  description: string
  isActive: boolean
  effectiveFrom: string
  effectiveTo?: string
}

interface TaxCalculation {
  id: string
  period: string
  taxableIncome: number
  taxAmount: number
  effectiveRate: number
  deductions: number
  credits: number
  netTax: number
  status: 'draft' | 'calculated' | 'filed' | 'paid'
  dueDate: string
  filedDate?: string
  paidDate?: string
}

interface TaxReport {
  totalTaxCollected: number
  totalTaxPaid: number
  taxDue: number
  complianceRate: number
  filings: Array<{
    period: string
    status: string
    amount: number
    dueDate: string
  }>
}

interface TaxRecord {
  id: string
  type: string
  period: string
  amount: number
  dueDate: string
  paidDate?: string
  status: string
  reference?: string
  notes?: string
  creator: {
    id: string
    name: string
    email: string
  }
  approver?: {
    id: string
    name: string
    email: string
  }
  branch?: {
    id: string
    name: string
    code: string
  }
  createdAt: string
}

export default function TaxManagement() {
  const [activeTab, setActiveTab] = useState('overview')
  const [taxRates, setTaxRates] = useState<TaxRate[]>([])
  const [calculations, setCalculations] = useState<TaxCalculation[]>([])
  const [reports, setReports] = useState<TaxReport | null>(null)
  const [taxRecords, setTaxRecords] = useState<TaxRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [typeFilter, setTypeFilter] = useState('all')

  useEffect(() => {
    fetchTaxData()
  }, [])

  const fetchTaxData = async () => {
    try {
      // Fetch tax rates
      const ratesResponse = await fetch('/api/tax/rates')
      if (ratesResponse.ok) {
        const ratesData = await ratesResponse.json()
        setTaxRates(ratesData.rates || [])
      }

      // Fetch tax calculations
      const calculationsResponse = await fetch('/api/tax/calculations')
      if (calculationsResponse.ok) {
        const calculationsData = await calculationsResponse.json()
        setCalculations(calculationsData.calculations || [])
      }

      // Fetch tax reports
      const reportsResponse = await fetch('/api/tax/reports')
      if (reportsResponse.ok) {
        const reportsData = await reportsResponse.json()
        setReports(reportsData)
      }

      // Fetch tax records
      const recordsResponse = await fetch('/api/tax/records')
      if (recordsResponse.ok) {
        const recordsData = await recordsResponse.json()
        setTaxRecords(recordsData.taxRecords || [])
      }
    } catch (error) {
      console.error('Error fetching tax data:', error)
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

  const formatPercentage = (value: number) => {
    return `${(value || 0).toFixed(1)}%`
  }

  const getTaxTypeBadge = (type: string) => {
    const typeConfig = {
      standard: { label: 'قياسي', variant: 'default' as const },
      reduced: { label: 'مخفض', variant: 'secondary' as const },
      zero: { label: 'صفر', variant: 'outline' as const },
      exempt: { label: 'معفى', variant: 'outline' as const }
    }

    const config = typeConfig[type as keyof typeof typeConfig] || { label: type, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'مسودة', variant: 'secondary' as const, icon: FileText },
      calculated: { label: 'محسوب', variant: 'default' as const, icon: Calculator },
      filed: { label: 'مقدم', variant: 'outline' as const, icon: CheckCircle },
      paid: { label: 'مدفوع', variant: 'default' as const, icon: CheckCircle }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, icon: FileText }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getComplianceBadge = (rate: number) => {
    if (rate >= 95) return <Badge variant="default" className="bg-green-500">ممتاز</Badge>
    if (rate >= 80) return <Badge variant="outline">جيد</Badge>
    if (rate >= 60) return <Badge variant="secondary">متوسط</Badge>
    return <Badge variant="destructive">ضعيف</Badge>
  }

  const getTaxRecordStatusBadge = (status: string) => {
    const statusConfig = {
      PENDING: { label: 'قيد الانتظار', variant: 'secondary' as const, icon: Clock },
      CALCULATED: { label: 'محسوب', variant: 'default' as const, icon: Calculator },
      FILED: { label: 'مقدم', variant: 'outline' as const, icon: FileText },
      PAID: { label: 'مدفوع', variant: 'default' as const, icon: CheckCircle },
      OVERDUE: { label: 'متأخر', variant: 'destructive' as const, icon: AlertTriangle },
      CANCELLED: { label: 'ملغي', variant: 'outline' as const, icon: FileText },
      UNDER_REVIEW: { label: 'قيد المراجعة', variant: 'default' as const, icon: Eye },
      APPROVED: { label: 'معتمد', variant: 'default' as const, icon: CheckCircle },
      REJECTED: { label: 'مرفوض', variant: 'destructive' as const, icon: AlertTriangle },
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const, icon: FileText }
    const Icon = config.icon
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    )
  }

  const getTaxTypeLabel = (type: string) => {
    const typeLabels = {
      VAT: 'ضريبة القيمة المضافة',
      SALES_TAX: 'ضريبة المبيعات',
      SERVICE_TAX: 'ضريبة الخدمات',
      INCOME_TAX: 'ضريبة الدخل',
      CORPORATE_TAX: 'ضريبة الشركات',
      CUSTOMS_DUTY: 'الرسوم الجمركية',
      STAMP_DUTY: 'ضريبة الدمغة',
      PROPERTY_TAX: 'ضريبة العقارات',
      WITHHOLDING_TAX: 'ضريبة الاستقطاع',
      PAYROLL_TAX: 'ضريبة الرواتب',
      CUSTOM: 'مخصص',
    }
    return typeLabels[type as keyof typeof typeLabels] || type
  }

  const filteredTaxRecords = taxRecords.filter(record => {
    const matchesSearch = searchTerm === '' || 
      record.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.notes?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.creator.name.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter
    const matchesType = typeFilter === 'all' || record.type === typeFilter
    
    return matchesSearch && matchesStatus && matchesType
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة الضرائب</h1>
              <p className="text-gray-600">إدارة معدلات الضريبة وحسابات الضرائب والإقرارات الضريبية</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <Download className="ml-2 h-4 w-4" />
                تصدير التقارير
              </Button>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                حساب ضريبي جديد
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="records">السجلات الضريبية</TabsTrigger>
            <TabsTrigger value="rates">معدلات الضريبة</TabsTrigger>
            <TabsTrigger value="calculations">الحسابات الضريبية</TabsTrigger>
            <TabsTrigger value="reports">التقارير</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Tax Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الضريبة المحصلة</CardTitle>
                  <DollarSign className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {reports ? formatCurrency(reports.totalTaxCollected) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">هذا الشهر</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الضريبة المدفوعة</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {reports ? formatCurrency(reports.totalTaxPaid) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">هذا الشهر</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الضريبة المستحقة</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {reports ? formatCurrency(reports.taxDue) : formatCurrency(0)}
                  </div>
                  <p className="text-xs text-muted-foreground">قيد الدفع</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل الامتثال</CardTitle>
                  <Percent className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {reports ? formatPercentage(reports.complianceRate) : '0%'}
                  </div>
                  <div className="flex items-center justify-center mt-2">
                    {reports && getComplianceBadge(reports.complianceRate)}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Tax Filings */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>آخر الإقرارات الضريبية</CardTitle>
                    <CardDescription>حالة الإقرارات الضريبية المقدمة</CardDescription>
                  </div>
                  <Button variant="outline" size="sm">
                    <Eye className="ml-2 h-4 w-4" />
                    عرض الكل
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {reports?.filings?.slice(0, 5).map((filing, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <p className="font-medium">{filing.period}</p>
                        <p className="text-sm text-gray-500">تاريخ الاستحقاق: {new Date(filing.dueDate).toLocaleDateString('ar-EG')}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">{formatCurrency(filing.amount)}</p>
                        {getStatusBadge(filing.status)}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Tax Records Tab */}
          <TabsContent value="records" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">السجلات الضريبية</h2>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                سجل ضريبي جديد
              </Button>
            </div>

            {/* Filters */}
            <Card>
              <CardContent className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="relative">
                    <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="بحث في السجلات..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pr-10"
                    />
                  </div>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="الحالة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الحالات</SelectItem>
                      <SelectItem value="PENDING">قيد الانتظار</SelectItem>
                      <SelectItem value="CALCULATED">محسوب</SelectItem>
                      <SelectItem value="FILED">مقدم</SelectItem>
                      <SelectItem value="PAID">مدفوع</SelectItem>
                      <SelectItem value="OVERDUE">متأخر</SelectItem>
                      <SelectItem value="CANCELLED">ملغي</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="نوع الضريبة" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">جميع الأنواع</SelectItem>
                      <SelectItem value="VAT">ضريبة القيمة المضافة</SelectItem>
                      <SelectItem value="INCOME_TAX">ضريبة الدخل</SelectItem>
                      <SelectItem value="CORPORATE_TAX">ضريبة الشركات</SelectItem>
                      <SelectItem value="CUSTOMS_DUTY">الرسوم الجمركية</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Tax Records Table */}
            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">المرجع</th>
                        <th className="text-right py-3 px-4">النوع</th>
                        <th className="text-right py-3 px-4">الفترة</th>
                        <th className="text-right py-3 px-4">المبلغ</th>
                        <th className="text-right py-3 px-4">تاريخ الاستحقاق</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">المنشئ</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTaxRecords.map((record) => (
                        <tr key={record.id} className="border-b hover:bg-gray-50">
                          <td className="text-right py-3 px-4 font-medium">
                            {record.reference || '-'}
                          </td>
                          <td className="text-right py-3 px-4">
                            <Badge variant="outline">
                              {getTaxTypeLabel(record.type)}
                            </Badge>
                          </td>
                          <td className="text-right py-3 px-4">
                            {record.period}
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {formatCurrency(record.amount)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {new Date(record.dueDate).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="text-right py-3 px-4">
                            {getTaxRecordStatusBadge(record.status)}
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="text-sm">
                              <div>{record.creator.name}</div>
                              <div className="text-gray-500">{record.creator.email}</div>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {['PENDING', 'CANCELLED'].includes(record.status) && (
                                <Button variant="ghost" size="sm">
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              )}
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

          {/* Tax Rates Tab */}
          <TabsContent value="rates" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">معدلات الضريبة</h2>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                إضافة معدل ضريبي
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {taxRates.map((rate) => (
                <Card key={rate.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{rate.name}</CardTitle>
                      {getTaxTypeBadge(rate.type)}
                    </div>
                    <CardDescription>{rate.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="text-center">
                        <div className="text-3xl font-bold text-blue-600">
                          {formatPercentage(rate.rate)}
                        </div>
                        <p className="text-sm text-gray-500">معدل الضريبة</p>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>ساري من:</span>
                          <span>{new Date(rate.effectiveFrom).toLocaleDateString('ar-EG')}</span>
                        </div>
                        {rate.effectiveTo && (
                          <div className="flex justify-between">
                            <span>ساري حتى:</span>
                            <span>{new Date(rate.effectiveTo).toLocaleDateString('ar-EG')}</span>
                          </div>
                        )}
                        <div className="flex justify-between">
                          <span>الحالة:</span>
                          <Badge variant={rate.isActive ? 'default' : 'secondary'}>
                            {rate.isActive ? 'نشط' : 'غير نشط'}
                          </Badge>
                        </div>
                      </div>
                      
                      <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                          <Edit className="ml-2 h-4 w-4" />
                          تعديل
                        </Button>
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Tax Calculations Tab */}
          <TabsContent value="calculations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">الحسابات الضريبية</h2>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                حساب جديد
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">الفترة</th>
                        <th className="text-right py-3 px-4">الدخل الخاضع للضريبة</th>
                        <th className="text-right py-3 px-4">الضريبة المستحقة</th>
                        <th className="text-right py-3 px-4">الضريبة الصافية</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">تاريخ الاستحقاق</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {calculations.map((calc) => (
                        <tr key={calc.id} className="border-b hover:bg-gray-50">
                          <td className="text-right py-3 px-4 font-medium">
                            {calc.period}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(calc.taxableIncome)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatCurrency(calc.taxAmount)}
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {formatCurrency(calc.netTax)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {getStatusBadge(calc.status)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {new Date(calc.dueDate).toLocaleDateString('ar-EG')}
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Download className="h-4 w-4" />
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

          {/* Reports Tab */}
          <TabsContent value="reports" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>تقرير ضريبي شهري</CardTitle>
                  <CardDescription>تقرير شامل للضرائب الشهرية</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full">
                      <Download className="ml-2 h-4 w-4" />
                      تحميل التقرير
                    </Button>
                    <p className="text-sm text-gray-500">آخر تحديث: 2024-01-15</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تقرير الامتثال الضريبي</CardTitle>
                  <CardDescription>تحليل امتثال الضرائب والتقارير</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full">
                      <Download className="ml-2 h-4 w-4" />
                      تحميل التقرير
                    </Button>
                    <p className="text-sm text-gray-500">آخر تحديث: 2024-01-10</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>تقرير التنبؤات الضريبية</CardTitle>
                  <CardDescription>توقعات الضرائب المستقبلية</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button className="w-full">
                      <Download className="ml-2 h-4 w-4" />
                      تحميل التقرير
                    </Button>
                    <p className="text-sm text-gray-500">آخر تحديث: 2024-01-08</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>ملخص الضريبي السنوي</CardTitle>
                <CardDescription>نظرة عامة على الأداء الضريبي للسنة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">إجمالي المحصلات</p>
                    <p className="text-lg font-semibold">{formatCurrency(542000)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">إجمالي المدفوعات</p>
                    <p className="text-lg font-semibold">{formatCurrency(485000)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">المتبقي</p>
                    <p className="text-lg font-semibold">{formatCurrency(57000)}</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm text-gray-600 mb-1">معدل الامتثال</p>
                    <p className="text-lg font-semibold">94.2%</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}