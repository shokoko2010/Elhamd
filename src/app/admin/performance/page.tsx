'use client'

import { useEffect, useMemo, useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { TrendingUp, Award, Target, Users, Plus, Star, RefreshCw } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'sonner'

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

const emptyStats: PerformanceStats = {
  averageScore: 0,
  topPerformers: 0,
  goalsAchieved: 0,
  inTraining: 0
}

const formatMonth = (date: Date) => format(date, 'yyyy-MM')

export default function PerformancePage() {
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([])
  const [stats, setStats] = useState<PerformanceStats>(emptyStats)
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<'current' | 'last' | string>('current')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchPerformanceData()
  }, [selectedPeriod])

  const resolvedPeriod = useMemo(() => {
    if (selectedPeriod === 'current') {
      return formatMonth(new Date())
    }

    if (selectedPeriod === 'last') {
      const last = new Date()
      last.setMonth(last.getMonth() - 1)
      return formatMonth(last)
    }

    return selectedPeriod
  }, [selectedPeriod])

  const fetchPerformanceData = async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await fetch(`/api/performance?period=${resolvedPeriod}`)

      if (!response.ok) {
        setPerformanceMetrics([])
        setStats(emptyStats)
        setError('تعذر تحميل بيانات تقييم الأداء')
        return
      }

      const result = await response.json()
      const metrics: PerformanceMetric[] = Array.isArray(result.data) ? result.data : []
      setPerformanceMetrics(metrics)

      if (metrics.length === 0) {
        setStats(emptyStats)
        return
      }

      const averageScore = Math.round(metrics.reduce((sum, metric) => sum + metric.overallScore, 0) / metrics.length)
      const topPerformers = metrics.filter(metric => metric.overallScore >= 90).length
      const goalsAchieved = Math.round(
        (metrics.filter(metric => metric.conversionRate >= 30).length / metrics.length) * 100
      )
      const inTraining = metrics.filter(metric => metric.overallScore < 70).length

      setStats({ averageScore, topPerformers, goalsAchieved, inTraining })
    } catch (err) {
      console.error('Error fetching performance data:', err)
      setPerformanceMetrics([])
      setStats(emptyStats)
      setError('تعذر تحميل بيانات تقييم الأداء')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateEvaluation = async () => {
    try {
      const response = await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      const result = await response.json()

      if (response.ok) {
        toast.success(result.message || 'تم إنشاء تقييم أداء جديد')
        fetchPerformanceData()
      } else {
        toast.error(result.error || 'فشل في إنشاء تقييم أداء')
      }
    } catch (err) {
      console.error('Error creating performance evaluation:', err)
      toast.error('حدث خطأ أثناء إنشاء تقييم الأداء')
    }
  }

  const sortedMetrics = useMemo(
    () => [...performanceMetrics].sort((a, b) => b.overallScore - a.overallScore),
    [performanceMetrics]
  )

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

  const averageCustomerSatisfaction = useMemo(() => {
    if (performanceMetrics.length === 0) return 0
    return Math.round(
      performanceMetrics.reduce((sum, metric) => sum + metric.customerSatisfaction, 0) / performanceMetrics.length
    )
  }, [performanceMetrics])

  const averageConversionRate = useMemo(() => {
    if (performanceMetrics.length === 0) return 0
    return Math.round(
      performanceMetrics.reduce((sum, metric) => sum + metric.conversionRate, 0) / performanceMetrics.length
    )
  }, [performanceMetrics])

  const totalRevenue = useMemo(
    () => performanceMetrics.reduce((sum, metric) => sum + metric.revenueGenerated, 0),
    [performanceMetrics]
  )

  const averageResponseTime = useMemo(() => {
    if (performanceMetrics.length === 0) return 0
    return Math.round(
      performanceMetrics.reduce((sum, metric) => sum + metric.responseTime, 0) / performanceMetrics.length
    )
  }, [performanceMetrics])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">تقييم الأداء</h1>
        <div className="flex items-center gap-3 flex-wrap">
          <Select value={selectedPeriod} onValueChange={value => setSelectedPeriod(value)}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="اختر الفترة" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="current">الشهر الحالي</SelectItem>
              <SelectItem value="last">الشهر الماضي</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchPerformanceData} disabled={loading}>
            <RefreshCw className={`ml-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            تحديث
          </Button>
          <Button onClick={handleCreateEvaluation}>
            <Plus className="ml-2 h-4 w-4" />
            تقييم جديد
          </Button>
        </div>
      </div>

      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4 text-red-600">{error}</CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">متوسط الأداء</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stats.averageScore}%</div>
                <p className="text-xs text-muted-foreground">
                  {performanceMetrics.length > 0 ? '+5% من الشهر الماضي' : 'لا توجد بيانات لعرض المقارنة'}
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
                  {performanceMetrics.length > 0 ? 'هذا الشهر' : 'لم يتم تسجيل تقييمات بعد'}
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
                  {performanceMetrics.length > 0 ? 'من الأهداف المحددة' : 'لا توجد أهداف مسجلة'}
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
                  {performanceMetrics.length > 0 ? 'موظف في تدريب' : 'لا توجد بيانات تدريب'}
                </p>
              </CardContent>
            </Card>
          </div>

          {performanceMetrics.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center space-y-4">
                <p className="text-lg font-medium">لا توجد بيانات تقييم أداء في هذه الفترة</p>
                <p className="text-muted-foreground">يمكنك إنشاء تقييمات تجريبية لعرض مخططات الأداء</p>
                <Button onClick={handleCreateEvaluation}>
                  <Plus className="ml-2 h-4 w-4" />
                  إنشاء بيانات تجريبية
                </Button>
              </CardContent>
            </Card>
          ) : (
            <>
              <Card>
                <CardHeader>
                  <CardTitle>أفضل الموظفين أداءً</CardTitle>
                  <CardDescription>ترتيب الموظفين حسب تقييم الأداء هذا الشهر</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {sortedMetrics.slice(0, 8).map((metric, index) => (
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
                                {Array.from({ length: 5 }).map((_, i) => (
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
                              <span className="text-xs text-muted-foreground">({metric.customerRating.toFixed(1)})</span>
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
                            <span className="text-xs text-muted-foreground">{metric.conversionRate}% تحويل</span>
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
                    <CardDescription>مقاييس الأداء الرئيسية للموظفين</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">متوسط رضا العملاء:</span>
                        <span className="font-medium">{averageCustomerSatisfaction}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">متوسط معدل التحويل:</span>
                        <span className="font-medium">{averageConversionRate}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">إجمالي الإيرادات:</span>
                        <span className="font-medium">
                          {new Intl.NumberFormat('ar-EG', {
                            style: 'currency',
                            currency: 'EGP',
                            minimumFractionDigits: 0
                          }).format(totalRevenue)}
                        </span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">متوسط وقت الاستجابة:</span>
                        <span className="font-medium">{averageResponseTime} دقيقة</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>ملاحظات وتوصيات</CardTitle>
                    <CardDescription>نظرة عامة على فرص التحسين</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className="list-disc pr-5 space-y-2 text-sm text-muted-foreground">
                      <li>تابع الموظفين الذين تقل نسبة أدائهم عن 70% لوضع خطة تطوير فردية.</li>
                      <li>شجع الموظفين المتميزين على مشاركة أفضل الممارسات مع الفريق.</li>
                      <li>استخدم تقييم الأداء الشهري لرصد التقدم وتحديد فرص التدريب.</li>
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </>
          )}
        </>
      )}
    </div>
  )
}
