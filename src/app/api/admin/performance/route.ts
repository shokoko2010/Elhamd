import { NextRequest, NextResponse } from 'next/server'
import { PerformanceMonitor, getMemoryUsage } from '@/lib/performance-monitor'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admins to view performance metrics
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')

    if (metric) {
      const metrics = PerformanceMonitor.getMetrics(metric)
      return NextResponse.json({ metric, metrics })
    }

    const allMetrics = PerformanceMonitor.getAllMetrics()
    const memoryUsage = getMemoryUsage()

    return NextResponse.json({
      metrics: allMetrics,
      memory: memoryUsage,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch performance metrics' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    // Only allow admins to clear performance metrics
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const metric = searchParams.get('metric')

    if (metric) {
      PerformanceMonitor.clearMetrics(metric)
      return NextResponse.json({ message: `Cleared metrics for ${metric}` })
    }

    PerformanceMonitor.clearMetrics()
    return NextResponse.json({ message: 'Cleared all metrics' })
  } catch (error) {
    console.error('Error clearing performance metrics:', error)
    return NextResponse.json(
      { error: 'Failed to clear performance metrics' },
      { status: 500 }
    )
  }
}