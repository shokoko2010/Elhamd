import { NextRequest, NextResponse } from 'next/server'
import { enhancedPerformanceService } from './enhanced-performance-service'

export interface PerformanceMetrics {
  timestamp: Date
  pageLoad: {
    firstContentfulPaint: number
    largestContentfulPaint: number
    firstInputDelay: number
    cumulativeLayoutShift: number
    timeToInteractive: number
  }
  network: {
    requestCount: number
    totalSize: number
    cachedRequests: number
    compressionRatio: number
  }
  userExperience: {
    bounceRate: number
    sessionDuration: number
    pagesPerSession: number
  }
  system: {
    cpuUsage: number
    memoryUsage: number
    diskUsage: number
    uptime: number
  }
}

export interface PerformanceAlert {
  id: string
  type: 'performance' | 'memory' | 'network' | 'error'
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  resolved: boolean
  metadata?: Record<string, any>
}

export interface PerformanceReport {
  period: {
    start: Date
    end: Date
  }
  summary: {
    averageLoadTime: number
    averageBounceRate: number
    averageSessionDuration: number
    totalPageViews: number
    totalUsers: number
    performanceScore: number
  }
  metrics: PerformanceMetrics[]
  alerts: PerformanceAlert[]
  recommendations: string[]
  trends: {
    loadTime: { date: Date; value: number }[]
    bounceRate: { date: Date; value: number }[]
    sessionDuration: { date: Date; value: number }[]
  }
}

export class PerformanceAnalyticsService {
  private static instance: PerformanceAnalyticsService
  private metrics: PerformanceMetrics[] = []
  private alerts: PerformanceAlert[] = []
  private thresholds = {
    firstContentfulPaint: 2000, // 2 seconds
    largestContentfulPaint: 4000, // 4 seconds
    firstInputDelay: 100, // 100ms
    cumulativeLayoutShift: 0.1, // 0.1
    timeToInteractive: 3000, // 3 seconds
    memoryUsage: 500, // 500MB
    bounceRate: 0.6, // 60%
    compressionRatio: 0.5 // 50%
  }

  private constructor() {
    this.initializeMonitoring()
  }

  static getInstance(): PerformanceAnalyticsService {
    if (!PerformanceAnalyticsService.instance) {
      PerformanceAnalyticsService.instance = new PerformanceAnalyticsService()
    }
    return PerformanceAnalyticsService.instance
  }

  private initializeMonitoring(): void {
    // Collect metrics every 30 seconds
    setInterval(() => this.collectMetrics(), 30 * 1000)
    
    // Check for alerts every minute
    setInterval(() => this.checkAlerts(), 60 * 1000)
    
    // Cleanup old data every hour
    setInterval(() => this.cleanupOldData(), 60 * 60 * 1000)
    
    // Generate daily report
    setInterval(() => this.generateDailyReport(), 24 * 60 * 60 * 1000)
  }

  // Record performance metrics
  recordMetrics(metrics: Partial<PerformanceMetrics>): void {
    const fullMetrics: PerformanceMetrics = {
      timestamp: new Date(),
      pageLoad: {
        firstContentfulPaint: metrics.pageLoad?.firstContentfulPaint || 0,
        largestContentfulPaint: metrics.pageLoad?.largestContentfulPaint || 0,
        firstInputDelay: metrics.pageLoad?.firstInputDelay || 0,
        cumulativeLayoutShift: metrics.pageLoad?.cumulativeLayoutShift || 0,
        timeToInteractive: metrics.pageLoad?.timeToInteractive || 0
      },
      network: {
        requestCount: metrics.network?.requestCount || 0,
        totalSize: metrics.network?.totalSize || 0,
        cachedRequests: metrics.network?.cachedRequests || 0,
        compressionRatio: metrics.network?.compressionRatio || 0
      },
      userExperience: {
        bounceRate: metrics.userExperience?.bounceRate || 0,
        sessionDuration: metrics.userExperience?.sessionDuration || 0,
        pagesPerSession: metrics.userExperience?.pagesPerSession || 0
      },
      system: {
        cpuUsage: metrics.system?.cpuUsage || 0,
        memoryUsage: metrics.system?.memoryUsage || 0,
        diskUsage: metrics.system?.diskUsage || 0,
        uptime: metrics.system?.uptime || 0
      }
    }

    this.metrics.push(fullMetrics)

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000)
    }
  }

  // Collect system metrics
  private collectMetrics(): void {
    const memUsage = process.memoryUsage()
    const systemMetrics: Partial<PerformanceMetrics> = {
      system: {
        cpuUsage: Math.random() * 100, // Simulated CPU usage
        memoryUsage: memUsage.heapUsed / 1024 / 1024, // MB
        diskUsage: Math.random() * 100, // Simulated disk usage
        uptime: process.uptime()
      }
    }

    this.recordMetrics(systemMetrics)
  }

  // Check for performance alerts
  private checkAlerts(): void {
    if (this.metrics.length === 0) return

    const latestMetrics = this.metrics[this.metrics.length - 1]

    // Check page load metrics
    if (latestMetrics.pageLoad.firstContentfulPaint > this.thresholds.firstContentfulPaint) {
      this.createAlert('performance', 'high', `Slow FCP detected: ${latestMetrics.pageLoad.firstContentfulPaint}ms`)
    }

    if (latestMetrics.pageLoad.largestContentfulPaint > this.thresholds.largestContentfulPaint) {
      this.createAlert('performance', 'high', `Slow LCP detected: ${latestMetrics.pageLoad.largestContentfulPaint}ms`)
    }

    if (latestMetrics.pageLoad.firstInputDelay > this.thresholds.firstInputDelay) {
      this.createAlert('performance', 'medium', `High FID detected: ${latestMetrics.pageLoad.firstInputDelay}ms`)
    }

    if (latestMetrics.pageLoad.cumulativeLayoutShift > this.thresholds.cumulativeLayoutShift) {
      this.createAlert('performance', 'medium', `High CLS detected: ${latestMetrics.pageLoad.cumulativeLayoutShift}`)
    }

    // Check system metrics
    if (latestMetrics.system.memoryUsage > this.thresholds.memoryUsage) {
      this.createAlert('memory', 'high', `High memory usage: ${latestMetrics.system.memoryUsage}MB`)
    }

    // Check network metrics
    if (latestMetrics.network.compressionRatio < this.thresholds.compressionRatio) {
      this.createAlert('network', 'low', `Low compression ratio: ${(latestMetrics.network.compressionRatio * 100).toFixed(1)}%`)
    }

    // Check user experience metrics
    if (latestMetrics.userExperience.bounceRate > this.thresholds.bounceRate) {
      this.createAlert('performance', 'medium', `High bounce rate: ${(latestMetrics.userExperience.bounceRate * 100).toFixed(1)}%`)
    }
  }

  // Create alert
  private createAlert(
    type: 'performance' | 'memory' | 'network' | 'error',
    severity: 'low' | 'medium' | 'high' | 'critical',
    message: string,
    metadata?: Record<string, any>
  ): void {
    const alert: PerformanceAlert = {
      id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type,
      severity,
      message,
      timestamp: new Date(),
      resolved: false,
      metadata
    }

    this.alerts.push(alert)

    // Keep only last 100 alerts
    if (this.alerts.length > 100) {
      this.alerts = this.alerts.slice(-100)
    }
  }

  // Cleanup old data
  private cleanupOldData(): void {
    const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    
    // Cleanup old metrics
    this.metrics = this.metrics.filter(metric => metric.timestamp > oneWeekAgo)
    
    // Cleanup old resolved alerts
    this.alerts = this.alerts.filter(alert => 
      alert.timestamp > oneWeekAgo || !alert.resolved
    )
  }

  // Generate daily report
  private generateDailyReport(): void {
    const report = this.generateReport({
      period: 'day',
      startDate: new Date(Date.now() - 24 * 60 * 60 * 1000),
      endDate: new Date()
    })

    // Log report (in real implementation, this would send to monitoring service)
    console.log('Daily Performance Report:', report.summary)
  }

  // Get current metrics
  getCurrentMetrics(): PerformanceMetrics | null {
    return this.metrics.length > 0 ? this.metrics[this.metrics.length - 1] : null
  }

  // Get metrics history
  getMetricsHistory(options: {
    period?: 'hour' | 'day' | 'week' | 'month'
    limit?: number
  } = {}): PerformanceMetrics[] {
    const { period = 'day', limit = 100 } = options
    
    let cutoff = new Date()
    switch (period) {
      case 'hour':
        cutoff.setHours(cutoff.getHours() - 1)
        break
      case 'day':
        cutoff.setDate(cutoff.getDate() - 1)
        break
      case 'week':
        cutoff.setDate(cutoff.getDate() - 7)
        break
      case 'month':
        cutoff.setMonth(cutoff.getMonth() - 1)
        break
    }

    return this.metrics
      .filter(metric => metric.timestamp > cutoff)
      .slice(-limit)
  }

  // Get alerts
  getAlerts(options: {
    resolved?: boolean
    severity?: ('low' | 'medium' | 'high' | 'critical')[]
    type?: ('performance' | 'memory' | 'network' | 'error')[]
    limit?: number
  } = {}): PerformanceAlert[] {
    const { resolved = false, severity, type, limit = 50 } = options

    let filteredAlerts = this.alerts.filter(alert => alert.resolved === resolved)

    if (severity) {
      filteredAlerts = filteredAlerts.filter(alert => severity.includes(alert.severity))
    }

    if (type) {
      filteredAlerts = filteredAlerts.filter(alert => type.includes(alert.type))
    }

    return filteredAlerts.slice(-limit)
  }

  // Resolve alert
  resolveAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId)
    if (alert) {
      alert.resolved = true
      return true
    }
    return false
  }

  // Generate performance report
  generateReport(options: {
    period: 'hour' | 'day' | 'week' | 'month'
    startDate: Date
    endDate: Date
  }): PerformanceReport {
    const { period, startDate, endDate } = options

    // Filter metrics for the period
    const periodMetrics = this.metrics.filter(
      metric => metric.timestamp >= startDate && metric.timestamp <= endDate
    )

    // Calculate summary
    const summary = {
      averageLoadTime: this.calculateAverage(periodMetrics, m => m.pageLoad.timeToInteractive),
      averageBounceRate: this.calculateAverage(periodMetrics, m => m.userExperience.bounceRate),
      averageSessionDuration: this.calculateAverage(periodMetrics, m => m.userExperience.sessionDuration),
      totalPageViews: periodMetrics.length,
      totalUsers: Math.floor(periodMetrics.length * 0.8), // Simulated
      performanceScore: this.calculatePerformanceScore(periodMetrics)
    }

    // Generate trends
    const trends = this.generateTrends(periodMetrics)

    // Generate recommendations
    const recommendations = this.generateRecommendations(periodMetrics)

    return {
      period: {
        start: startDate,
        end: endDate
      },
      summary,
      metrics: periodMetrics,
      alerts: this.alerts.filter(alert => 
        alert.timestamp >= startDate && alert.timestamp <= endDate
      ),
      recommendations,
      trends
    }
  }

  // Calculate average
  private calculateAverage(
    metrics: PerformanceMetrics[],
    accessor: (metric: PerformanceMetrics) => number
  ): number {
    if (metrics.length === 0) return 0
    
    const sum = metrics.reduce((acc, metric) => acc + accessor(metric), 0)
    return sum / metrics.length
  }

  // Calculate performance score
  private calculatePerformanceScore(metrics: PerformanceMetrics[]): number {
    if (metrics.length === 0) return 0

    let score = 100

    // Deduct points for slow page load
    const avgFCP = this.calculateAverage(metrics, m => m.pageLoad.firstContentfulPaint)
    const avgLCP = this.calculateAverage(metrics, m => m.pageLoad.largestContentfulPaint)

    if (avgFCP > this.thresholds.firstContentfulPaint) {
      score -= 20
    }
    if (avgLCP > this.thresholds.largestContentfulPaint) {
      score -= 20
    }

    // Deduct points for high memory usage
    const avgMemory = this.calculateAverage(metrics, m => m.system.memoryUsage)
    if (avgMemory > this.thresholds.memoryUsage) {
      score -= 15
    }

    // Deduct points for high bounce rate
    const avgBounceRate = this.calculateAverage(metrics, m => m.userExperience.bounceRate)
    if (avgBounceRate > this.thresholds.bounceRate) {
      score -= 15
    }

    return Math.max(0, Math.min(100, score))
  }

  // Generate trends
  private generateTrends(metrics: PerformanceMetrics[]): PerformanceReport['trends'] {
    // Group metrics by hour/day for trend analysis
    const grouped = this.groupMetricsByTime(metrics)

    return {
      loadTime: grouped ? Object.entries(grouped).map(([time, group]) => ({
        date: new Date(time),
        value: this.calculateAverage(group, m => m.pageLoad.timeToInteractive)
      })) : [],
      bounceRate: grouped ? Object.entries(grouped).map(([time, group]) => ({
        date: new Date(time),
        value: this.calculateAverage(group, m => m.userExperience.bounceRate)
      })) : [],
      sessionDuration: grouped ? Object.entries(grouped).map(([time, group]) => ({
        date: new Date(time),
        value: this.calculateAverage(group, m => m.userExperience.sessionDuration)
      })) : []
    }
  }

  // Group metrics by time
  private groupMetricsByTime(metrics: PerformanceMetrics[]): Record<string, PerformanceMetrics[]> {
    const grouped: Record<string, PerformanceMetrics[]> = {}

    metrics.forEach(metric => {
      const key = metric.timestamp.toISOString().slice(0, 13) // Group by hour
      if (!grouped[key]) {
        grouped[key] = []
      }
      grouped[key].push(metric)
    })

    return grouped
  }

  // Generate recommendations
  private generateRecommendations(metrics: PerformanceMetrics[]): string[] {
    const recommendations: string[] = []

    if (metrics.length === 0) return recommendations

    const avgFCP = this.calculateAverage(metrics, m => m.pageLoad.firstContentfulPaint)
    const avgLCP = this.calculateAverage(metrics, m => m.pageLoad.largestContentfulPaint)
    const avgMemory = this.calculateAverage(metrics, m => m.system.memoryUsage)
    const avgBounceRate = this.calculateAverage(metrics, m => m.userExperience.bounceRate)

    if (avgFCP > this.thresholds.firstContentfulPaint) {
      recommendations.push('Optimize critical CSS and enable lazy loading to improve First Contentful Paint')
    }

    if (avgLCP > this.thresholds.largestContentfulPaint) {
      recommendations.push('Optimize images and implement proper caching to improve Largest Contentful Paint')
    }

    if (avgMemory > this.thresholds.memoryUsage) {
      recommendations.push('High memory usage detected. Consider optimizing database queries and implementing better caching strategies')
    }

    if (avgBounceRate > this.thresholds.bounceRate) {
      recommendations.push('High bounce rate detected. Consider improving page load speed and user experience')
    }

    const avgCompression = this.calculateAverage(metrics, m => m.network.compressionRatio)
    if (avgCompression < this.thresholds.compressionRatio) {
      recommendations.push('Enable compression for static assets to reduce bandwidth usage')
    }

    return recommendations
  }

  // Get real-time dashboard data
  getDashboardData(): {
    currentMetrics: PerformanceMetrics | null
    recentAlerts: PerformanceAlert[]
    performanceScore: number
    systemHealth: {
      status: 'healthy' | 'warning' | 'critical'
      issues: string[]
    }
    topIssues: Array<{
      type: string
      count: number
      severity: 'low' | 'medium' | 'high' | 'critical'
    }>
  } {
    const currentMetrics = this.getCurrentMetrics()
    const recentAlerts = this.getAlerts({ resolved: false, limit: 10 })
    const performanceScore = this.calculatePerformanceScore(this.metrics.slice(-100))

    // Calculate system health
    const systemHealth = this.calculateSystemHealth(currentMetrics)

    // Get top issues
    const topIssues = this.getTopIssues(recentAlerts)

    return {
      currentMetrics,
      recentAlerts,
      performanceScore,
      systemHealth,
      topIssues
    }
  }

  // Calculate system health
  private calculateSystemHealth(metrics: PerformanceMetrics | null): {
    status: 'healthy' | 'warning' | 'critical'
    issues: string[]
  } {
    if (!metrics) {
      return {
        status: 'warning',
        issues: ['No metrics available']
      }
    }

    const issues: string[] = []
    let status: 'healthy' | 'warning' | 'critical' = 'healthy'

    // Check various metrics
    if (metrics.system.memoryUsage > this.thresholds.memoryUsage) {
      issues.push('High memory usage')
      status = 'critical'
    }

    if (metrics.pageLoad.firstContentfulPaint > this.thresholds.firstContentfulPaint) {
      issues.push('Slow page load time')
      status = status === 'critical' ? 'critical' : 'warning'
    }

    if (metrics.userExperience.bounceRate > this.thresholds.bounceRate) {
      issues.push('High bounce rate')
      status = status === 'critical' ? 'critical' : 'warning'
    }

    return { status, issues }
  }

  // Get top issues
  private getTopIssues(alerts: PerformanceAlert[]): Array<{
    type: string
    count: number
    severity: 'low' | 'medium' | 'high' | 'critical'
  }> {
    const issueCount = new Map<string, { count: number; severity: 'low' | 'medium' | 'high' | 'critical' }>()

    alerts.forEach(alert => {
      const existing = issueCount.get(alert.type)
      if (existing) {
        existing.count++
        if (this.getSeverityWeight(alert.severity) > this.getSeverityWeight(existing.severity)) {
          existing.severity = alert.severity
        }
      } else {
        issueCount.set(alert.type, { count: 1, severity: alert.severity })
      }
    })

    return Array.from(issueCount.entries())
      .map(([type, data]) => ({ type, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)
  }

  // Get severity weight
  private getSeverityWeight(severity: 'low' | 'medium' | 'high' | 'critical'): number {
    const weights = { low: 1, medium: 2, high: 3, critical: 4 }
    return weights[severity]
  }

  // Health check
  async healthCheck(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy'
    checks: {
      metrics: boolean
      alerts: boolean
      monitoring: boolean
    }
    metrics: {
      totalMetrics: number
      totalAlerts: number
      unresolvedAlerts: number
    }
  }> {
    const checks = {
      metrics: this.metrics.length > 0,
      alerts: this.alerts.length < 1000,
      monitoring: true
    }

    const failedChecks = Object.values(checks).filter(check => !check).length
    
    let status: 'healthy' | 'degraded' | 'unhealthy' = 'healthy'
    if (failedChecks >= 2) {
      status = 'unhealthy'
    } else if (failedChecks >= 1) {
      status = 'degraded'
    }

    return {
      status,
      checks,
      metrics: {
        totalMetrics: this.metrics.length,
        totalAlerts: this.alerts.length,
        unresolvedAlerts: this.alerts.filter(a => !a.resolved).length
      }
    }
  }
}

// Export singleton instance
export const performanceAnalyticsService = PerformanceAnalyticsService.getInstance()