'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Users, 
  TrendingUp, 
  Target, 
  MessageSquare, 
  Plus,
  Search,
  Filter,
  Star,
  Phone,
  Mail,
  Calendar,
  Activity,
  Tag,
  LifeBuoy,
  Eye,
  Edit
} from 'lucide-react'
import Link from 'next/link'

interface CRMOverview {
  totalCustomers: number
  activeLeads: number
  conversionRate: number
  averageSatisfaction: number
  totalInteractions: number
  pendingFollowUps: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone?: string
  segment: string
  status: string
  lastContactDate?: string
  totalSpent: number
  satisfactionScore?: number
}

interface Interaction {
  id: string
  customerId: string
  customerName: string
  type: string
  title: string
  date: string
  outcome: string
  priority: string
}

export default function CRMPage() {
  const [overview, setOverview] = useState<CRMOverview | null>(null)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [interactions, setInteractions] = useState<Interaction[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    fetchCRMData()
  }, [])

  const fetchCRMData = async () => {
    try {
      // Fetch overview data
      const overviewResponse = await fetch('/api/crm/overview')
      if (overviewResponse.ok) {
        const overviewData = await overviewResponse.json()
        setOverview(overviewData)
      }

      // Fetch customers
      const customersResponse = await fetch('/api/crm/customers')
      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        setCustomers(customersData.customers || [])
      }

      // Fetch recent interactions
      const interactionsResponse = await fetch('/api/crm/interactions')
      if (interactionsResponse.ok) {
        const interactionsData = await interactionsResponse.json()
        setInteractions(interactionsData.interactions || [])
      }
    } catch (error) {
      console.error('Error fetching CRM data:', error)
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

  const getSegmentBadge = (segment: string) => {
    const segmentConfig = {
      LEAD: { label: 'عميل محتمل', variant: 'secondary' as const },
      PROSPECT: { label: 'عميل مرشح', variant: 'outline' as const },
      CUSTOMER: { label: 'عميل', variant: 'default' as const },
      VIP: { label: 'عميل مميز', variant: 'default' as const },
      INACTIVE: { label: 'غير نشط', variant: 'secondary' as const },
      LOST: { label: 'فقد', variant: 'destructive' as const }
    }

    const config = segmentConfig[segment as keyof typeof segmentConfig] || { label: segment, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: 'نشط', variant: 'default' as const },
      inactive: { label: 'غير نشط', variant: 'secondary' as const },
      prospect: { label: 'مرشح', variant: 'outline' as const }
    }

    const config = statusConfig[status as keyof typeof statusConfig] || { label: status, variant: 'secondary' as const }
    return <Badge variant={config.variant}>{config.label}</Badge>
  }

  const getInteractionTypeIcon = (type: string) => {
    const iconMap = {
      CALL: Phone,
      EMAIL: Mail,
      MEETING: Calendar,
      SMS: MessageSquare,
      SOCIAL_MEDIA: Activity,
      WEBSITE_VISIT: Activity,
      TEST_DRIVE: Activity,
      SERVICE_VISIT: Activity,
      PURCHASE: Target,
      FOLLOW_UP: LifeBuoy
    }
    
    const Icon = iconMap[type as keyof typeof iconMap] || Activity
    return <Icon className="h-4 w-4" />
  }

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
          <h1 className="text-3xl font-bold text-gray-900 mb-2">إدارة علاقات العملاء</h1>
          <p className="text-gray-600">إدارة العملاء والتفاعلات والتسويق</p>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="customers">العملاء</TabsTrigger>
            <TabsTrigger value="interactions">التفاعلات</TabsTrigger>
            <TabsTrigger value="segments">الشرائح</TabsTrigger>
            <TabsTrigger value="automation">التشغيل الآلي</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* CRM Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {overview?.totalCustomers || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">العملاء المسجلين</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">العملاء المحتملين</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {overview?.activeLeads || 0}
                  </div>
                  <p className="text-xs text-muted-foreground">نشطون حالياً</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل التحويل</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {overview?.conversionRate || 0}%
                  </div>
                  <p className="text-xs text-muted-foreground">هذا الشهر</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">رضا العملاء</CardTitle>
                  <Star className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {overview?.averageSatisfaction || 0}/5
                  </div>
                  <p className="text-xs text-muted-foreground">متوسط التقييم</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>آخر التفاعلات</CardTitle>
                  <CardDescription>أحدث التفاعلات مع العملاء</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {interactions.slice(0, 5).map((interaction) => (
                      <div key={interaction.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <div className="flex-shrink-0">
                          {getInteractionTypeIcon(interaction.type)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 truncate">
                            {interaction.title}
                          </p>
                          <p className="text-sm text-gray-500">
                            {interaction.customerName}
                          </p>
                        </div>
                        <div className="text-xs text-gray-400">
                          {new Date(interaction.date).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>العملاء الأكثر قيمة</CardTitle>
                  <CardDescription>العملاء الذين ينفقون أكثر</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {customers
                      .sort((a, b) => b.totalSpent - a.totalSpent)
                      .slice(0, 5)
                      .map((customer) => (
                        <div key={customer.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {customer.name}
                            </p>
                            <p className="text-sm text-gray-500">
                              {customer.email}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-green-600">
                              {formatCurrency(customer.totalSpent)}
                            </p>
                            {getSegmentBadge(customer.segment)}
                          </div>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>إجراءات سريعة</CardTitle>
                <CardDescription>الوصول السريع إلى وظائف CRM الشائعة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <Link href="/crm/customers/create">
                    <Button className="w-full" variant="default">
                      <Plus className="ml-2 h-4 w-4" />
                      عميل جديد
                    </Button>
                  </Link>
                  <Link href="/crm/interactions/create">
                    <Button className="w-full" variant="outline">
                      <MessageSquare className="ml-2 h-4 w-4" />
                      تسجيل تفاعل
                    </Button>
                  </Link>
                  <Link href="/crm/campaigns">
                    <Button className="w-full" variant="outline">
                      <Target className="ml-2 h-4 w-4" />
                      حملة تسويقية
                    </Button>
                  </Link>
                  <Link href="/crm/reports">
                    <Button className="w-full" variant="outline">
                      <TrendingUp className="ml-2 h-4 w-4" />
                      تقارير CRM
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Customers Tab */}
          <TabsContent value="customers" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>العملاء</CardTitle>
                    <CardDescription>إدارة قاعدة بيانات العملاء</CardDescription>
                  </div>
                  <Link href="/crm/customers/create">
                    <Button>
                      <Plus className="ml-2 h-4 w-4" />
                      عميل جديد
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-4 mb-6">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <input
                      type="text"
                      placeholder="بحث في العملاء..."
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                  <Button variant="outline" size="sm">
                    <Filter className="ml-2 h-4 w-4" />
                    تصفية
                  </Button>
                  <Button variant="outline" size="sm">
                    <Tag className="ml-2 h-4 w-4" />
                    وسوم
                  </Button>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">العميل</th>
                        <th className="text-right py-3 px-4">البريد الإلكتروني</th>
                        <th className="text-right py-3 px-4">الهاتف</th>
                        <th className="text-right py-3 px-4">الشريحة</th>
                        <th className="text-right py-3 px-4">إجمالي الإنفاق</th>
                        <th className="text-right py-3 px-4">التقييم</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customers.map((customer) => (
                        <tr key={customer.id} className="border-b hover:bg-gray-50">
                          <td className="text-right py-3 px-4">
                            <div>
                              <p className="font-medium">{customer.name}</p>
                              {getStatusBadge(customer.status)}
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">{customer.email}</td>
                          <td className="text-right py-3 px-4">{customer.phone || '-'}</td>
                          <td className="text-right py-3 px-4">
                            {getSegmentBadge(customer.segment)}
                          </td>
                          <td className="text-right py-3 px-4 font-medium">
                            {formatCurrency(customer.totalSpent)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {customer.satisfactionScore ? (
                              <div className="flex items-center">
                                <Star className="h-4 w-4 text-yellow-400 ml-1" />
                                <span>{customer.satisfactionScore}/5</span>
                              </div>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <MessageSquare className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
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

          {/* Interactions Tab */}
          <TabsContent value="interactions" className="space-y-6">
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>التفاعلات</CardTitle>
                    <CardDescription>تتبع جميع تفاعلات العملاء</CardDescription>
                  </div>
                  <Link href="/crm/interactions/create">
                    <Button>
                      <Plus className="ml-2 h-4 w-4" />
                      تفاعل جديد
                    </Button>
                  </Link>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <MessageSquare className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
                  <p className="text-gray-500 mb-4">نحن نعمل على تطوير نظام إدارة التفاعلات</p>
                  <Button variant="outline">تعلم المزيد</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Segments Tab */}
          <TabsContent value="segments" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>شرائح العملاء</CardTitle>
                <CardDescription>إدارة وتصنيف شرائح العملاء المختلفة</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Users className="h-8 w-8 text-blue-600 mb-2" />
                      <CardTitle className="text-lg">العملاء المحتملين</CardTitle>
                      <CardDescription>العملاء الجدد المحتملين</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Star className="h-8 w-8 text-yellow-600 mb-2" />
                      <CardTitle className="text-lg">العملاء المميزين</CardTitle>
                      <CardDescription>العملاء ذو القيمة العالية</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <LifeBuoy className="h-8 w-8 text-green-600 mb-2" />
                      <CardTitle className="text-lg">العملاء القدامى</CardTitle>
                      <CardDescription>العملاء المخلصين</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Activity className="h-8 w-8 text-purple-600 mb-2" />
                      <CardTitle className="text-lg">العملاء النشطين</CardTitle>
                      <CardDescription>العملاء ذو النشاط العالي</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Target className="h-8 w-8 text-red-600 mb-2" />
                      <CardTitle className="text-lg">العملاء المستهدفين</CardTitle>
                      <CardDescription>العملاء المستهدفين للحملات</CardDescription>
                    </CardHeader>
                  </Card>

                  <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <Tag className="h-8 w-8 text-indigo-600 mb-2" />
                      <CardTitle className="text-lg">شريحة مخصصة</CardTitle>
                      <CardDescription>إنشاء شريحة جديدة</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Automation Tab */}
          <TabsContent value="automation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>التشغيل الآلي للتسويق</CardTitle>
                <CardDescription>إدارة الحملات التسويقية الآلية</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Activity className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">قريباً</h3>
                  <p className="text-gray-500 mb-4">نحن نعمل على تطوير نظام التشغيل الآلي</p>
                  <Button variant="outline">تعلم المزيد</Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}