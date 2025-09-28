'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Send, 
  Mail, 
  MessageSquare, 
  Users, 
  Target,
  TrendingUp,
  Calendar,
  Filter,
  Plus,
  Play,
  Pause,
  Trash2,
  Edit,
  Eye,
  CheckCircle,
  Clock,
  AlertTriangle,
  BarChart3,
  PieChart,
  Smartphone,
  FileText
} from 'lucide-react'

interface Campaign {
  id: string
  name: string
  type: 'email' | 'sms' | 'push' | 'social'
  status: 'draft' | 'scheduled' | 'running' | 'completed' | 'paused'
  targetAudience: string
  message: string
  scheduledDate?: string
  sentDate?: string
  completedDate?: string
  recipients: number
  opened: number
  clicked: number
  converted: number
}

interface AutomationRule {
  id: string
  name: string
  trigger: string
  action: string
  conditions: string[]
  isActive: boolean
  lastRun?: string
  nextRun?: string
  executions: number
  successRate: number
}

interface MarketingMetrics {
  totalCampaigns: number
  activeCampaigns: number
  totalMessages: number
  openRate: number
  clickRate: number
  conversionRate: number
  roi: number
}

export default function MarketingAutomation() {
  const [activeTab, setActiveTab] = useState('overview')
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [automations, setAutomations] = useState<AutomationRule[]>([])
  const [metrics, setMetrics] = useState<MarketingMetrics | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMarketingData()
  }, [])

  const fetchMarketingData = async () => {
    try {
      // Fetch campaigns
      const campaignsResponse = await fetch('/api/marketing/campaigns')
      if (campaignsResponse.ok) {
        const campaignsData = await campaignsResponse.json()
        setCampaigns(campaignsData.campaigns || [])
      }

      // Fetch automations
      const automationsResponse = await fetch('/api/marketing/automations')
      if (automationsResponse.ok) {
        const automationsData = await automationsResponse.json()
        setAutomations(automationsData.automations || [])
      }

      // Fetch metrics
      const metricsResponse = await fetch('/api/marketing/metrics')
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData)
      }
    } catch (error) {
      console.error('Error fetching marketing data:', error)
    } finally {
      setLoading(false)
    }
  }

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`
  }

  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('ar-EG').format(num)
  }

  const getCampaignTypeIcon = (type: string) => {
    const iconMap = {
      email: Mail,
      sms: MessageSquare,
      push: Smartphone,
      social: Users
    }
    
    const Icon = iconMap[type as keyof typeof iconMap] || Mail
    return <Icon className="h-4 w-4" />
  }

  const getCampaignTypeLabel = (type: string) => {
    const labels = {
      email: 'بريد إلكتروني',
      sms: 'رسالة نصية',
      push: 'إشعار',
      social: 'وسائل التواصل'
    }
    
    return labels[type as keyof typeof labels] || type
  }

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      draft: { label: 'مسودة', variant: 'secondary' as const, icon: FileText },
      scheduled: { label: 'مجدول', variant: 'outline' as const, icon: Calendar },
      running: { label: 'جاري', variant: 'default' as const, icon: Play },
      completed: { label: 'مكتمل', variant: 'default' as const, icon: CheckCircle },
      paused: { label: 'متوقف', variant: 'secondary' as const, icon: Pause }
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

  const getAutomationStatusBadge = (isActive: boolean) => {
    return (
      <Badge variant={isActive ? 'default' : 'secondary'} className="flex items-center gap-1">
        <div className={`w-2 h-2 rounded-full ${isActive ? 'bg-green-500' : 'bg-gray-500'}`}></div>
        {isActive ? 'نشط' : 'غير نشط'}
      </Badge>
    )
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
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">أتمتة التسويق</h1>
              <p className="text-gray-600">إدارة الحملات التسويقية وقواعد الأتمتة والتقارير</p>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="outline">
                <BarChart3 className="ml-2 h-4 w-4" />
                تقارير
              </Button>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                حملة جديدة
              </Button>
            </div>
          </div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">نظرة عامة</TabsTrigger>
            <TabsTrigger value="campaigns">الحملات</TabsTrigger>
            <TabsTrigger value="automations">الأتمتة</TabsTrigger>
            <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Marketing Metrics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">إجمالي الحملات</CardTitle>
                  <Target className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {metrics ? formatNumber(metrics.totalCampaigns) : '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">حملات تسويقية</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">الحملات النشطة</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {metrics ? formatNumber(metrics.activeCampaigns) : '0'}
                  </div>
                  <p className="text-xs text-muted-foreground">حملات قيد التشغيل</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">معدل الفتح</CardTitle>
                  <Mail className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {metrics ? formatPercentage(metrics.openRate) : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">متوسط معدل الفتح</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">العائد على الاستثمار</CardTitle>
                  <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">
                    {metrics ? formatPercentage(metrics.roi) : '0%'}
                  </div>
                  <p className="text-xs text-muted-foreground">ROI</p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Campaigns */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle>آخر الحملات</CardTitle>
                      <CardDescription>حالة الحملات التسويقية الأخيرة</CardDescription>
                    </div>
                    <Button variant="outline" size="sm">
                      <Eye className="ml-2 h-4 w-4" />
                      عرض الكل
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {campaigns.slice(0, 5).map((campaign) => (
                      <div key={campaign.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-3">
                          {getCampaignTypeIcon(campaign.type)}
                          <div>
                            <p className="font-medium">{campaign.name}</p>
                            <p className="text-sm text-gray-500">{getCampaignTypeLabel(campaign.type)}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          {getStatusBadge(campaign.status)}
                          <p className="text-sm text-gray-500 mt-1">{formatNumber(campaign.recipients)} مستلم</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>قواعد الأتمتة</CardTitle>
                  <CardDescription>قواعد الأتمتة النشطة وغير النشطة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {automations.slice(0, 5).map((automation) => (
                      <div key={automation.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <div>
                          <p className="font-medium">{automation.name}</p>
                          <p className="text-sm text-gray-500">{automation.trigger} → {automation.action}</p>
                        </div>
                        <div className="text-right">
                          {getAutomationStatusBadge(automation.isActive)}
                          <p className="text-sm text-gray-500 mt-1">{formatNumber(automation.executions)} تنفيذ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Campaigns Tab */}
          <TabsContent value="campaigns" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">الحملات التسويقية</h2>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                حملة جديدة
              </Button>
            </div>

            <Card>
              <CardContent className="p-0">
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-right py-3 px-4">الحملة</th>
                        <th className="text-right py-3 px-4">النوع</th>
                        <th className="text-right py-3 px-4">الجمهور المستهدف</th>
                        <th className="text-right py-3 px-4">الحالة</th>
                        <th className="text-right py-3 px-4">المستلمين</th>
                        <th className="text-right py-3 px-4">معدل الفتح</th>
                        <th className="text-right py-3 px-4">معدل النقر</th>
                        <th className="text-right py-3 px-4">الإجراءات</th>
                      </tr>
                    </thead>
                    <tbody>
                      {campaigns.map((campaign) => (
                        <tr key={campaign.id} className="border-b hover:bg-gray-50">
                          <td className="text-right py-3 px-4 font-medium">
                            {campaign.name}
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end gap-2">
                              {getCampaignTypeIcon(campaign.type)}
                              <span>{getCampaignTypeLabel(campaign.type)}</span>
                            </div>
                          </td>
                          <td className="text-right py-3 px-4">
                            {campaign.targetAudience}
                          </td>
                          <td className="text-right py-3 px-4">
                            {getStatusBadge(campaign.status)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {formatNumber(campaign.recipients)}
                          </td>
                          <td className="text-right py-3 px-4">
                            {campaign.recipients > 0 ? formatPercentage((campaign.opened / campaign.recipients) * 100) : '0%'}
                          </td>
                          <td className="text-right py-3 px-4">
                            {campaign.opened > 0 ? formatPercentage((campaign.clicked / campaign.opened) * 100) : '0%'}
                          </td>
                          <td className="text-right py-3 px-4">
                            <div className="flex items-center justify-end space-x-2">
                              <Button variant="ghost" size="sm">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="sm">
                                <Edit className="h-4 w-4" />
                              </Button>
                              {campaign.status === 'running' ? (
                                <Button variant="ghost" size="sm">
                                  <Pause className="h-4 w-4" />
                                </Button>
                              ) : (
                                <Button variant="ghost" size="sm">
                                  <Play className="h-4 w-4" />
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

          {/* Automations Tab */}
          <TabsContent value="automations" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">قواعد الأتمتة</h2>
              <Button>
                <Plus className="ml-2 h-4 w-4" />
                قاعدة جديدة
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automations.map((automation) => (
                <Card key={automation.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{automation.name}</CardTitle>
                      {getAutomationStatusBadge(automation.isActive)}
                    </div>
                    <CardDescription>
                      {automation.trigger} → {automation.action}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-medium mb-2">الشروط:</h4>
                        <div className="space-y-1">
                          {automation.conditions.map((condition, index) => (
                            <div key={index} className="flex items-center gap-2 text-sm">
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              <span>{condition}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600">التنفيذات:</p>
                          <p className="font-medium">{formatNumber(automation.executions)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600">معدل النجاح:</p>
                          <p className="font-medium">{formatPercentage(automation.successRate)}</p>
                        </div>
                      </div>
                      
                      {automation.lastRun && (
                        <div className="text-sm">
                          <p className="text-gray-600">آخر تشغيل:</p>
                          <p>{new Date(automation.lastRun).toLocaleDateString('ar-EG')}</p>
                        </div>
                      )}
                      
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

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>أداء الحملات</CardTitle>
                  <CardDescription>مقارنة أداء الحملات المختلفة</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <BarChart3 className="h-12 w-12" />
                    <p className="ml-2">رسم بياني لأداء الحملات</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>توزيع أنواع الحملات</CardTitle>
                  <CardDescription>توزيع الحملات حسب النوع</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64 flex items-center justify-center text-gray-500">
                    <PieChart className="h-12 w-12" />
                    <p className="ml-2">رسم بياني للتوزيع</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات البريد الإلكتروني</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>إجمالي المرسل:</span>
                      <span className="font-medium">{formatNumber(15420)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل الفتح:</span>
                      <span className="font-medium">{formatPercentage(24.5)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل النقر:</span>
                      <span className="font-medium">{formatPercentage(12.3)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل التحويل:</span>
                      <span className="font-medium">{formatPercentage(3.2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات الرسائل النصية</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>إجمالي المرسل:</span>
                      <span className="font-medium">{formatNumber(8750)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل التسليم:</span>
                      <span className="font-medium">{formatPercentage(98.2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل الرد:</span>
                      <span className="font-medium">{formatPercentage(8.7)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل التحويل:</span>
                      <span className="font-medium">{formatPercentage(2.1)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>إحصائيات الإشعارات</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span>إجمالي المرسل:</span>
                      <span className="font-medium">{formatNumber(12300)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل التسليم:</span>
                      <span className="font-medium">{formatPercentage(96.8)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل الفتح:</span>
                      <span className="font-medium">{formatPercentage(18.9)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>معدل التحويل:</span>
                      <span className="font-medium">{formatPercentage(1.8)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}