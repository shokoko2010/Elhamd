'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  Calendar, 
  Car, 
  Star,
  TrendingUp,
  AlertTriangle,
  Plus,
  Filter,
  Target,
  MessageSquare,
  Award,
  Gift,
  BarChart3,
  Settings,
  Zap,
  Crown,
  Sparkles,
  Activity,
  Users as Segmentation,
  MailCheck,
  Scale
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

// Enhanced interfaces for new CRM features
interface LeadScore {
  customerId: string
  score: number
  maxScore: number
  percentage: number
  level: 'hot' | 'warm' | 'cold'
  factors: {
    category: string
    score: number
    maxScore: number
    details: string[]
  }[]
  recommendations: string[]
}

interface EmailCampaign {
  id: string
  name: string
  subject: string
  status: 'draft' | 'scheduled' | 'sending' | 'sent' | 'paused'
  totalRecipients: number
  openedCount: number
  clickedCount: number
  sentAt?: Date
  scheduledAt?: Date
}

interface CustomerSegment {
  id: string
  name: string
  description: string
  customerCount: number
  avgSpent: number
  isDynamic: boolean
  autoUpdate: boolean
  rules: any[]
}

interface LoyaltyTier {
  id: string
  name: string
  minPoints: number
  benefits: string[]
  color: string
  icon: string
}

interface CustomerLoyalty {
  customerId: string
  points: number
  tier: string
  tierProgress: number
  rewardsClaimed: number
  streak: number
}

interface Customer {
  id: string
  name: string
  email: string
  phone: string
  status: 'active' | 'inactive' | 'prospect'
  segment: string
  totalSpent: number
  bookingCount: number
  lastVisit: string
  leadScore?: number
  loyaltyPoints?: number
}

export default function EnhancedCRMDashboard() {
  return (
    <AdminRoute>
      <EnhancedCRMContent />
    </AdminRoute>
  )
}

function EnhancedCRMContent() {
  const [activeTab, setActiveTab] = useState('overview')
  const [loading, setLoading] = useState(true)
  const [customers, setCustomers] = useState<Customer[]>([])
  const [leadScores, setLeadScores] = useState<LeadScore[]>([])
  const [campaigns, setEmailCampaigns] = useState<EmailCampaign[]>([])
  const [segments, setSegments] = useState<CustomerSegment[]>([])
  const [loyaltyTiers, setLoyaltyTiers] = useState<LoyaltyTier[]>([])
  const [loyaltyData, setLoyaltyData] = useState<any>({})
  const [searchTerm, setSearchTerm] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchCRMData()
  }, [])

  const fetchCRMData = async () => {
    try {
      setLoading(true)
      
      // Fetch customers
      const customersResponse = await fetch('/api/crm/customers')
      if (customersResponse.ok) {
        const customersData = await customersResponse.json()
        setCustomers(Array.isArray(customersData.customers) ? customersData.customers : [])
      }

      // Fetch lead scoring overview
      const leadScoringResponse = await fetch('/api/crm/lead-scoring')
      if (leadScoringResponse.ok) {
        const leadScoringData = await leadScoringResponse.json()
        // Process lead scoring data
      }

      // Fetch email campaigns
      const emailResponse = await fetch('/api/crm/email-marketing?type=campaigns')
      if (emailResponse.ok) {
        const campaignsData = await emailResponse.json()
        setEmailCampaigns(campaigns)
      }

      // Fetch advanced segments
      const segmentsResponse = await fetch('/api/crm/advanced-segments?type=segments')
      if (segmentsResponse.ok) {
        const segmentsData = await segmentsResponse.json()
        setSegments(segmentsData)
      }

      // Fetch loyalty data
      const loyaltyResponse = await fetch('/api/crm/loyalty')
      if (loyaltyResponse.ok) {
        const loyaltyData = await loyaltyResponse.json()
        setLoyaltyData(loyaltyData)
      }

      // Fetch loyalty tiers
      const tiersResponse = await fetch('/api/crm/loyalty?type=tiers')
      if (tiersResponse.ok) {
        const tiersData = await tiersResponse.json()
        setLoyaltyTiers(tiersData)
      }

    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load CRM data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const getLeadScoreColor = (level: string) => {
    switch (level) {
      case 'hot': return 'bg-red-100 text-red-800 border-red-200'
      case 'warm': return 'bg-yellow-100 text-yellow-800 border-yellow-200'
      case 'cold': return 'bg-blue-100 text-blue-800 border-blue-200'
      default: return 'bg-gray-100 text-gray-800 border-gray-200'
    }
  }

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'sent': return 'bg-green-100 text-green-800'
      case 'sending': return 'bg-blue-100 text-blue-800'
      case 'scheduled': return 'bg-yellow-100 text-yellow-800'
      case 'paused': return 'bg-orange-100 text-orange-800'
      case 'draft': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
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

  const crmStats = {
    totalCustomers: customers.length,
    activeCustomers: customers.filter(c => c.status === 'active').length,
    avgLeadScore: 65,
    totalCampaigns: campaigns.length,
    activeCampaigns: campaigns.filter(c => c.status === 'sending' || c.status === 'scheduled').length,
    totalSegments: segments.length,
    loyaltyMembers: loyaltyData.totalMembers || 0,
    avgLoyaltyPoints: loyaltyData.avgPointsPerMember || 0
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام إدارة علاقات العملاء المتقدم (CRM)</h1>
          <p className="text-gray-600 mt-2">إدارة شاملة للعملاء مع تحليلات متقدمة وأتمتة</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline">
            <Settings className="ml-2 h-4 w-4" />
            الإعدادات
          </Button>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            إضافة عميل جديد
          </Button>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي العملاء</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmStats.totalCustomers}</div>
            <p className="text-xs text-muted-foreground">
              {crmStats.activeCustomers} نشطون
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط تقييم العملاء</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmStats.avgLeadScore}%</div>
            <p className="text-xs text-muted-foreground">
              متوسط التقييم
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الحملات البريدية</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmStats.totalCampaigns}</div>
            <p className="text-xs text-muted-foreground">
              {crmStats.activeCampaigns} نشطة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">أعضاء الولاء</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{crmStats.loyaltyMembers}</div>
            <p className="text-xs text-muted-foreground">
              متوسط {crmStats.avgLoyaltyPoints} نقطة
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
          <TabsTrigger value="customers">العملاء</TabsTrigger>
          <TabsTrigger value="lead-scoring">تقييم العملاء</TabsTrigger>
          <TabsTrigger value="email-marketing">التسويق البريدي</TabsTrigger>
          <TabsTrigger value="segments">التجزئة</TabsTrigger>
          <TabsTrigger value="loyalty">الولاء</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  النشاط الحديث
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                      <Target className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">تحديث تقييم العميل</p>
                      <p className="text-xs text-gray-600">أحمد محمد - تصنيف: Hot</p>
                    </div>
                    <span className="text-xs text-gray-500">منذ 2 ساعة</span>
                  </div>
                  
                  <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="w-4 h-4 text-green-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">إرسال حملة بريدية</p>
                      <p className="text-xs text-gray-600">عرض سيارات تاتا - 1250 مستلم</p>
                    </div>
                    <span className="text-xs text-gray-500">منذ 5 ساعات</span>
                  </div>

                  <div className="flex items-center gap-3 p-3 bg-purple-50 rounded-lg">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center">
                      <Award className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">ترقية مستوى الولاء</p>
                      <p className="text-xs text-gray-600">فاطمة علي - مستوى فضي</p>
                    </div>
                    <span className="text-xs text-gray-500">منذ يوم</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  إجراءات سريعة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  <Button variant="outline" className="h-20 flex-col">
                    <Target className="h-6 w-6 mb-2" />
                    <span className="text-sm">حساب التقييمات</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <MessageSquare className="h-6 w-6 mb-2" />
                    <span className="text-sm">حملة بريدية</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Segmentation className="h-6 w-6 mb-2" />
                    <span className="text-sm">تجزئة العملاء</span>
                  </Button>
                  <Button variant="outline" className="h-20 flex-col">
                    <Award className="h-6 w-6 mb-2" />
                    <span className="text-sm">برنامج الولاء</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Performance Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  أداء التقييم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>عملاء Hot</span>
                      <span>25%</span>
                    </div>
                    <Progress value={25} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>عملاء Warm</span>
                      <span>45%</span>
                    </div>
                    <Progress value={45} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>عملاء Cold</span>
                      <span>30%</span>
                    </div>
                    <Progress value={30} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MailCheck className="h-5 w-5" />
                  أداء الحملات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">معدل الفتح</span>
                    <span className="text-sm font-medium">62.4%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">معدل النقر</span>
                    <span className="text-sm font-medium">25.0%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">معدل التحويل</span>
                    <span className="text-sm font-medium">8.5%</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  توزيع الولاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-400 rounded-full"></span>
                      <span className="text-sm">برونزي</span>
                    </div>
                    <span className="text-sm font-medium">36%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-gray-400 rounded-full"></span>
                      <span className="text-sm">فضي</span>
                    </div>
                    <span className="text-sm font-medium">42%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-yellow-500 rounded-full"></span>
                      <span className="text-sm">ذهبي</span>
                    </div>
                    <span className="text-sm font-medium">18%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 bg-blue-400 rounded-full"></span>
                      <span className="text-sm">بلاتيني</span>
                    </div>
                    <span className="text-sm font-medium">4%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>قائمة العملاء</CardTitle>
              <CardDescription>
                إدارة العملاء مع معلومات التقييم والولاء
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {customers.slice(0, 5).map((customer) => (
                  <div key={customer.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                        <Users className="w-6 h-6 text-blue-600" />
                      </div>
                      <div>
                        <h3 className="font-semibold">{customer.name}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3" />
                            {customer.email}
                          </span>
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3" />
                            {customer.phone}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge variant="outline">{customer.segment}</Badge>
                          {customer.leadScore && (
                            <Badge className={getLeadScoreColor(
                              customer.leadScore >= 70 ? 'hot' : 
                              customer.leadScore >= 40 ? 'warm' : 'cold'
                            )}>
                              {customer.leadScore >= 70 ? 'Hot' : 
                               customer.leadScore >= 40 ? 'Warm' : 'Cold'}
                            </Badge>
                          )}
                          {customer.loyaltyPoints && (
                            <Badge variant="secondary">
                              <Award className="w-3 h-3 ml-1" />
                              {customer.loyaltyPoints} نقطة
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">{formatCurrency(customer.totalSpent)}</div>
                      <div className="text-sm text-gray-600">
                        {customer.bookingCount} حجوزات
                      </div>
                      <div className="text-xs text-gray-500">
                        آخر زيارة: {formatDate(customer.lastVisit)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="lead-scoring" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  قواعد التقييم
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">مستوى التفاعل</h4>
                      <span className="text-sm text-gray-600">30%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      عدد التفاعلات، آخر تواصل، معدل الاستجابة
                    </p>
                    <Progress value={75} className="h-2" />
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">المعلومات الديموغرافية</h4>
                      <span className="text-sm text-gray-600">20%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      العمر، الموقع الوظيفي، الدخل، المنطقة
                    </p>
                    <Progress value={60} className="h-2" />
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">السلوك</h4>
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      زيارات الموقع، صفحات المشاهدة، الوقت المستغرق
                    </p>
                    <Progress value={80} className="h-2" />
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium">القدرة المالية</h4>
                      <span className="text-sm text-gray-600">25%</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">
                      الميزانية المحددة، السيارات المهتم بها
                    </p>
                    <Progress value={70} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  توزيع التقييمات
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <Alert>
                    <Sparkles className="h-4 w-4" />
                    <AlertDescription>
                      <strong>عملاء Hot (25%):</strong> 125 عميل - تواصل فوري مطلوب، عروض خاصة
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Activity className="h-4 w-4" />
                    <AlertDescription>
                      <strong>عملاء Warm (45%):</strong> 225 عميل - متابعة أسبوعية، محتوى تعليمي
                    </AlertDescription>
                  </Alert>
                  
                  <Alert>
                    <Scale className="h-4 w-4" />
                    <AlertDescription>
                      <strong>عملاء Cold (30%):</strong> 150 عميل - حملات تسويقية، إعادة تفعيل
                    </AlertDescription>
                  </Alert>
                </div>
                
                <div className="mt-6">
                  <Button className="w-full">
                    <Target className="ml-2 h-4 w-4" />
                    إعادة حساب جميع التقييمات
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="email-marketing" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  الحملات البريدية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {campaigns.slice(0, 3).map((campaign) => (
                    <div key={campaign.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{campaign.name}</h4>
                        <Badge className={getCampaignStatusColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{campaign.subject}</p>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>{campaign.totalRecipients} مستلم</span>
                        <span>{campaign.openedCount} فتح</span>
                        <span>{campaign.clickedCount} نقر</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MailCheck className="h-5 w-5" />
                  أداء البريد الإلكتروني
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-blue-50 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">62.4%</div>
                      <div className="text-sm text-gray-600">معدل الفتح</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">25.0%</div>
                      <div className="text-sm text-gray-600">معدل النقر</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>معدل التحويل</span>
                        <span>8.5%</span>
                      </div>
                      <Progress value={8.5} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>معدل إلغاء الاشتراك</span>
                        <span>1.2%</span>
                      </div>
                      <Progress value={1.2} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="segments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Segmentation className="h-5 w-5" />
                  التجزئة الديناميكية
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {segments.slice(0, 4).map((segment) => (
                    <div key={segment.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h4 className="font-medium">{segment.name}</h4>
                        {segment.isDynamic && (
                          <Badge variant="outline">ديناميكي</Badge>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mb-2">{segment.description}</p>
                      <div className="flex justify-between text-sm">
                        <span>{segment.customerCount} عميل</span>
                        <span>{formatCurrency(segment.avgSpent)} متوسط</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  تحليل التجزئة
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <div className="text-3xl font-bold text-purple-600">8</div>
                    <div className="text-sm text-gray-600">إجمالي التجزئات</div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>تجزئة ديناميكية</span>
                        <span>75%</span>
                      </div>
                      <Progress value={75} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>تحديث تلقائي</span>
                        <span>60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  </div>
                  
                  <Button className="w-full">
                    <Segmentation className="ml-2 h-4 w-4" />
                    إنشاء تجزئة جديدة
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="loyalty" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Crown className="h-5 w-5" />
                  مستويات الولاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loyaltyTiers.slice(0, 4).map((tier) => (
                    <div key={tier.id} className="p-4 border rounded-lg">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">{tier.icon}</div>
                        <div>
                          <h4 className="font-medium">{tier.name}</h4>
                          <p className="text-sm text-gray-600">{tier.minPoints} نقطة</p>
                        </div>
                      </div>
                      <div className="text-xs text-gray-600">
                        {tier.benefits.slice(0, 2).join(' • ')}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gift className="h-5 w-5" />
                  إحصائيات الولاء
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center p-4 bg-yellow-50 rounded-lg">
                      <div className="text-2xl font-bold text-yellow-600">
                        {loyaltyData.totalMembers || 0}
                      </div>
                      <div className="text-sm text-gray-600">إجمالي الأعضاء</div>
                    </div>
                    <div className="text-center p-4 bg-green-50 rounded-lg">
                      <div className="text-2xl font-bold text-green-600">
                        {loyaltyData.retentionRate || 0}%
                      </div>
                      <div className="text-sm text-gray-600">معدل الاحتفاظ</div>
                    </div>
                  </div>
                  
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>معدل التفاعل</span>
                        <span>78%</span>
                      </div>
                      <Progress value={78} className="h-2" />
                    </div>
                    <div>
                      <div className="flex justify-between text-sm mb-1">
                        <span>ROI البرنامج</span>
                        <span>3.2x</span>
                      </div>
                      <Progress value={85} className="h-2" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}