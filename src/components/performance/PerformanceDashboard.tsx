'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  TrendingUp, 
  TrendingDown, 
  BarChart3, 
  PieChart, 
  Target,
  Users,
  Clock,
  DollarSign,
  Star,
  CheckCircle,
  Calendar,
  Download,
  RefreshCw
} from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { useSession } from 'next-auth/react'

interface PerformanceMetric {
  id: string
  employeeId: string
  period: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY' | string
  bookingsHandled: number
  averageHandlingTime: number
  customerRating: number
  conversionRate: number
  revenueGenerated: number
  tasksCompleted: number
  customerSatisfaction: number
  notes?: string
  createdAt: string
  updatedAt: string
  attendanceSummary?: {
    attendanceScore: number
    presentDays: number
    lateDays: number
    absentDays: number
    excusedDays: number
    trackedDays: number
  }
  invoiceSummary?: {
    created: number
    paid: number
    partiallyPaid: number
    draft: number
    revenue: number
    collected: number
    outstanding: number
    averageValue: number
  }
  conversionSummary?: {
    conversionRate: number
    followUpRate: number
  }
}

interface PerformanceStats {
  totalBookings: number
  averageRating: number
  totalRevenue: number
  totalTasks: number
  conversionRate: number
  satisfactionRate: number
}

export default function PerformanceDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([])
  const [stats, setStats] = useState<PerformanceStats>({
    totalBookings: 0,
    averageRating: 0,
    totalRevenue: 0,
    totalTasks: 0,
    conversionRate: 0,
    satisfactionRate: 0
  })
  const [loading, setLoading] = useState(true)
  const [selectedPeriod, setSelectedPeriod] = useState<string>('MONTHLY')
  const [selectedEmployee, setSelectedEmployee] = useState<string>('')
  const [dateRange, setDateRange] = useState({ start: '', end: '' })

  useEffect(() => {
    if (session?.user?.id) {
      setSelectedEmployee(session.user.id)
      fetchPerformanceMetrics()
    }
  }, [session, selectedPeriod, selectedEmployee])

  const fetchPerformanceMetrics = async () => {
    try {
      setLoading(true)
      
      const params = new URLSearchParams({
        employeeId: selectedEmployee,
        period: selectedPeriod
      })

      if (dateRange.start && dateRange.end) {
        params.append('startDate', dateRange.start)
        params.append('endDate', dateRange.end)
      }

      const response = await fetch(`/api/performance?${params}`)
      if (response.ok) {
        const data = await response.json()
        setMetrics(data)
        calculateStats(data)
      }
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch performance metrics',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const calculateStats = (metricsData: PerformanceMetric[]) => {
    if (metricsData.length === 0) {
      setStats({
        totalBookings: 0,
        averageRating: 0,
        totalRevenue: 0,
        totalTasks: 0,
        conversionRate: 0,
        satisfactionRate: 0
      })
      return
    }

    const totalBookings = metricsData.reduce((sum, metric) => sum + metric.bookingsHandled, 0)
    const totalRevenue = metricsData.reduce((sum, metric) => sum + metric.revenueGenerated, 0)
    const totalTasks = metricsData.reduce((sum, metric) => sum + metric.tasksCompleted, 0)
    
    const averageRating = metricsData.reduce((sum, metric) => sum + metric.customerRating, 0) / metricsData.length
    const averageConversionRate = metricsData.reduce((sum, metric) => sum + metric.conversionRate, 0) / metricsData.length
    const averageSatisfactionRate = metricsData.reduce((sum, metric) => sum + metric.customerSatisfaction, 0) / metricsData.length

    setStats({
      totalBookings,
      averageRating,
      totalRevenue,
      totalTasks,
      conversionRate: averageConversionRate,
      satisfactionRate: averageSatisfactionRate
    })
  }

  const getTrendIndicator = (current: number, previous: number) => {
    if (previous === 0) return { icon: TrendingUp, color: 'text-green-600', trend: 'up' }
    const change = ((current - previous) / previous) * 100
    if (change > 0) {
      return { icon: TrendingUp, color: 'text-green-600', trend: 'up', change: Math.abs(change) }
    } else if (change < 0) {
      return { icon: TrendingDown, color: 'text-red-600', trend: 'down', change: Math.abs(change) }
    }
    return { icon: TrendingUp, color: 'text-gray-600', trend: 'stable', change: 0 }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency: 'EGP'
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const exportReport = () => {
    const csvContent = [
      ['Period', 'Bookings Handled', 'Avg Handling Time', 'Customer Rating', 'Conversion Rate', 'Revenue Generated', 'Tasks Completed', 'Customer Satisfaction'],
      ...metrics.map(metric => [
        metric.period,
        metric.bookingsHandled,
        metric.averageHandlingTime,
        metric.customerRating,
        metric.conversionRate,
        metric.revenueGenerated,
        metric.tasksCompleted,
        metric.customerSatisfaction
      ])
    ].map(row => row.join(',')).join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `performance-report-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Performance Analytics</h2>
          <p className="text-gray-600">Track and analyze employee performance metrics</p>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DAILY">Daily</SelectItem>
              <SelectItem value="WEEKLY">Weekly</SelectItem>
              <SelectItem value="MONTHLY">Monthly</SelectItem>
              <SelectItem value="QUARTERLY">Quarterly</SelectItem>
              <SelectItem value="YEARLY">Yearly</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={fetchPerformanceMetrics}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          
          <Button onClick={exportReport}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Bookings</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBookings}</div>
            <p className="text-xs text-muted-foreground">
              Bookings handled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Rating</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageRating.toFixed(1)}/5</div>
            <p className="text-xs text-muted-foreground">
              Customer satisfaction
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Revenue Generated</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(stats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">
              Total revenue
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tasks completed
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Average conversion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Satisfaction Rate</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.satisfactionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              Customer satisfaction
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Performance Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Overview</CardTitle>
            <CardDescription>
              Key performance indicators over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="text-center py-8">
                <BarChart3 className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No performance data available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.slice(0, 5).map((metric, index) => {
                  const previousMetric = metrics[index + 1]
                  const bookingTrend = previousMetric ? getTrendIndicator(metric.bookingsHandled, previousMetric.bookingsHandled) : null
                  const revenueTrend = previousMetric ? getTrendIndicator(metric.revenueGenerated, previousMetric.revenueGenerated) : null

                  return (
                    <div key={metric.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <div className="font-medium">{metric.period}</div>
                        <div className="text-sm text-gray-600">{formatDate(metric.createdAt)}</div>
                      </div>
                      
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className="font-medium">{metric.bookingsHandled} bookings</div>
                          {bookingTrend && (
                            <div className={`flex items-center text-xs ${bookingTrend.color}`}>
                              <bookingTrend.icon className="w-3 h-3 mr-1" />
                              {bookingTrend.trend === 'up' ? '+' : ''}{bookingTrend.change?.toFixed(1)}%
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(metric.revenueGenerated)}</div>
                          {revenueTrend && (
                            <div className={`flex items-center text-xs ${revenueTrend.color}`}>
                              <revenueTrend.icon className="w-3 h-3 mr-1" />
                              {revenueTrend.trend === 'up' ? '+' : ''}{revenueTrend.change?.toFixed(1)}%
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right">
                          <div className="font-medium">{metric.customerRating.toFixed(1)}/5</div>
                          <div className="text-xs text-gray-600">Rating</div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Detailed Metrics</CardTitle>
            <CardDescription>
              Comprehensive performance breakdown
            </CardDescription>
          </CardHeader>
          <CardContent>
            {metrics.length === 0 ? (
              <div className="text-center py-8">
                <PieChart className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-600">No detailed metrics available</p>
              </div>
            ) : (
              <div className="space-y-4">
                {metrics.slice(0, 3).map((metric) => (
                  <div key={metric.id} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Average Handling Time</span>
                      <span className="text-sm">{metric.averageHandlingTime} min</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Conversion Rate</span>
                      <span className="text-sm">{metric.conversionRate.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Customer Satisfaction</span>
                      <span className="text-sm">{metric.customerSatisfaction.toFixed(1)}%</span>
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Tasks Completed</span>
                      <span className="text-sm">{metric.tasksCompleted}</span>
                    </div>
                    
                    {metric.notes && (
                      <div className="pt-2 border-t">
                        <p className="text-xs text-gray-600">{metric.notes}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Performance Goals */}
      <Card>
        <CardHeader>
          <CardTitle>Performance Goals</CardTitle>
          <CardDescription>
            Track progress towards performance targets
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                <span className="text-lg font-bold text-blue-600">
                  {Math.min(100, (stats.averageRating / 5) * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">Customer Rating</p>
              <p className="text-xs text-gray-600">Target: 4.5/5</p>
            </div>
            
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100">
                <span className="text-lg font-bold text-green-600">
                  {Math.min(100, stats.conversionRate).toFixed(0)}%
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">Conversion Rate</p>
              <p className="text-xs text-gray-600">Target: 80%</p>
            </div>
            
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-purple-100">
                <span className="text-lg font-bold text-purple-600">
                  {Math.min(100, stats.satisfactionRate).toFixed(0)}%
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">Satisfaction</p>
              <p className="text-xs text-gray-600">Target: 95%</p>
            </div>
            
            <div className="text-center">
              <div className="relative inline-flex items-center justify-center w-16 h-16 rounded-full bg-blue-100">
                <span className="text-lg font-bold text-blue-600">
                  {Math.min(100, (stats.totalTasks / 100) * 100).toFixed(0)}%
                </span>
              </div>
              <p className="mt-2 text-sm font-medium">Task Completion</p>
              <p className="text-xs text-gray-600">Target: 100 tasks</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}