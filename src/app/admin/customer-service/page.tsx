'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
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
  Ticket, 
  Users, 
  Star, 
  AlertTriangle, 
  BookOpen, 
  TrendingUp,
  Search,
  Filter,
  Plus,
  Eye,
  Edit,
  MessageSquare,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react'

interface SupportTicket {
  id: string
  ticketNumber: string
  subject: string
  category: string
  priority: string
  status: string
  customer: {
    id: string
    name: string
    email: string
  }
  assignee?: {
    id: string
    name: string
  }
  createdAt: string
  updatedAt: string
}

interface ServiceEvaluation {
  id: string
  overallRating: number
  serviceType: string
  customer: {
    id: string
    name: string
  }
  status: string
  createdAt: string
}

interface Complaint {
  id: string
  complaintNumber: string
  subject: string
  category: string
  severity: string
  status: string
  customer: {
    id: string
    name: string
  }
  createdAt: string
}

interface DashboardStats {
  totalTickets: number
  openTickets: number
  resolvedTickets: number
  avgResolutionTime: number
  totalEvaluations: number
  avgRating: number
  totalComplaints: number
  resolvedComplaints: number
}

const priorityColors = {
  LOW: 'bg-green-100 text-green-800',
  MEDIUM: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  URGENT: 'bg-red-100 text-red-800',
  CRITICAL: 'bg-red-200 text-red-900'
}

const statusColors = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-yellow-100 text-yellow-800',
  PENDING_CUSTOMER: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  CLOSED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800'
}

export default function CustomerServicePage() {
  const { status } = useSession()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState('tickets')
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [evaluations, setEvaluations] = useState<ServiceEvaluation[]>([])
  const [complaints, setComplaints] = useState<Complaint[]>([])
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.replace('/login')
    }
  }, [status, router])

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true)
      
      // Fetch tickets
      const ticketsRes = await fetch('/api/customer-service/tickets')
      if (ticketsRes.ok) {
        const ticketsData = await ticketsRes.json()
        setTickets(ticketsData)
      }

      // Fetch evaluations
      const evalRes = await fetch('/api/customer-service/evaluations')
      if (evalRes.ok) {
        const evalData = await evalRes.json()
        setEvaluations(evalData)
      }

      // Fetch complaints
      const complaintsRes = await fetch('/api/customer-service/complaints')
      if (complaintsRes.ok) {
        const complaintsData = await complaintsRes.json()
        setComplaints(complaintsData)
      }

      // Fetch stats
      const statsRes = await fetch('/api/customer-service/stats')
      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (status !== 'authenticated') {
      return
    }

    fetchDashboardData()
  }, [status, fetchDashboardData])

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || ticket.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredEvaluations = evaluations.filter(evaluation => {
    const matchesSearch = evaluation.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || evaluation.status === statusFilter
    return matchesSearch && matchesStatus
  })

  const filteredComplaints = complaints.filter(complaint => {
    const matchesSearch = complaint.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         complaint.customer.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || complaint.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (status === 'loading' || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام خدمة العملاء</h1>
          <p className="text-muted-foreground">إدارة تذاكر الدعم، التقييمات، والشكاوى</p>
        </div>
        <div className="flex gap-2">
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            تذكرة جديدة
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">إجمالي التذاكر</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTickets}</div>
              <p className="text-xs text-muted-foreground">
                {stats.openTickets} مفتوح
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط التقييم</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{(stats.avgRating || 0).toFixed(1)}</div>
              <p className="text-xs text-muted-foreground">
                من {stats.totalEvaluations} تقييم
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">الشكاوى</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalComplaints}</div>
              <p className="text-xs text-muted-foreground">
                {stats.resolvedComplaints} تم حلها
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">متوسط وقت الحل</CardTitle>
              <Clock className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.avgResolutionTime}h</div>
              <p className="text-xs text-muted-foreground">
                متوسط الوقت
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
            <SelectItem value="OPEN">مفتوح</SelectItem>
            <SelectItem value="IN_PROGRESS">قيد المعالجة</SelectItem>
            <SelectItem value="RESOLVED">تم الحل</SelectItem>
            <SelectItem value="CLOSED">مغلق</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets">تذاكر الدعم</TabsTrigger>
          <TabsTrigger value="evaluations">التقييمات</TabsTrigger>
          <TabsTrigger value="complaints">الشكاوى</TabsTrigger>
        </TabsList>

        <TabsContent value="tickets" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تذاكر الدعم الفني</CardTitle>
              <CardDescription>إدارة تذاكر الدعم ومتابعة حل المشاكل</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم التذكرة</TableHead>
                    <TableHead>الموضوع</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>التصنيف</TableHead>
                    <TableHead>الأولوية</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>المسند إليه</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTickets.map((ticket) => (
                    <TableRow key={ticket.id}>
                      <TableCell className="font-medium">{ticket.ticketNumber}</TableCell>
                      <TableCell>{ticket.subject}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {ticket.customer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {ticket.customer.name}
                        </div>
                      </TableCell>
                      <TableCell>{ticket.category}</TableCell>
                      <TableCell>
                        <Badge className={priorityColors[ticket.priority as keyof typeof priorityColors]}>
                          {ticket.priority}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[ticket.status as keyof typeof statusColors]}>
                          {ticket.status}
                        </Badge>
                      </TableCell>
                      <TableCell>{ticket.assignee?.name || '-'}</TableCell>
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

        <TabsContent value="evaluations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>تقييمات الخدمة</CardTitle>
              <CardDescription>تقييمات العملاء عن جودة الخدمة المقدمة</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>التقييم</TableHead>
                    <TableHead>نوع الخدمة</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEvaluations.map((evaluation) => (
                    <TableRow key={evaluation.id}>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < evaluation.overallRating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                          <span className="ml-2 text-sm">{evaluation.overallRating}</span>
                        </div>
                      </TableCell>
                      <TableCell>{evaluation.serviceType}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {evaluation.customer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {evaluation.customer.name}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant={evaluation.status === 'PUBLISHED' ? 'default' : 'secondary'}>
                          {evaluation.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(evaluation.createdAt), 'dd/MM/yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
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

        <TabsContent value="complaints" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>الشكاوى</CardTitle>
              <CardDescription>إدارة شكاوى العملاء ومتابعة حلها</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>رقم الشكوى</TableHead>
                    <TableHead>الموضوع</TableHead>
                    <TableHead>العميل</TableHead>
                    <TableHead>التصنيف</TableHead>
                    <TableHead>الشدة</TableHead>
                    <TableHead>الحالة</TableHead>
                    <TableHead>التاريخ</TableHead>
                    <TableHead>الإجراءات</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell className="font-medium">{complaint.complaintNumber}</TableCell>
                      <TableCell>{complaint.subject}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarFallback>
                              {complaint.customer.name.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          {complaint.customer.name}
                        </div>
                      </TableCell>
                      <TableCell>{complaint.category}</TableCell>
                      <TableCell>
                        <Badge 
                          variant={
                            complaint.severity === 'CRITICAL' || complaint.severity === 'HIGH'
                              ? 'destructive'
                              : complaint.severity === 'MEDIUM'
                              ? 'default'
                              : 'secondary'
                          }
                        >
                          {complaint.severity}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Badge className={statusColors[complaint.status as keyof typeof statusColors]}>
                          {complaint.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {format(new Date(complaint.createdAt), 'dd/MM/yyyy', { locale: ar })}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button variant="ghost" size="sm">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="sm">
                            <MessageSquare className="h-4 w-4" />
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