'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import { format } from 'date-fns'
import { CalendarIcon, Plus, Search, Filter, FileText, Shield, Car, Users, DollarSign } from 'lucide-react'
import { ar } from 'date-fns/locale'

interface InsuranceCompany {
  id: string
  name: string
  code: string
  contactPerson?: string
  phone?: string
  email?: string
  isActive: boolean
}

interface InsurancePolicy {
  id: string
  policyNumber: string
  vehicle: { make: string; model: string; year: number; stockNumber: string }
  customer: { name: string; email: string; phone: string }
  company: { name: string }
  type: string
  startDate: string
  endDate: string
  premium: number
  status: string
}

interface InsuranceClaim {
  id: string
  claimNumber: string
  policy: { policyNumber: string }
  vehicle: { make: string; model: string; year: number }
  customer: { name: string; email: string }
  type: string
  incidentDate: string
  estimatedAmount?: number
  status: string
}

export default function InsuranceManagement() {
  const [companies, setCompanies] = useState<InsuranceCompany[]>([])
  const [policies, setPolicies] = useState<InsurancePolicy[]>([])
  const [claims, setClaims] = useState<InsuranceClaim[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogType, setDialogType] = useState<'company' | 'policy' | 'claim'>('company')

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    contactPerson: '',
    phone: '',
    email: '',
    address: '',
    website: '',
    policyNumber: '',
    vehicleId: '',
    customerId: '',
    companyId: '',
    type: '',
    startDate: new Date(),
    endDate: new Date(),
    premium: 0,
    deductible: 0,
    claimNumber: '',
    policyId: '',
    claimType: '',
    incidentDate: new Date(),
    incidentLocation: '',
    estimatedAmount: 0,
    description: ''
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [companiesRes, policiesRes, claimsRes] = await Promise.all([
        fetch('/api/insurance/companies'),
        fetch('/api/insurance/policies'),
        fetch('/api/insurance/claims')
      ])

      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()
        setCompanies(Array.isArray(companiesData) ? companiesData : [])
      }

      if (policiesRes.ok) {
        const policiesData = await policiesRes.json()
        setPolicies(Array.isArray(policiesData) ? policiesData : (policiesData.policies || []))
      }

      if (claimsRes.ok) {
        const claimsData = await claimsRes.json()
        setClaims(Array.isArray(claimsData) ? claimsData : (claimsData.claims || []))
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const endpoint = dialogType === 'company' 
      ? '/api/insurance/companies'
      : dialogType === 'policy'
      ? '/api/insurance/policies'
      : '/api/insurance/claims'

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        setIsDialogOpen(false)
        setFormData({
          name: '', code: '', contactPerson: '', phone: '', email: '', address: '', website: '',
          policyNumber: '', vehicleId: '', customerId: '', companyId: '', type: '',
          startDate: new Date(), endDate: new Date(), premium: 0, deductible: 0,
          claimNumber: '', policyId: '', claimType: '', incidentDate: new Date(),
          incidentLocation: '', estimatedAmount: 0, description: ''
        })
        fetchData()
      }
    } catch (error) {
      console.error('Error creating record:', error)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      ACTIVE: 'bg-green-100 text-green-800',
      EXPIRED: 'bg-red-100 text-red-800',
      PENDING: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      CANCELLED: 'bg-gray-100 text-gray-800'
    }
    return colors[status] || 'bg-gray-100 text-gray-800'
  }

  const filteredCompanies = Array.isArray(companies) ? companies.filter(company =>
    company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.code.toLowerCase().includes(searchTerm.toLowerCase())
  ) : []

  const filteredPolicies = Array.isArray(policies) ? policies.filter(policy =>
    (policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.vehicle.make.toLowerCase().includes(searchTerm.toLowerCase()) ||
    policy.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || policy.status === statusFilter)
  ) : []

  const filteredClaims = Array.isArray(claims) ? claims.filter(claim =>
    (claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.policy.policyNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    claim.customer.name.toLowerCase().includes(searchTerm.toLowerCase())) &&
    (statusFilter === 'all' || claim.status === statusFilter)
  ) : []

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام التأمين</h1>
          <p className="text-muted-foreground">إدارة شركات التأمين و البوالص و المطالبات</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={() => setDialogType('company')}>
                <Plus className="h-4 w-4 ml-2" />
                شركة تأمين جديدة
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>
                  {dialogType === 'company' && 'إضافة شركة تأمين جديدة'}
                  {dialogType === 'policy' && 'إضافة بوليصة تأمين جديدة'}
                  {dialogType === 'claim' && 'إضافة مطالبة تأمين جديدة'}
                </DialogTitle>
                <DialogDescription>
                  {dialogType === 'company' && 'أدخل بيانات شركة التأمين الجديدة'}
                  {dialogType === 'policy' && 'أدخل بيانات بوليصة التأمين الجديدة'}
                  {dialogType === 'claim' && 'أدخل بيانات المطالبة التأمينية الجديدة'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                {dialogType === 'company' && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">اسم الشركة</Label>
                        <Input
                          id="name"
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="code">كود الشركة</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value})}
                          required
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="contactPerson">الشخص المسؤول</Label>
                        <Input
                          id="contactPerson"
                          value={formData.contactPerson}
                          onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">رقم الهاتف</Label>
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="email">البريد الإلكتروني</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="address">العنوان</Label>
                      <Textarea
                        id="address"
                        value={formData.address}
                        onChange={(e) => setFormData({...formData, address: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="website">الموقع الإلكتروني</Label>
                      <Input
                        id="website"
                        value={formData.website}
                        onChange={(e) => setFormData({...formData, website: e.target.value})}
                      />
                    </div>
                  </>
                )}
                <DialogFooter>
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                    إلغاء
                  </Button>
                  <Button type="submit">حفظ</Button>
                </DialogFooter>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">شركات التأمين</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(companies) ? companies.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {Array.isArray(companies) ? companies.filter(c => c.isActive).length : 0} نشطة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">البوالص النشطة</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(policies) ? policies.filter(p => p.status === 'ACTIVE').length : 0}</div>
            <p className="text-xs text-muted-foreground">
              إجمالي {Array.isArray(policies) ? policies.length : 0} بوليصة
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">المطالبات</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Array.isArray(claims) ? claims.length : 0}</div>
            <p className="text-xs text-muted-foreground">
              {Array.isArray(claims) ? claims.filter(c => c.status === 'PENDING').length : 0} قيد الانتظار
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">قيمة الأقساط</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Array.isArray(policies) ? policies.reduce((sum, p) => sum + (p.premium || 0), 0).toLocaleString('ar-EG') : '0'}
            </div>
            <p className="text-xs text-muted-foreground">
              جنيه مصري
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="بحث..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pr-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">جميع الحالات</SelectItem>
            <SelectItem value="ACTIVE">نشط</SelectItem>
            <SelectItem value="EXPIRED">منتهي</SelectItem>
            <SelectItem value="PENDING">قيد الانتظار</SelectItem>
            <SelectItem value="APPROVED">مقبول</SelectItem>
            <SelectItem value="REJECTED">مرفوض</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="companies" className="space-y-4">
        <TabsList>
          <TabsTrigger value="companies">شركات التأمين</TabsTrigger>
          <TabsTrigger value="policies">البوالص</TabsTrigger>
          <TabsTrigger value="claims">المطالبات</TabsTrigger>
        </TabsList>

        <TabsContent value="companies">
          <Card>
            <CardHeader>
              <CardTitle>شركات التأمين</CardTitle>
              <CardDescription>قائمة شركات التأمين المتعامل معها</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCompanies.map((company) => (
                  <div key={company.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{company.name}</h3>
                        <p className="text-sm text-muted-foreground">الكود: {company.code}</p>
                        {company.contactPerson && (
                          <p className="text-sm text-muted-foreground">
                            المسؤول: {company.contactPerson}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={company.isActive ? 'default' : 'secondary'}>
                        {company.isActive ? 'نشط' : 'غير نشط'}
                      </Badge>
                      {company.phone && (
                        <span className="text-sm text-muted-foreground">{company.phone}</span>
                      )}
                    </div>
                  </div>
                ))}
                {filteredCompanies.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد شركات تأمين
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="policies">
          <Card>
            <CardHeader>
              <CardTitle>بوالص التأمين</CardTitle>
              <CardDescription>قائمة بوالص التأمين المسجلة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPolicies.map((policy) => (
                  <div key={policy.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{policy.policyNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          {policy.vehicle.make} {policy.vehicle.model} {policy.vehicle.year}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          العميل: {policy.customer.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          الشركة: {policy.company.name}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(policy.status)}>
                        {policy.status}
                      </Badge>
                      <p className="text-sm font-medium mt-1">
                        {policy.premium.toLocaleString('ar-EG')} ج.م
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(policy.startDate), 'dd/MM/yyyy')} - {format(new Date(policy.endDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
                {filteredPolicies.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد بوالص تأمين
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="claims">
          <Card>
            <CardHeader>
              <CardTitle>المطالبات التأمينية</CardTitle>
              <CardDescription>قائمة المطالبات التأمينية المسجلة</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredClaims.map((claim) => (
                  <div key={claim.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div>
                        <h3 className="font-semibold">{claim.claimNumber}</h3>
                        <p className="text-sm text-muted-foreground">
                          البوليصة: {claim.policy.policyNumber}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {claim.vehicle.make} {claim.vehicle.model} {claim.vehicle.year}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          العميل: {claim.customer.name}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          النوع: {claim.type}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge className={getStatusColor(claim.status)}>
                        {claim.status}
                      </Badge>
                      {claim.estimatedAmount && (
                        <p className="text-sm font-medium mt-1">
                          {claim.estimatedAmount.toLocaleString('ar-EG')} ج.م
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground">
                        {format(new Date(claim.incidentDate), 'dd/MM/yyyy')}
                      </p>
                    </div>
                  </div>
                ))}
                {filteredClaims.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    لا توجد مطالبات تأمينية
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}