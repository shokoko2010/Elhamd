interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    // For development, skip authentication temporarily
    // const user = await getAuthUser()
    // if (!user) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }

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

    // Initialize default values
    let totalCampaigns = 0
    let activeCampaigns = 0
    let totalLeads = 0
    let qualifiedLeads = 0
    let convertedLeads = 0
    let totalTargets = 0
    let achievedTargets = 0
    let revenueGenerated = 0

    try {
      // Fetch campaigns data
      [totalCampaigns, activeCampaigns] = await Promise.all([
        db.marketingCampaign.count({ where }).catch(() => 0),
        db.marketingCampaign.count({
          where: {
            ...where,
            status: 'ACTIVE'
          }
        }).catch(() => 0)
      ])
    } catch (error) {
      console.warn('Error fetching campaigns data:', error)
    }

    try {
      // Fetch leads data
      [totalLeads, qualifiedLeads, convertedLeads] = await Promise.all([
        db.lead.count({ where }).catch(() => 0),
        db.lead.count({
          where: {
            ...where,
            status: {
              in: ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON']
            }
          }
        }).catch(() => 0),
        db.lead.count({
          where: {
            ...where,
            status: 'CLOSED_WON'
          }
        }).catch(() => 0)
      ])
    } catch (error) {
      console.warn('Error fetching leads data:', error)
    }

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    try {
      // Fetch targets data
      [totalTargets, achievedTargets] = await Promise.all([
        db.salesTarget.count({
          where: {
            ...where,
            OR: [
              { startDate: { lte: now }, endDate: { gte: now } },
              { startDate: { lte: now }, endDate: null }
            ]
          }
        }).catch(() => 0),
        db.salesTarget.count({
          where: {
            ...where,
            status: 'COMPLETED',
            OR: [
              { startDate: { lte: now }, endDate: { gte: now } },
              { startDate: { lte: now }, endDate: null }
            ]
          }
        }).catch(() => 0)
      ])
    } catch (error) {
      console.warn('Error fetching targets data:', error)
    }

    try {
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
        }).catch(() => ({ _sum: { estimatedValue: 0 } })),
        // Revenue from invoices in the period
        db.invoice.aggregate({
          where: {
            ...where,
            status: 'PAID'
          },
          _sum: {
            totalAmount: true
          }
        }).catch(() => ({ _sum: { totalAmount: 0 } }))
      ])

      const revenueFromLeads = revenueData[0]._sum.estimatedValue || 0
      const revenueFromInvoices = revenueData[1]._sum.totalAmount || 0
      revenueGenerated = revenueFromLeads + revenueFromInvoices
    } catch (error) {
      console.warn('Error calculating revenue:', error)
    }

    // Fetch marketing metrics
    let marketingMetrics = null
    try {
      marketingMetrics = await db.marketingMetric.findFirst({
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
    } catch (error) {
      console.warn('Error fetching marketing metrics:', error)
    }

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
    // Return default values on error
    return NextResponse.json({
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalLeads: 0,
      qualifiedLeads: 0,
      conversionRate: 0,
      totalTargets: 0,
      achievedTargets: 0,
      revenueGenerated: 0,
      marketingMetrics: {
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
      period: 'month',
      startDate: new Date(),
      endDate: new Date()
    })
  }
}