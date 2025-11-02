'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { TrendingUp, Award, Target, Users, Plus, Star } from 'lucide-react'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { format } from 'date-fns'
import { ar } from 'date-fns/locale'

interface PerformanceMetric {
  id: string
  employee: {
    user: {
      name: string
    }
    department: string
    position: string
  }
  period: string
  bookingsHandled: number
  averageHandlingTime: number
  customerRating: number
  conversionRate: number
  revenueGenerated: number
  tasksCompleted: number
  customerSatisfaction: number
  responseTime: number
  followUpRate: number
  upsellSuccess: number
  overallScore: number
  notes?: string
}

interface PerformanceStats {
  averageScore: number
  topPerformers: number
  goalsAchieved: number
  inTraining: number
}

export default function PerformancePage() {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [stats, setStats] = useState<PerformanceStats>({
    averageScore: 0,
    topPerformers: 0,
    goalsAchieved: 0,
    inTraining: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('current')

  useEffect(() => {
    fetchPerformanceData()
  }, [selectedPeriod])

  const fetchPerformanceData = async () => {
    try {
      // Fetch employees first
      const employeesRes = await fetch('/api/employees')
      if (!employeesRes.ok) return
      
      const employees = await employeesRes.json()
      
      // Create mock performance metrics based on employees
      // In a real implementation, this would come from a performance API
      const metrics = employees.map((emp: any) => {
        const baseScore = 70 + Math.random() * 25 // 70-95 base score
        const bookingsHandled = Math.floor(Math.random() * 50) + 10
        const avgHandlingTime = Math.random() * 30 + 15 // 15-45 minutes
        const customerRating = 3 + Math.random() * 2 // 3-5 stars
        const conversionRate = Math.random() * 40 + 10 // 10-50%
        const revenue = Math.random() * 50000 + 10000 // 10k-60k
        const tasks = Math.floor(Math.random() * 30) + 20
        const satisfaction = 80 + Math.random() * 20 // 80-100%
        const responseTime = Math.random() * 60 + 5 // 5-65 minutes
        const followUp = Math.random() * 30 + 60 // 60-90%
        const upsell = Math.random() * 25 + 5 // 5-30%
        
        // Calculate overall score
        const overallScore = Math.round(
          (baseScore * 0.3) + 
          (customerRating / 5 * 100 * 0.2) + 
          (conversionRate * 0.2) + 
          (satisfaction * 0.15) + 
          (followUp * 0.15)
        )
        
        return {
          id: emp.id,
          employee: {
            user: {
              name: emp.user.name
            },
            department: emp.department,
            position: emp.position
          },
          period: selectedPeriod === 'current' ? format(new Date(), 'yyyy-MM') : format(new Date(new Date().setMonth(new Date().getMonth() - 1)), 'yyyy-MM'),
          bookingsHandled,
          averageHandlingTime: Math.round(avgHandlingTime),
          customerRating: Math.round(customerRating * 10) / 10,
          conversionRate: Math.round(conversionRate),
          revenueGenerated: Math.round(revenue),
          tasksCompleted: tasks,
          customerSatisfaction: Math.round(satisfaction),
          responseTime: Math.round(responseTime),
          followUpRate: Math.round(followUp),
          upsellSuccess: Math.round(upsell),
          overallScore,
          notes: overallScore >= 90 ? 'أداء استثنائي' : overallScore >= 80 ? 'أداء ممتاز' : overallScore >= 70 ? 'أداء جيد' : 'يحتاج تحسين'
        }
      })
      
      setPerformanceMetrics(metrics)
      
      // Calculate stats
      const averageScore = Math.round(metrics.reduce((sum, m) => sum + m.overallScore, 0) / metrics.length)
      const topPerformers = metrics.filter(m => m.overallScore >= 90).length
      const goalsAchieved = Math.round(metrics.filter(m => m.conversionRate >= 30).length / metrics.length * 100)
      const inTraining = Math.floor(metrics.length * 0.15) // Mock: 15% in training
      
      setStats({
        averageScore,
        topPerformers,
        goalsAchieved,
        inTraining
      })
    } catch (error) {
      console.error('Error fetching performance data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-600'
    if (score >= 80) return 'text-blue-600'
    if (score >= 70) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreBadge = (score: number) => {
    if (score >= 90) return 'bg-green-100 text-green-800'
    if (score >= 80) return 'bg-blue-100 text-blue-800'
    if (score >= 70) return 'bg-yellow-100 text-yellow-800'
    return 'bg-red-100 text-red-800'
  }

  const getPerformanceLevel = (score: number) => {
    if (score >= 90) return 'متميز'
    if (score >= 80) return 'جيد جداً'
    if (score >= 70) return 'جيد'
    return 'يحتاج تحسين'
  }

  const sortedMetrics = [...performanceMetrics].sort((a, b) => b.overallScore - a.overallScore)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تقييم الأداء</h1>
        <div className="flex items-center gap-4">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">الشهر الحالي</SelectItem>
              <SelectItem value="last">الشهر الماضي</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={fetchPerformanceData}>
            <Target className="ml-2 h-4 w-4" />
            تحديث
          </Button>
          <Button>
            <Plus className="ml-2 h-4 w-4" />
            تقييم جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">متوسط الأداء</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageScore}%</div>
            <p className="text-xs text-muted-foreground">
              +5% من الشهر الماضي
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">الموظفون المتميزون</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.topPerformers}</div>
            <p className="text-xs text-muted-foreground">
              هذا الشهر
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">تحقيق الأهداف</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.goalsAchieved}%</div>
            <p className="text-xs text-muted-foreground">
              من الأهداف المحددة
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">التدريب</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inTraining}</div>
            <p className="text-xs text-muted-foreground">
              موظف في تدريب
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>أفضل الموظفين أداءً</CardTitle>
          <CardDescription>
            ترتيب الموظفين حسب تقييم الأداء هذا الشهر
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {sortedMetrics.slice(0, 10).map((metric, index) => (
              <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-blue-100 text-blue-600 font-bold text-sm">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{metric.employee.user.name}</p>
                    <p className="text-sm text-muted-foreground">{metric.employee.position}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-3 w-3 ${
                              i < Math.floor(metric.customerRating)
                                ? 'text-yellow-400 fill-current'
                                : 'text-gray-300'
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        ({metric.customerRating})
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-left">
                  <div className={`text-2xl font-bold ${getScoreColor(metric.overallScore)}`}>
                    {metric.overallScore}%
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={getScoreBadge(metric.overallScore)}>
                      {getPerformanceLevel(metric.overallScore)}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {metric.conversionRate}% تحويل
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>تفاصيل الأداء</CardTitle>
            <CardDescription>
              مقاييس الأداء الرئيسية للموظفين
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">متوسط رضا العملاء:</span>
                <span className="font-medium">
                  {Math.round(performanceMetrics.reduce((sum, m) => sum + m.customerSatisfaction, 0) / performanceMetrics.length)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">متوسط معدل التحويل:</span>
                <span className="font-medium">
                  {Math.round(performanceMetrics.reduce((sum, m) => sum + m.conversionRate, 0) / performanceMetrics.length)}%
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">إجمالي الإيرادات:</span>
                <span className="font-medium">
                  {new Intl.NumberFormat('ar-EG', {
                    style: 'currency',
                    currency: 'EGP',
                    minimumFractionDigits: 0
                  }).format(performanceMetrics.reduce((sum, m) => sum + m.revenueGenerated, 0))}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-muted-foreground">متوسط وقت الاستجابة:</span>
                <span className="font-medium">
                  {Math.round(performanceMetrics.reduce((sum, m) => sum + m.responseTime, 0) / performanceMetrics.length)} دقيقة
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>توزيع الأداء</CardTitle>
            <CardDescription>
              توزيع الموظفين حسب مستويات الأداء
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { level: 'متميز', min: 90, color: 'bg-green-500' },
                { level: 'جيد جداً', min: 80, color: 'bg-blue-500' },
                { level: 'جيد', min: 70, color: 'bg-yellow-500' },
                { level: 'يحتاج تحسين', min: 0, color: 'bg-red-500' }
              ].map((level) => {
                const count = performanceMetrics.filter(m => m.overallScore >= level.min).length -
                             (level.min > 0 ? performanceMetrics.filter(m => m.overallScore >= (level.min + 10)).length : 0)
                const percentage = performanceMetrics.length > 0 ? Math.round((count / performanceMetrics.length) * 100) : 0
                
                return (
                  <div key={level.level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${level.color}`}></div>
                      <span className="text-sm">{level.level}</span>
                      <span className="text-xs text-muted-foreground">({count} موظف)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-gray-200 rounded-full">
                        <div 
                          className={`h-2 rounded-full ${level.color}`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-left">{percentage}%</span>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}