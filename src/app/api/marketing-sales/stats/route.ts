interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { authenticateProductionUser, executeWithRetry } from '@/lib/auth-server'
import { db } from '@/lib/db'
import {
  startOfDay,
  endOfDay,
  subDays,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
  differenceInCalendarDays,
} from 'date-fns'
import type { MarketingMetric } from '@prisma/client'

const defaultMarketingMetrics = {
  campaignsSent: 0,
  emailsSent: 0,
  emailsOpened: 0,
  emailsClicked: 0,
  leadsGenerated: 0,
  leadsConverted: 0,
  conversionRate: 0,
  costPerLead: 0,
  costPerAcquisition: 0,
  roi: 0,
}

const roundToOneDecimal = (value: number) => Math.round(value * 10) / 10

const safeExecute = async <T>(
  operation: () => Promise<T>,
  fallback: T,
  label?: string
): Promise<T> => {
  try {
    return await executeWithRetry(operation)
  } catch (error) {
    if (label) {
      console.warn(`${label}:`, error)
    }

    return fallback
  }
}

const calculateGrowth = (current: number, previous: number) => {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) {
    return 0
  }

  if (previous === 0) {
    if (current === 0) {
      return 0
    }

    return roundToOneDecimal(current > 0 ? 100 : -100)
  }

  return roundToOneDecimal(((current - previous) / previous) * 100)
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateProductionUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const branchParam = searchParams.get('branchId')
    const branchFilter = branchParam && branchParam !== 'all' ? branchParam : undefined

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

    startDate = startOfDay(startDate)
    endDate = endOfDay(endDate)

    const periodLengthDays = Math.max(differenceInCalendarDays(endDate, startDate) + 1, 1)
    const previousPeriodEnd = subDays(startDate, 1)
    const previousPeriodStart = subDays(previousPeriodEnd, periodLengthDays - 1)

    const branchCondition = branchFilter ? { branchId: branchFilter } : {}

    const leadWhere = {
      ...branchCondition,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }

    const previousLeadWhere = {
      ...branchCondition,
      createdAt: {
        gte: previousPeriodStart,
        lte: endOfDay(previousPeriodEnd),
      },
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
    let totalSales = 0
    let totalRevenue = 0
    let newCustomers = 0
    let previousSales = 0
    let previousRevenue = 0
    let previousNewCustomers = 0
    let previousConversionRate = 0

    let previousLeads = 0
    let previousConvertedLeads = 0

    const campaignWindow = {
      ...branchCondition,
      OR: [
        {
          startDate: { lte: endDate },
          endDate: { gte: startDate },
        },
        {
          startDate: { gte: startDate, lte: endDate },
        },
        {
          endDate: null,
        },
      ],
    }

    ;[totalCampaigns, activeCampaigns] = await Promise.all([
      safeExecute(
        () => db.marketingCampaign.count({ where: campaignWindow }),
        0,
        'Error fetching campaigns data'
      ),
      safeExecute(
        () =>
          db.marketingCampaign.count({
            where: {
              ...campaignWindow,
              status: 'ACTIVE',
            },
          }),
        0,
        'Error fetching active campaigns data'
      ),
    ])

    ;[totalLeads, qualifiedLeads, convertedLeads] = await Promise.all([
      safeExecute(() => db.lead.count({ where: leadWhere }), 0, 'Error fetching leads data'),
      safeExecute(
        () =>
          db.lead.count({
            where: {
              ...leadWhere,
              status: {
                in: ['QUALIFIED', 'PROPOSAL', 'NEGOTIATION', 'CLOSED_WON'],
              },
            },
          }),
        0,
        'Error fetching qualified leads data'
      ),
      safeExecute(
        () =>
          db.lead.count({
            where: {
              ...leadWhere,
              status: 'CLOSED_WON',
            },
          }),
        0,
        'Error fetching converted leads data'
      ),
    ])

    ;[previousLeads, previousConvertedLeads] = await Promise.all([
      safeExecute(
        () => db.lead.count({ where: previousLeadWhere }),
        0,
        'Error fetching previous leads data'
      ),
      safeExecute(
        () =>
          db.lead.count({
            where: {
              ...previousLeadWhere,
              status: 'CLOSED_WON',
            },
          }),
        0,
        'Error fetching previous converted leads data'
      ),
    ])

    // Calculate conversion rate
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0
    previousConversionRate = previousLeads > 0 ? (previousConvertedLeads / previousLeads) * 100 : 0

    const invoiceWhere = {
      ...branchCondition,
      status: 'PAID' as const,
      issueDate: {
        gte: startDate,
        lte: endDate,
      },
    }

    const previousInvoiceWhere = {
      ...branchCondition,
      status: 'PAID' as const,
      issueDate: {
        gte: previousPeriodStart,
        lte: endOfDay(previousPeriodEnd),
      },
    }

    const [currentInvoiceMetrics, previousInvoiceMetrics] = await Promise.all([
      Promise.all([
        safeExecute(() => db.invoice.count({ where: invoiceWhere }), 0, 'Error counting invoices'),
        safeExecute(
          () =>
            db.invoice.aggregate({
              where: invoiceWhere,
              _sum: { totalAmount: true },
            }),
          { _sum: { totalAmount: 0 } },
          'Error aggregating invoice totals'
        ),
      ]),
      Promise.all([
        safeExecute(
          () => db.invoice.count({ where: previousInvoiceWhere }),
          0,
          'Error counting previous invoices'
        ),
        safeExecute(
          () =>
            db.invoice.aggregate({
              where: previousInvoiceWhere,
              _sum: { totalAmount: true },
            }),
          { _sum: { totalAmount: 0 } },
          'Error aggregating previous invoice totals'
        ),
      ]),
    ])

    totalSales = currentInvoiceMetrics[0]
    totalRevenue = Number(currentInvoiceMetrics[1]._sum.totalAmount || 0)

    previousSales = previousInvoiceMetrics[0]
    previousRevenue = Number(previousInvoiceMetrics[1]._sum.totalAmount || 0)

    const customerWhere: any = {
      ...branchCondition,
      createdAt: {
        gte: startDate,
        lte: endDate,
      },
    }

    if (branchFilter) {
      customerWhere.user = { branchId: branchFilter }
    }

    const previousCustomerWhere: any = {
      ...branchCondition,
      createdAt: {
        gte: previousPeriodStart,
        lte: endOfDay(previousPeriodEnd),
      },
    }

    if (branchFilter) {
      previousCustomerWhere.user = { branchId: branchFilter }
    }

    ;[newCustomers, previousNewCustomers] = await Promise.all([
      safeExecute(() => db.customerProfile.count({ where: customerWhere }), 0, 'Error counting new customers'),
      safeExecute(
        () => db.customerProfile.count({ where: previousCustomerWhere }),
        0,
        'Error counting previous new customers'
      ),
    ])

    const targetWindow = {
      ...branchCondition,
      OR: [
        { startDate: { lte: now }, endDate: { gte: now } },
        { startDate: { lte: now }, endDate: null },
      ],
    }

    ;[totalTargets, achievedTargets] = await Promise.all([
      safeExecute(
        () => db.salesTarget.count({ where: targetWindow }),
        0,
        'Error fetching targets data'
      ),
      safeExecute(
        () =>
          db.salesTarget.count({
            where: {
              ...targetWindow,
              status: 'COMPLETED',
            },
          }),
        0,
        'Error fetching achieved targets data'
      ),
    ])

    const revenueData = await Promise.all([
      safeExecute(
        () =>
          db.lead.aggregate({
            where: {
              ...leadWhere,
              status: 'CLOSED_WON',
              estimatedValue: { not: null },
            },
            _sum: {
              estimatedValue: true,
            },
          }),
        { _sum: { estimatedValue: 0 } },
        'Error aggregating revenue from leads'
      ),
      safeExecute(
        () =>
          db.invoice.aggregate({
            where: invoiceWhere,
            _sum: {
              totalAmount: true,
            },
          }),
        { _sum: { totalAmount: 0 } },
        'Error aggregating revenue from invoices'
      ),
    ])

    const revenueFromLeads = Number(revenueData[0]._sum.estimatedValue || 0)
    const revenueFromInvoices = Number(revenueData[1]._sum.totalAmount || 0)
    revenueGenerated = revenueFromLeads + revenueFromInvoices

    const mapMarketingMetrics = (metrics?: MarketingMetric | null) => ({
      ...defaultMarketingMetrics,
      ...(metrics
        ? {
            campaignsSent: metrics.campaignsSent,
            emailsSent: metrics.emailsSent,
            emailsOpened: metrics.emailsOpened,
            emailsClicked: metrics.emailsClicked,
            leadsGenerated: metrics.leadsGenerated,
            leadsConverted: metrics.leadsConverted,
            conversionRate: metrics.conversionRate,
            costPerLead: metrics.costPerLead,
            costPerAcquisition: metrics.costPerAcquisition,
            roi: metrics.roi,
          }
        : {}),
    })

    const marketingMetrics = await safeExecute(
      () =>
        db.marketingMetric.findFirst({
          where: {
            date: {
              gte: startDate,
              lte: endDate,
            },
            ...(branchFilter && { branchId: branchFilter }),
          },
          orderBy: {
            date: 'desc',
          },
        }),
      null,
      'Error fetching marketing metrics'
    )

    const marketingMetricsData = mapMarketingMetrics(marketingMetrics)

    const stats = {
      totalSales,
      totalRevenue: Math.round(totalRevenue * 100) / 100,
      newCustomers,
      conversionRate: Math.round(conversionRate * 100) / 100,
      monthlyGrowth: {
        sales: calculateGrowth(totalSales, previousSales),
        revenue: calculateGrowth(totalRevenue, previousRevenue),
        customers: calculateGrowth(newCustomers, previousNewCustomers),
        conversion: calculateGrowth(conversionRate, previousConversionRate),
      },
      totalCampaigns,
      activeCampaigns,
      totalLeads,
      qualifiedLeads,
      convertedLeads,
      totalTargets,
      achievedTargets,
      revenueGenerated: Math.round(revenueGenerated * 100) / 100,
      marketingMetrics: marketingMetricsData,
      marketing: {
        totalCampaigns,
        activeCampaigns,
        totalLeads,
        qualifiedLeads,
        convertedLeads,
        conversionRate: Math.round(conversionRate * 100) / 100,
        totalTargets,
        achievedTargets,
        revenueGenerated: Math.round(revenueGenerated * 100) / 100,
        marketingMetrics: marketingMetricsData,
      },
      period,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching marketing sales stats:', error)
    // Return default values on error
    return NextResponse.json({
      totalSales: 0,
      totalRevenue: 0,
      newCustomers: 0,
      conversionRate: 0,
      monthlyGrowth: {
        sales: 0,
        revenue: 0,
        customers: 0,
        conversion: 0,
      },
      totalCampaigns: 0,
      activeCampaigns: 0,
      totalLeads: 0,
      qualifiedLeads: 0,
      convertedLeads: 0,
      totalTargets: 0,
      achievedTargets: 0,
      revenueGenerated: 0,
      marketingMetrics: defaultMarketingMetrics,
      marketing: {
        totalCampaigns: 0,
        activeCampaigns: 0,
        totalLeads: 0,
        qualifiedLeads: 0,
        convertedLeads: 0,
        conversionRate: 0,
        totalTargets: 0,
        achievedTargets: 0,
        revenueGenerated: 0,
        marketingMetrics: defaultMarketingMetrics,
      },
      period: 'month',
      startDate: new Date().toISOString(),
      endDate: new Date().toISOString(),
    })
  }
}
