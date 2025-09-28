'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar, FileText, Shield, AlertTriangle, CheckCircle, Clock, Plus, Search, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface Contract {
  id: string
  contractNumber: string
  type: string
  customerName: string
  vehicleName?: string
  startDate: string
  endDate?: string
  value: number
  status: string
  branchName?: string
}

interface Warranty {
  id: string
  warrantyNumber: string
  type: string
  vehicleName: string
  startDate: string
  endDate: string
  status: string
  coverage?: any
}

interface WarrantyClaim {
  id: string
  claimNumber: string
  warrantyNumber: string
  customerName: string
  vehicleName: string
  claimDate: string
  status: string
  estimatedCost?: number
  actualCost?: number
}

export default function ContractsPage() {
  const [contracts, setContracts] = useState<Contract[]>([])
  const [warranties, setWarranties] = useState<Warranty[]>([])
  const [warrantyClaims, setWarrantyClaims] = useState<WarrantyClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch contracts
      const contractsRes = await fetch('/api/contracts')
      if (contractsRes.ok) {
        const contractsData = await contractsRes.json()
        setContracts(contractsData)
      }

      // Fetch warranties
      const warrantiesRes = await fetch('/api/warranties')
      if (warrantiesRes.ok) {
        const warrantiesData = await warrantiesRes.json()
        setWarranties(warrantiesData)
      }

      // Fetch warranty claims
      const claimsRes = await fetch('/api/warranty-claims')
      if (claimsRes.ok) {
        const claimsData = await claimsRes.json()
        setWarrantyClaims(claimsData)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-yellow-100 text-yellow-800'
      case 'completed':
        return 'bg-blue-100 text-blue-800'
      case 'cancelled':
        return 'bg-red-100 text-red-800'
      case 'expired':
        return 'bg-gray-100 text-gray-800'
      case 'under_review':
        return 'bg-purple-100 text-purple-800'
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'completed':
      case 'approved':
        return <CheckCircle className="h-4 w-4" />
      case 'pending':
      case 'under_review':
        return <Clock className="h-4 w-4" />
      case 'cancelled':
      case 'rejected':
      case 'expired':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.contractNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (contract.vehicleName && contract.vehicleName.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredWarranties = warranties.filter(warranty => {
    const matchesSearch = warranty.warrantyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         warranty.vehicleName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || warranty.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredClaims = warrantyClaims.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.vehicleName.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const stats = {
    totalContracts: contracts.length,
    activeContracts: contracts.filter(c => c.status === 'ACTIVE').length,
    totalWarranties: warranties.length,
    activeWarranties: warranties.filter(w => w.status === 'ACTIVE').length,
    pendingClaims: warrantyClaims.filter(c => c.status === 'PENDING' || c.status === 'UNDER_REVIEW').length,
    totalClaims: warrantyClaims.length
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">جاري تحميل البيانات...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام العقود والضمانات</h1>
          <p className="text-muted-foreground mt-2">إدارة العقود والضمانات ومطالبات الضمان</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="h-4 w-4 ml-2" />
            عقد جديد
          </Button>
          <Button variant="outline">
            <Plus className="h-4 w-4 ml-2" />
            ضمان جديد
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العقود</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalContracts}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeContracts} عقود نشطة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي الضمانات</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalWarranties}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeWarranties} ضمانات نشطة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">مطالبات الضمان</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalClaims}</div>
            <p className="text-xs text-muted-foreground">
              {stats.pendingClaims} قيد الانتظار
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث بالرقم أو العميل أو المركبة..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <Filter className="h-4 w-4 ml-2" />
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="ACTIVE">نشط</SelectItem>
            <SelectItem value="PENDING">قيد الانتظار</SelectItem>
            <SelectItem value="COMPLETED">مكتمل</SelectItem>
            <SelectItem value="CANCELLED">ملغي</SelectItem>
            <SelectItem value="EXPIRED">منتهي</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="contracts" className="space-y-4">
        <TabsList>
          <TabsTrigger value="contracts">العقود</TabsTrigger>
          <TabsTrigger value="warranties">الضمانات</TabsTrigger>
          <TabsTrigger value="claims">مطالبات الضمان</TabsTrigger>
        </TabsList>

        <TabsContent value="contracts" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة العقود</CardTitle>
              <CardDescription>عرض وإدارة جميع العقود في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredContracts.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد عقود مطابقة للبحث</p>
                  </div>
                ) : (
                  filteredContracts.map((contract) => (
                    <div key={contract.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-blue-100 rounded-lg">
                          <FileText className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{contract.contractNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            {contract.customerName} - {contract.vehicleName || 'بدون مركبة'}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(contract.startDate), 'dd/MM/yyyy', { locale: ar })}
                              {contract.endDate && ` - ${format(new Date(contract.endDate), 'dd/MM/yyyy', { locale: ar })}`}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">{contract.value.toLocaleString()} ج.م</p>
                          <p className="text-xs text-muted-foreground">{contract.branchName}</p>
                        </div>
                        <Badge className={getStatusColor(contract.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(contract.status)}
                            {contract.status}
                          </div>
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="warranties" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>قائمة الضمانات</CardTitle>
              <CardDescription>عرض وإدارة جميع الضمانات في النظام</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredWarranties.length === 0 ? (
                  <div className="text-center py-8">
                    <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد ضمانات مطابقة للبحث</p>
                  </div>
                ) : (
                  filteredWarranties.map((warranty) => (
                    <div key={warranty.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-green-100 rounded-lg">
                          <Shield className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{warranty.warrantyNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            {warranty.vehicleName} - {warranty.type}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(warranty.startDate), 'dd/MM/yyyy', { locale: ar })} - {format(new Date(warranty.endDate), 'dd/MM/yyyy', { locale: ar })}
                            </span>
                          </div>
                        </div>
                      </div>
                      <Badge className={getStatusColor(warranty.status)}>
                        <div className="flex items-center gap-1">
                          {getStatusIcon(warranty.status)}
                          {warranty.status}
                        </div>
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>مطالبات الضمان</CardTitle>
              <CardDescription>عرض وإدارة مطالبات الضمان</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClaims.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground">لا توجد مطالبات مطابقة للبحث</p>
                  </div>
                ) : (
                  filteredClaims.map((claim) => (
                    <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className="p-2 bg-orange-100 rounded-lg">
                          <AlertTriangle className="h-5 w-5 text-orange-600" />
                        </div>
                        <div>
                          <h3 className="font-medium">{claim.claimNumber}</h3>
                          <p className="text-sm text-muted-foreground">
                            {claim.customerName} - {claim.vehicleName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <Calendar className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">
                              {format(new Date(claim.claimDate), 'dd/MM/yyyy', { locale: ar })}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              • الضمان: {claim.warrantyNumber}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className="font-medium">
                            {claim.actualCost ? claim.actualCost.toLocaleString() : claim.estimatedCost ? claim.estimatedCost.toLocaleString() : '0'} ج.م
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {claim.actualCost ? 'التكلفة الفعلية' : claim.estimatedCost ? 'التكلفة المقدرة' : 'لم يحدد'}
                          </p>
                        </div>
                        <Badge className={getStatusColor(claim.status)}>
                          <div className="flex items-center gap-1">
                            {getStatusIcon(claim.status)}
                            {claim.status}
                          </div>
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}