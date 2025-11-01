'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'
import { 
  Megaphone, 
  Users, 
  Target, 
  TrendingUp, 
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  Mail,
  Phone,
  Calendar,
  DollarSign,
  Activity,
  BarChart3
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: string
  status: string
  startDate: string
  endDate?: string
  budget?: number
  creator: {
    id: string
    name: string
  }
  membersCount: number
  leadsCount: number
}

interface Lead {
  id: string
  leadNumber: string
  firstName: string
  lastName?: string
  email?: string
  phone?: string
  company?: string
  source: string
  status: string
  priority: string
  estimatedValue?: number
  assignedTo?: {
    id: string
    name: string
  }
  createdAt: string
}

interface SalesTarget {
  id: string
  name: string
  type: string
  targetValue: number
  progress: number
  status: string
  period: string
  assignedTo: {
    id: string
    name: string
  }
  startDate: string
  endDate: string
}

interface DashboardStats {
  totalCampaigns: number
  activeCampaigns: number
  totalLeads: number
  qualifiedLeads: number
  conversionRate: number
  totalTargets: number
  achievedTargets: number
  revenueGenerated: number
}

const statusColors = {
  DRAFT: 'bg-gray-100 text-gray-800',
  SCHEDULED: 'bg-blue-100 text-blue-800',
  ACTIVE: 'bg-green-100 text-green-800',
  PAUSED: 'bg-yellow-100 text-yellow-800',
  COMPLETED: 'bg-purple-100 text-purple-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

const leadStatusColors = {
  NEW: 'bg-blue-100 text-blue-800',
  CONTACTED: 'bg-yellow-100 text-yellow-800',
  QUALIFIED: 'bg-green-100 text-green-800',
  PROPOSAL: 'bg-purple-100 text-purple-800',
  NEGOTIATION: 'bg-orange-100 text-orange-800',
  CLOSED_WON: 'bg-green-200 text-green-900',
  CLOSED_LOST: 'bg-red-100 text-red-800',
  ON_HOLD: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-200 text-red-900'
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800'
}

export default function MarketingSalesPage() {
  const { data: session, status } = useSession()
  const [activeTab, setActiveTab] = useState('campaigns')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [leads, setLeads] = useState<Lead[]>([])
  const [targets, setTargets] = useState<SalesTarget[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      redirect('/login')
    }
    
    if (status === 'authenticated') {
      fetchDashboardData()
    }
  }, [status])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Fetch campaigns with error handling
      try {
        const campaignsRes = await fetch('/api/marketing-sales/campaigns')
        if (campaignsRes.ok) {
          const campaignsData = await campaignsRes.json()
          setCampaigns(Array.isArray(campaignsData) ? campaignsData : [])
        } else {
          console.warn('Campaigns API returned error:', campaignsRes.status)
          setCampaigns([])
        }
      } catch (error) {
        console.warn('Error fetching campaigns:', error)
        setCampaigns([])
      }

      // Fetch leads with error handling
      try {
        const leadsRes = await fetch('/api/marketing-sales/leads')
        if (leadsRes.ok) {
          const leadsData = await leadsRes.json()
          // Handle both array and object with leads property
          const leadsArray = Array.isArray(leadsData) ? leadsData : (leadsData.leads || [])
          setLeads(leadsArray)
        } else {
          console.warn('Leads API returned error:', leadsRes.status)
          setLeads([])
        }
      } catch (error) {
        console.warn('Error fetching leads:', error)
        setLeads([])
      }

      // Fetch targets with error handling
      try {
        const targetsRes = await fetch('/api/marketing-sales/targets')
        if (targetsRes.ok) {
          const targetsData = await targetsRes.json()
          setTargets(Array.isArray(targetsData) ? targetsData : [])
        } else {
          console.warn('Targets API returned error:', targetsRes.status)
          setTargets([])
        }
      } catch (error) {
        console.warn('Error fetching targets:', error)
        setTargets([])
      }

      // Fetch stats with error handling
      try {
        const statsRes = await fetch('/api/marketing-sales/stats')
        if (statsRes.ok) {
          const statsData = await statsRes.json()
          setStats(statsData)
        } else {
          console.warn('Stats API returned error:', statsRes.status)
          setStats({
            totalCampaigns: 0,
            activeCampaigns: 0,
            totalLeads: 0,
            qualifiedLeads: 0,
            conversionRate: 0,
            totalTargets: 0,
            achievedTargets: 0,
            revenueGenerated: 0
          })
        }
      } catch (error) {
        console.warn('Error fetching stats:', error)
        setStats({
          totalCampaigns: 0,
          activeCampaigns: 0,
          totalLeads: 0,
          qualifiedLeads: 0,
          conversionRate: 0,
          totalTargets: 0,
          achievedTargets: 0,
          revenueGenerated: 0
        })
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      // Set default values on any error
      setCampaigns([])
      setLeads([])
      setTargets([])
      setStats({
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalLeads: 0,
        qualifiedLeads: 0,
        conversionRate: 0,
        totalTargets: 0,
        achievedTargets: 0,
        revenueGenerated: 0
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredCampaigns = campaigns.filter(campaign => {
    if (!campaign || !campaign.name) return false
    const matchesSearch = campaign.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || campaign.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredLeads = leads.filter(lead => {
    if (!lead || !lead.firstName) return false
    const matchesSearch = 
      lead.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (lead.lastName && lead.lastName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.email && lead.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (lead.company && lead.company.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || lead.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredTargets = targets.filter(target => {
    if (!target || !target.name) return false
    const matchesSearch = target.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || target.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام التسويق والمبيعات</h1>
          <p className="text-muted-foreground">إدارة الحملات التسويقية، العملاء المحتملين، وأهداف المبيعات</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            حملة جديدة
          </Button>
          <Button variant="outline">
            <Plus className="ml-2 h-4 w-4" />
            عميل محتمل
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الحملات التسويقية</CardTitle>
              <Megaphone className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCampaigns}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeCampaigns} نشطة
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">العملاء المحتملون</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalLeads}</div>
              <p className="text-xs text-muted-foreground">
                {stats.qualifiedLeads} مؤهلين
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.conversionRate || 0).toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">
                متوسط التحويل
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الإيرادات</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {stats.revenueGenerated.toLocaleString('ar-EG')} ج.م
              </div>
              <p className="text-xs text-muted-foreground">
                إجمالي الإيرادات
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
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
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="الحالة" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">الكل</SelectItem>
            <SelectItem value="ACTIVE">نشط</SelectItem>
            <SelectItem value="DRAFT">مسودة</SelectItem>
            <SelectItem value="COMPLETED">مكتمل</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="campaigns">الحملات التسويقية</TabsTrigger>
          <TabsTrigger value="leads">العملاء المحتملون</TabsTrigger>
          <TabsTrigger value="targets">أهداف المبيعات</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الحملات التسويقية</CardTitle>
              <CardDescription>إدارة ومتابعة الحملات التسويقية</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>اسم الحملة</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>تاريخ البدء</TableHead>
                    <TableHead>الميزانية</TableHead>
                    <TableHead>الأعضاء</TableHead>
                    <TableHead>العملاء المحتملون</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCampaigns.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        لا توجد حملات تسويقية
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredCampaigns.map((campaign) => (
                      <TableRow key={campaign.id}>
                        <TableCell className="font-medium">{campaign.name || '-'}</TableCell>
                        <TableCell>{campaign.type || '-'}</TableCell>
                        <TableCell>
                          <Badge className={statusColors[campaign.status as keyof typeof statusColors] || 'bg-gray-100 text-gray-800'}>
                            {campaign.status || 'UNKNOWN'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {campaign.startDate ? format(new Date(campaign.startDate), 'dd/MM/yyyy', { locale: ar }) : '-'}
                        </TableCell>
                        <TableCell>
                          {campaign.budget ? `${campaign.budget.toLocaleString('ar-EG')} ج.م` : '-'}
                        </TableCell>
                        <TableCell>{campaign.membersCount || 0}</TableCell>
                        <TableCell>{campaign.leadsCount || 0}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="leads" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>العملاء المحتملون</CardTitle>
              <CardDescription>إدارة العملاء المحتملين ومتابعة تحويلهم</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الرقم</TableHead>
                    <TableHead>الاسم</TableHead>
                    <TableHead>الشركة</TableHead>
                    <TableHead>جهة الاتصال</TableHead>
                    <TableHead>المصدر</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الأولوية</TableHead>
                    <TableHead>القيمة المقدرة</TableHead>
                    <TableHead>المسند إليه</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads.map((lead) => (
                    <TableRow key={lead.id}>
                      <TableCell className="font-medium">{lead.leadNumber}</TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium">
                            {lead.firstName} {lead.lastName}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{lead.company || '-'}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {lead.email && (
                            <div className="flex items-center gap-1 text-sm">
                              <Mail className="h-3 w-3" />
                              {lead.email}
                            </div>
                          )}
                          {lead.phone && (
                            <div className="flex items-center gap-1 text-sm">
                              <Phone className="h-3 w-3" />
                              {lead.phone}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>{lead.source}</TableCell>
                      <TableCell>
                        <Badge className={leadStatusColors[lead.status as keyof typeof leadStatusColors]}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={priorityColors[lead.priority as keyof typeof priorityColors]}>
                          {lead.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {lead.estimatedValue ? `${lead.estimatedValue.toLocaleString('ar-EG')} ج.م` : '-'}
                      </TableCell>
                      <TableCell>{lead.assignedTo?.name || '-'}</TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="targets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>أهداف المبيعات</CardTitle>
              <CardDescription>متابعة أهداف المبيعات وإنجازات الفريق</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>الهدف</TableHead>
                    <TableHead>النوع</TableHead>
                    <TableHead>القيمة المستهدفة</TableHead>
                    <TableHead>التقدم</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>الفترة</TableHead>
                    <TableHead>المسند إليه</TableHead>
                    <TableHead>تاريخ الانتهاء</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTargets.map((target) => (
                    <TableRow key={target.id}>
                      <TableCell className="font-medium">{target.name}</TableCell>
                      <TableCell>{target.type}</TableCell>
                      <TableCell>
                        {target.type === 'REVENUE' 
                          ? `${target.targetValue.toLocaleString('ar-EG')} ج.م`
                          : target.targetValue
                        }
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-blue-600 h-2 rounded-full" 
                              style={{ width: `${Math.min(target.progress, 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium">
                            {(target.progress || 0).toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            target.status === 'COMPLETED' 
                              ? 'default'
                              : target.status === 'ACTIVE'
                              ? 'secondary'
                              : 'outline'
                          }
                        >
                          {target.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{target.period}</TableCell>
                      <TableCell>{target.assignedTo.name}</TableCell>
                      <TableCell>
                        {format(new Date(target.endDate), 'dd/MM/yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <BarChart3 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}