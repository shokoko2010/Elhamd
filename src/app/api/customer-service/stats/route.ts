interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const branchId = searchParams.get('branchId')

    let startDate: Date
    let endDate: Date

    const now = new Date()

    switch (period) {
      case 'today':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        break
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 0 })
        endDate = endOfWeek(now, { weekStartsOn: 0 })
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        break
      case 'quarter':
        const currentMonth = now.getMonth()
        const quarterStart = Math.floor(currentMonth / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
    }

    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (branchId) {
      where.branchId = branchId
    }

    // Fetch tickets data
    const [
      totalTickets,
      openTickets,
      resolvedTickets,
      ticketsData
    ] = await Promise.all([
      db.supportTicket.count({ where }),
      db.supportTicket.count({
        where: {
          ...where,
          status: {
            in: ['OPEN', 'IN_PROGRESS', 'PENDING_CUSTOMER']
          }
        }
      }),
      db.supportTicket.count({
        where: {
          ...where,
          status: 'RESOLVED'
        }
      }),
      db.supportTicket.findMany({
        where: {
          ...where,
          status: 'RESOLVED',
          resolvedAt: { not: null }
        },
        select: {
          createdAt: true,
          resolvedAt: true
        }
      })
    ])

    // Calculate average resolution time
    let avgResolutionTime = 0
    if (ticketsData.length > 0) {
      const resolutionTimes = ticketsData.map(ticket => {
        const created = new Date(ticket.createdAt).getTime()
        const resolved = new Date(ticket.resolvedAt!).getTime()
        return (resolved - created) / (1000 * 60 * 60) // Convert to hours
      })
      avgResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
    }

    // Fetch evaluations data
    const [
      totalEvaluations,
      evaluationsData
    ] = await Promise.all([
      db.serviceEvaluation.count({ where }),
      db.serviceEvaluation.findMany({
        where,
        select: {
          overallRating: true
        }
      })
    ])

    // Calculate average rating
    let avgRating = 0
    if (evaluationsData.length > 0) {
      avgRating = evaluationsData.reduce((sum, evaluation) => sum + evaluation.overallRating, 0) / evaluationsData.length
    }

    // Fetch complaints data
    const [
      totalComplaints,
      resolvedComplaints
    ] = await Promise.all([
      db.complaint.count({ where }),
      db.complaint.count({
        where: {
          ...where,
          status: 'RESOLVED'
        }
      })
    ])

    // Fetch knowledge base data
    const [
      knowledgeBaseViews,
      knowledgeBaseSearches
    ] = await Promise.all([
      db.customerServiceMetric.aggregate({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          ...(branchId && { branchId })
        },
        _sum: {
          knowledgeBaseViews: true
        }
      }),
      db.customerServiceMetric.aggregate({
        where: {
          date: {
            gte: startDate,
            lte: endDate
          },
          ...(branchId && { branchId })
        },
        _sum: {
          knowledgeBaseSearches: true
        }
      })
    ])

    const stats = {
      totalTickets,
      openTickets,
      resolvedTickets,
      avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
      totalEvaluations,
      avgRating: Math.round(avgRating * 100) / 100,
      totalComplaints,
      resolvedComplaints,
      knowledgeBaseViews: knowledgeBaseViews._sum.knowledgeBaseViews || 0,
      knowledgeBaseSearches: knowledgeBaseSearches._sum.knowledgeBaseSearches || 0,
      period,
      startDate,
      endDate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching customer service stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}