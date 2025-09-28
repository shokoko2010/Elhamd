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

    // Fetch campaigns data
    const [
      totalCampaigns,
      activeCampaigns
    ] = await Promise.all([
      db.marketingCampaign.count({ where }),
      db.marketingCampaign.count({
        where: {
          ...where,
          status: 'ACTIVE'
        }
      })
    ])

    // Fetch leads data
    const [
      totalLeads,
      qualifiedLeads,
      convertedLeads
    ] = await Promise.all([
      db.lead.count({ where }),
      db.lead.count({
        where: {
          ...where,
          status: {
            in: ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON']
          }
        }
      }),
      db.lead.count({
        where: {
          ...where,
          status: 'CLOSED_WON'
        }
      })
    ])

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    // Fetch targets data
    const [
      totalTargets,
      achievedTargets
    ] = await Promise.all([
      db.salesTarget.count({
        where: {
          ...where,
          OR: [
            { startDate: { lte: now }, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: null }
          ]
        }
      }),
      db.salesTarget.count({
        where: {
          ...where,
          status: 'COMPLETED',
          OR: [
            { startDate: { lte: now }, endDate: { gte: now } },
            { startDate: { lte: now }, endDate: null }
          ]
        }
      })
    ])

    // Calculate revenue generated (from converted leads and invoices)
    const revenueData = await Promise.all([
      // Revenue from converted leads with estimated value
      db.lead.aggregate({
        where: {
          ...where,
          status: 'CLOSED_WON',
          estimatedValue: { not: null }
        },
        _sum: {
          estimatedValue: true
        }
      }),
      // Revenue from invoices in the period
      db.invoice.aggregate({
        where: {
          ...where,
          status: 'PAID'
        },
        _sum: {
          totalAmount: true
        }
      })
    ])

    const revenueFromLeads = revenueData[0]._sum.estimatedValue || 0
    const revenueFromInvoices = revenueData[1]._sum.totalAmount || 0
    const revenueGenerated = revenueFromLeads + revenueFromInvoices

    // Fetch marketing metrics
    const marketingMetrics = await db.marketingMetric.findFirst({
      where: {
        date: {
          gte: startDate,
          lte: endDate
        },
        ...(branchId && { branchId })
      },
      orderBy: {
        date: 'desc'
      }
    })

    const stats = {
      totalCampaigns,
      activeCampaigns,
      totalLeads,
      qualifiedLeads,
      conversionRate: Math.round(conversionRate * 100) / 100,
      totalTargets,
      achievedTargets,
      revenueGenerated: Math.round(revenueGenerated * 100) / 100,
      marketingMetrics: marketingMetrics || {
        campaignsSent: 0,
        emailsSent: 0,
        emailsOpened: 0,
        emailsClicked: 0,
        leadsGenerated: 0,
        leadsConverted: 0,
        conversionRate: 0,
        costPerLead: 0,
        costPerAcquisition: 0,
        roi: 0
      },
      period,
      startDate,
      endDate
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching marketing sales stats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}