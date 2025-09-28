'use client'

import { useState, useEffect } from 'react'
import { AdminRoute } from '@/components/auth/AdminRoute'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { 
  Bell, 
  Send, 
  Mail, 
  MessageSquare, 
  Smartphone,
  Filter,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertTriangle,
  Plus,
  Settings,
  Users,
  Calendar,
  Search
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'

interface NotificationTemplate {
  id: string
  name: string
  type: 'email' | 'sms' | 'push' | 'in_app'
  category: string
  subject: string
  content: string
  variables: string[]
  isActive: boolean
  createdAt: string
  usageCount: number
}

interface NotificationLog {
  id: string
  templateId: string
  templateName: string
  recipient: string
  type: 'email' | 'sms' | 'push' | 'in_app'
  status: 'pending' | 'sent' | 'delivered' | 'failed' | 'opened' | 'clicked'
  channel: string
  sentAt: string
  deliveredAt?: string
  openedAt?: string
  clickedAt?: string
  errorMessage?: string
  metadata: Record<string, any>
}

interface NotificationStats {
  totalSent: number
  delivered: number
  opened: number
  clicked: number
  failed: number
  byType: Record<string, {
    sent: number
    delivered: number
    opened: number
    clicked: number
  }>
  byCategory: Record<string, number>
  recentActivity: Array<{
    date: string
    sent: number
    delivered: number
    opened: number
  }>
}

interface NotificationSettings {
  emailEnabled: boolean
  smsEnabled: boolean
  pushEnabled: boolean
  inAppEnabled: boolean
  emailProvider: string
  smsProvider: string
  pushProvider: string
  defaultFromEmail: string
  defaultFromSms: string
  rateLimit: number
  retryAttempts: number
}

export default function NotificationsPage() {
  return (
    <AdminRoute>
      <NotificationsContent />
    </AdminRoute>
  )
}

function NotificationsContent() {
  const [activeTab, setActiveTab] = useState('templates')
  const [loading, setLoading] = useState(true)
  const [templates, setTemplates] = useState<NotificationTemplate[]>([])
  const [logs, setLogs] = useState<NotificationLog[]>([])
  const [stats, setStats] = useState<NotificationStats | null>(null)
  const [settings, setSettings] = useState<NotificationSettings | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [showCompose, setShowCompose] = useState(false)
  const [composeData, setComposeData] = useState({
    type: 'email',
    recipient: '',
    subject: '',
    content: '',
    templateId: ''
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchNotificationsData()
  }, [])

  const fetchNotificationsData = async () => {
    try {
      setLoading(true)
      
      // Fetch templates
      const templatesResponse = await fetch('/api/notifications/templates')
      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json()
        setTemplates(Array.isArray(templatesData) ? templatesData : [])
      }

      // Fetch logs
      const logsResponse = await fetch('/api/notifications/logs')
      if (logsResponse.ok) {
        const logsData = await logsResponse.json()
        setLogs(Array.isArray(logsData) ? logsData : (logsData.logs || []))
      }

      // Fetch stats
      const statsResponse = await fetch('/api/notifications/stats')
      if (statsResponse.ok) {
        const statsData = await statsResponse.json()
        setStats(statsData)
      }

      // Fetch settings
      const settingsResponse = await fetch('/api/notifications/settings')
      if (settingsResponse.ok) {
        const settingsData = await settingsResponse.json()
        setSettings(settingsData)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to load notifications data',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredTemplates = Array.isArray(templates) ? templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.subject.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || template.type === typeFilter
    
    return matchesSearch && matchesType
  }) : []

  const filteredLogs = Array.isArray(logs) ? logs.filter(log => {
    const matchesSearch = log.templateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.recipient.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = typeFilter === 'all' || log.type === typeFilter
    const matchesStatus = statusFilter === 'all' || log.status === statusFilter
    
    return matchesSearch && matchesType && matchesStatus
  }) : []

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { variant: 'secondary' as const, label: 'قيد الانتظار', icon: Clock },
      sent: { variant: 'default' as const, label: 'أرسل', icon: Send },
      delivered: { variant: 'outline' as const, label: 'تم التوصيل', icon: CheckCircle },
      failed: { variant: 'destructive' as const, label: 'فشل', icon: AlertTriangle },
      opened: { variant: 'default' as const, label: 'فتح', icon: Mail },
      clicked: { variant: 'outline' as const, label: 'نقر', icon: MessageSquare }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending
    const Icon = config.icon
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="w-3 h-3" />
        {config.label}
      </Badge>
    )
  }

  const getTypeIcon = (type: string) => {
    const icons = {
      email: Mail,
      sms: MessageSquare,
      push: Smartphone,
      in_app: Bell
    }
    const Icon = icons[type as keyof typeof icons] || Bell
    return <Icon className="w-4 h-4" />
  }

  const getTypeLabel = (type: string) => {
    const labels = {
      email: 'بريد إلكتروني',
      sms: 'رسالة نصية',
      push: 'إشعار دفع',
      in_app: 'إشعار داخل التطبيق'
    }
    return labels[type as keyof typeof labels] || type
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('ar-EG', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const sendNotification = async () => {
    try {
      const response = await fetch('/api/notifications/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(composeData)
      })

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Notification sent successfully'
        })
        setShowCompose(false)
        setComposeData({
          type: 'email',
          recipient: '',
          subject: '',
          content: '',
          templateId: ''
        })
        fetchNotificationsData()
      } else {
        toast({
          title: 'Error',
          description: 'Failed to send notification',
          variant: 'destructive'
        })
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to send notification',
        variant: 'destructive'
      })
    }
  }

  const notificationStats = stats || {
    totalSent: 0,
    delivered: 0,
    opened: 0,
    clicked: 0,
    failed: 0,
    byType: {},
    byCategory: {},
    recentActivity: []
  }

  const deliveryRate = notificationStats.totalSent > 0 
    ? Math.round((notificationStats.delivered / notificationStats.totalSent) * 100)
    : 0

  const openRate = notificationStats.delivered > 0
    ? Math.round((notificationStats.opened / notificationStats.delivered) * 100)
    : 0

  const clickRate = notificationStats.opened > 0
    ? Math.round((notificationStats.clicked / notificationStats.opened) * 100)
    : 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">نظام الإشعارات المتقدم</h1>
          <p className="text-gray-600 mt-2">إدارة الإشعارات والقوالب والإعدادات</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setShowCompose(true)}>
            <Plus className="ml-2 h-4 w-4" />
            إرسال إشعار
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">إجمالي المرسل</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notificationStats.totalSent}</div>
            <p className="text-xs text-muted-foreground">
              جميع الإشعارات
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل التوصيل</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{deliveryRate}%</div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.delivered} تم توصيلها
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل الفتح</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{openRate}%</div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.opened} تم فتحها
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">معدل النقر</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clickRate}%</div>
            <p className="text-xs text-muted-foreground">
              {notificationStats.clicked} تم النقر عليها
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">فشل</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{notificationStats.failed}</div>
            <p className="text-xs text-muted-foreground">
              فشل في الإرسال
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Compose Notification Modal */}
      {showCompose && (
        <Card>
          <CardHeader>
            <CardTitle>إرسال إشعار جديد</CardTitle>
            <CardDescription>
              قم بإنشاء وإرسال إشعار جديد
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">النوع</label>
                  <Select 
                    value={composeData.type} 
                    onValueChange={(value) => setComposeData({...composeData, type: value as any})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">بريد إلكتروني</SelectItem>
                      <SelectItem value="sms">رسالة نصية</SelectItem>
                      <SelectItem value="push">إشعار دفع</SelectItem>
                      <SelectItem value="in_app">إشعار داخل التطبيق</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">المستلم</label>
                  <Input
                    placeholder="البريد الإلكتروني أو رقم الهاتف"
                    value={composeData.recipient}
                    onChange={(e) => setComposeData({...composeData, recipient: e.target.value})}
                  />
                </div>
              </div>
              
              {composeData.type === 'email' && (
                <div>
                  <label className="block text-sm font-medium mb-2">الموضوع</label>
                  <Input
                    placeholder="موضوع الإشعار"
                    value={composeData.subject}
                    onChange={(e) => setComposeData({...composeData, subject: e.target.value})}
                  />
                </div>
              )}
              
              <div>
                <label className="block text-sm font-medium mb-2">المحتوى</label>
                <Textarea
                  placeholder="محتوى الإشعار"
                  value={composeData.content}
                  onChange={(e) => setComposeData({...composeData, content: e.target.value})}
                  rows={4}
                />
              </div>
              
              <div className="flex gap-2">
                <Button onClick={sendNotification}>
                  <Send className="ml-2 h-4 w-4" />
                  إرسال
                </Button>
                <Button variant="outline" onClick={() => setShowCompose(false)}>
                  إلغاء
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="templates">القوالب</TabsTrigger>
          <TabsTrigger value="logs">السجلات</TabsTrigger>
          <TabsTrigger value="analytics">التحليلات</TabsTrigger>
          <TabsTrigger value="settings">الإعدادات</TabsTrigger>
        </TabsList>

        <TabsContent value="templates" className="space-y-6">
          {/* Filters */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                الفلاتر
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="بحث بالاسم أو الموضوع..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="email">بريد إلكتروني</SelectItem>
                    <SelectItem value="sms">رسالة نصية</SelectItem>
                    <SelectItem value="push">إشعار دفع</SelectItem>
                    <SelectItem value="in_app">إشعار داخل التطبيق</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Templates List */}
          <Card>
            <CardHeader>
              <CardTitle>قوالب الإشعارات</CardTitle>
              <CardDescription>
                {filteredTemplates.length} قالب
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredTemplates.map((template) => (
                    <div key={template.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                          {getTypeIcon(template.type)}
                        </div>
                        <div>
                          <h3 className="font-semibold">{template.name}</h3>
                          <p className="text-sm text-gray-600">{template.subject}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge variant="outline">
                              {getTypeLabel(template.type)}
                            </Badge>
                            <Badge variant="secondary">
                              {template.category}
                            </Badge>
                            {template.isActive ? (
                              <Badge variant="default">نشط</Badge>
                            ) : (
                              <Badge variant="secondary">غير نشط</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-gray-600">
                          {template.usageCount} استخدام
                        </div>
                        <div className="text-xs text-gray-500">
                          {new Date(template.createdAt).toLocaleDateString('ar-EG')}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
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
                    placeholder="بحث بالقالب أو المستلم..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="النوع" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الأنواع</SelectItem>
                    <SelectItem value="email">بريد إلكتروني</SelectItem>
                    <SelectItem value="sms">رسالة نصية</SelectItem>
                    <SelectItem value="push">إشعار دفع</SelectItem>
                    <SelectItem value="in_app">إشعار داخل التطبيق</SelectItem>
                  </SelectContent>
                </Select>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="الحالة" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">جميع الحالات</SelectItem>
                    <SelectItem value="pending">قيد الانتظار</SelectItem>
                    <SelectItem value="sent">أرسل</SelectItem>
                    <SelectItem value="delivered">تم التوصيل</SelectItem>
                    <SelectItem value="failed">فشل</SelectItem>
                    <SelectItem value="opened">فتح</SelectItem>
                    <SelectItem value="clicked">نقر</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Logs List */}
          <Card>
            <CardHeader>
              <CardTitle>سجل الإشعارات</CardTitle>
              <CardDescription>
                {filteredLogs.length} سجل
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredLogs.slice(0, 20).map((log) => (
                    <div key={log.id} className="flex items-start gap-4 p-4 border rounded-lg">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                        {getTypeIcon(log.type)}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{log.templateName}</h3>
                          <div className="flex items-center gap-2">
                            {getStatusBadge(log.status)}
                            <Badge variant="outline">
                              {getTypeLabel(log.type)}
                            </Badge>
                          </div>
                        </div>
                        <p className="text-sm text-gray-600 mt-1">{log.recipient}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span>أرسل: {formatDateTime(log.sentAt)}</span>
                          {log.deliveredAt && <span>وصل: {formatDateTime(log.deliveredAt)}</span>}
                          {log.openedAt && <span>فتح: {formatDateTime(log.openedAt)}</span>}
                          {log.clickedAt && <span>نقر: {formatDateTime(log.clickedAt)}</span>}
                        </div>
                        {log.errorMessage && (
                          <div className="mt-2 text-sm text-red-600">
                            خطأ: {log.errorMessage}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>الإشعارات حسب النوع</CardTitle>
                <CardDescription>
                  توزيع الإشعارات حسب النوع
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(notificationStats.byType).map(([type, data]) => (
                    <div key={type} className="flex items-center justify-between">
                      <span className="text-sm">{getTypeLabel(type)}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{data.sent}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${(data.sent / notificationStats.totalSent) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>الإشعارات حسب التصنيف</CardTitle>
                <CardDescription>
                  توزيع الإشعارات حسب التصنيف
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(notificationStats.byCategory).map(([category, count]) => (
                    <div key={category} className="flex items-center justify-between">
                      <span className="text-sm">{category}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{count}</span>
                        <div className="w-20 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full" 
                            style={{ width: `${(count / notificationStats.totalSent) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="settings" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>إعدادات الإشعارات</CardTitle>
              <CardDescription>
                تكوين إعدادات نظام الإشعارات
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settings ? (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h3 className="text-lg font-semibold mb-4">قنوات الإشعارات</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>البريد الإلكتروني</span>
                          <Badge variant={settings.emailEnabled ? 'default' : 'secondary'}>
                            {settings.emailEnabled ? 'مفعل' : 'معطل'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>الرسائل النصية</span>
                          <Badge variant={settings.smsEnabled ? 'default' : 'secondary'}>
                            {settings.smsEnabled ? 'مفعل' : 'معطل'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>إشعارات الدفع</span>
                          <Badge variant={settings.pushEnabled ? 'default' : 'secondary'}>
                            {settings.pushEnabled ? 'مفعل' : 'معطل'}
                          </Badge>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>إشعارات داخل التطبيق</span>
                          <Badge variant={settings.inAppEnabled ? 'default' : 'secondary'}>
                            {settings.inAppEnabled ? 'مفعل' : 'معطل'}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-4">مقدمو الخدمة</h3>
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span>مقدم البريد الإلكتروني</span>
                          <span className="text-sm">{settings.emailProvider}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>مقدم الرسائل النصية</span>
                          <span className="text-sm">{settings.smsProvider}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>مقدم إشعارات الدفع</span>
                          <span className="text-sm">{settings.pushProvider}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold mb-4">الإعدادات العامة</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">البريد الافتراضي</label>
                        <Input value={settings.defaultFromEmail} readOnly />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">الرقم الافتراضي</label>
                        <Input value={settings.defaultFromSms} readOnly />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">معدل الإرسال</label>
                        <Input value={settings.rateLimit.toString()} readOnly />
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button>
                      <Settings className="ml-2 h-4 w-4" />
                      تحديث الإعدادات
                    </Button>
                    <Button variant="outline">
                      اختبار الإشعارات
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8">
                  <Settings className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">جاري تحميل الإعدادات...</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}