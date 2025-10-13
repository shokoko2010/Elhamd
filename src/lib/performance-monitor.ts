// Performance monitoring utilities
export class PerformanceMonitor {
  private static metrics: Map<string, number[]> = new Map()

  static startTimer(name: string): () => void {
    const start = performance.now()
    return () => {
      const duration = performance.now() - start
      this.recordMetric(name, duration)
    }
  }

  static recordMetric(name: string, value: number): void {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  static getMetrics(name: string): { avg: number; min: number; max: number; count: number } | null {
    const values = this.metrics.get(name)
    if (!values || values.length === 0) {
      return null
    }

    const avg = values.reduce((sum, val) => sum + val, 0) / values.length
    const min = Math.min(...values)
    const max = Math.max(...values)

    return { avg, min, max, count: values.length }
  }

  static getAllMetrics(): Record<string, { avg: number; min: number; max: number; count: number }> {
    const result: Record<string, { avg: number; min: number; max: number; count: number }> = {}
    
    for (const [name] of this.metrics) {
      const metrics = this.getMetrics(name)
      if (metrics) {
        result[name] = metrics
      }
    }
    
    return result
  }

  static clearMetrics(name?: string): void {
    if (name) {
      this.metrics.delete(name)
    } else {
      this.metrics.clear()
    }
  }
}

// API response time monitoring middleware
export function withPerformanceMonitoring<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  name: string
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    const endTimer = PerformanceMonitor.startTimer(name)
    try {
      const result = await fn(...args)
      return result
    } catch (error) {
      console.error(`Error in ${name}:`, error)
      throw error
    } finally {
      endTimer()
    }
  }
}

// Memory usage monitoring
export function getMemoryUsage(): {
  used: number
  total: number
  percentage: number
  rss: number
  heapTotal: number
  heapUsed: number
  external: number
} {
  const usage = process.memoryUsage()
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const totalMemory = require('os').totalmem()
  const usedMemory = usage.rss

  return {
    used: usedMemory,
    total: totalMemory,
    percentage: (usedMemory / totalMemory) * 100,
    rss: usage.rss,
    heapTotal: usage.heapTotal,
    heapUsed: usage.heapUsed,
    external: usage.external
  }
}

// Database query performance monitoring
export function monitorDbQuery<T>(
  queryName: string,
  queryFn: () => Promise<T>
): Promise<T> {
  const endTimer = PerformanceMonitor.startTimer(`db:${queryName}`)
  
  return queryFn()
    .then(result => {
      endTimer()
      return result
    })
    .catch(error => {
      endTimer()
      console.error(`Database query ${queryName} failed:`, error)
      throw error
    })
}