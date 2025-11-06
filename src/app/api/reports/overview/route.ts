interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { authenticateProductionUser, executeWithRetry } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth } from 'date-fns'
import { Prisma } from '@prisma/client'

const isSchemaMissingError = (error: unknown) => {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return ['P2021', 'P2022', 'P2023'].includes(error.code)
  }

  return error instanceof Error && error.message.toLowerCase().includes('does not exist')
}

const safeExecute = async <T>(operation: () => Promise<T>, fallback: T): Promise<T> => {
  try {
    return await executeWithRetry(operation)
  } catch (error) {
    if (isSchemaMissingError(error)) {
      return fallback
    }

    throw error
  }
}

export async function GET(request: NextRequest) {
  try {
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    }

    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { status: 200, headers })
    }

    const user = await authenticateProductionUser(request)

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers })
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

    const branchFilter = branchId && branchId !== 'all' ? branchId : null
    const dateRange = {
      gte: startDate,
      lte: endDate,
    }

    const invoiceWhere: Prisma.InvoiceWhereInput = {
      createdAt: dateRange,
      ...(branchFilter ? { branchId: branchFilter } : {}),
    }

    const transactionWhere: Prisma.TransactionWhereInput = {
      createdAt: dateRange,
      ...(branchFilter ? { branchId: branchFilter } : {}),
    }

    const leadWhere: Prisma.LeadWhereInput = {
      createdAt: dateRange,
      ...(branchFilter ? { branchId: branchFilter } : {}),
    }

    const supportTicketWhere: Prisma.SupportTicketWhereInput = {
      createdAt: dateRange,
      ...(branchFilter ? { branchId: branchFilter } : {}),
    }

    const marketingCampaignWhere: Prisma.MarketingCampaignWhereInput = {
      createdAt: dateRange,
      ...(branchFilter ? { branchId: branchFilter } : {}),
    }

    const inventoryWhere: Prisma.InventoryItemWhereInput = branchFilter
      ? { branchId: branchFilter }
      : {}

    const customerBranchConditions = branchFilter
      ? [
          { user: { branchId: branchFilter } },
          { invoices: { some: { branchId: branchFilter } } },
        ]
      : []

    const withCustomerBranchFilter = (
      whereInput: Prisma.CustomerProfileWhereInput
    ): Prisma.CustomerProfileWhereInput => {
      if (!customerBranchConditions.length) {
        return whereInput
      }

      const existingAnd = Array.isArray(whereInput.AND)
        ? whereInput.AND
        : whereInput.AND
        ? [whereInput.AND]
        : []

      return {
        ...whereInput,
        AND: [
          ...existingAnd,
          {
            OR: customerBranchConditions,
          },
        ],
      }
    }

    const paidInvoiceWhere: Prisma.InvoiceWhereInput = {
      ...invoiceWhere,
      status: 'PAID',
    }

    const expenseTransactionWhere = {
      ...transactionWhere,
      type: 'EXPENSE',
    }

    const [totalRevenue, totalExpenses, invoicesData] = await Promise.all([
      safeExecute(
        () =>
          db.invoice.aggregate({
            where: paidInvoiceWhere,
            _sum: {
              totalAmount: true,
            },
          }),
        { _sum: { totalAmount: 0 } }
      ),
      safeExecute(
        () =>
          db.transaction.aggregate({
            where: expenseTransactionWhere,
            _sum: {
              amount: true,
            },
          }),
        { _sum: { amount: 0 } }
      ),
      safeExecute(
        () =>
          db.invoice.findMany({
            where: paidInvoiceWhere,
            select: {
              totalAmount: true,
              createdAt: true,
            },
          }),
        [] as Array<{ totalAmount: number | null; createdAt: Date }>
      ),
    ])

    const revenue = totalRevenue._sum.totalAmount || 0
    const expenses = totalExpenses._sum.amount || 0
    const netProfit = revenue - expenses

    const [totalCustomers, newCustomers, leadsData] = await Promise.all([
      safeExecute(
        () =>
          db.customerProfile.count({
            where: withCustomerBranchFilter({}),
          }),
        0
      ),
      safeExecute(
        () =>
          db.customerProfile.count({
            where: withCustomerBranchFilter({
              createdAt: {
                gte: startDate,
                lte: endDate,
              },
            }),
          }),
        0
      ),
      safeExecute(
        () =>
          db.lead.findMany({
            where: leadWhere,
            select: {
              status: true,
              estimatedValue: true,
            },
          }),
        [] as Array<{ status: string; estimatedValue: number | null }>
      ),
    ])

    const totalLeads = leadsData.length
    const convertedLeads = leadsData.filter(lead => lead.status === 'CLOSED_WON').length
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    const [totalTickets, resolvedTickets, ticketsData] = await Promise.all([
      safeExecute(
        () =>
          db.supportTicket.count({
            where: supportTicketWhere,
          }),
        0
      ),
      safeExecute(
        () =>
          db.supportTicket.count({
            where: {
              ...supportTicketWhere,
              status: 'RESOLVED',
            },
          }),
        0
      ),
      safeExecute(
        () =>
          db.supportTicket.findMany({
            where: {
              ...supportTicketWhere,
              status: 'RESOLVED',
              resolvedAt: { not: null },
            },
            select: {
              createdAt: true,
              resolvedAt: true,
            },
          }),
        [] as Array<{ createdAt: Date; resolvedAt: Date | null }>
      ),
    ])

    let avgResolutionTime = 0
    if (ticketsData.length > 0) {
      const resolutionTimes = ticketsData.map(ticket => {
        const created = new Date(ticket.createdAt).getTime()
        const resolved = new Date(ticket.resolvedAt!).getTime()
        return (resolved - created) / (1000 * 60 * 60)
      })
      avgResolutionTime = resolutionTimes.reduce((sum, time) => sum + time, 0) / resolutionTimes.length
    }

    const [totalCampaigns, activeCampaigns, campaignsData] = await Promise.all([
      safeExecute(
        () =>
          db.marketingCampaign.count({
            where: marketingCampaignWhere,
          }),
        0
      ),
      safeExecute(
        () =>
          db.marketingCampaign.count({
            where: {
              ...marketingCampaignWhere,
              status: 'ACTIVE',
            },
          }),
        0
      ),
      safeExecute(
        () =>
          db.marketingCampaign.findMany({
            where: {
              ...marketingCampaignWhere,
              budget: { not: null },
            },
            select: {
              budget: true,
              leads: {
                select: {
                  id: true,
                  estimatedValue: true,
                  status: true,
                },
              },
            },
          }),
        [] as Array<{
          budget: number | null
          leads: Array<{ id: string; estimatedValue: number | null; status: string }>
        }>
      ),
    ])

    let campaignROI = 0
    let totalCampaignBudget = 0
    let campaignRevenue = 0

    campaignsData.forEach(campaign => {
      totalCampaignBudget += campaign.budget || 0
      campaign.leads.forEach(lead => {
        if (lead.status === 'CLOSED_WON' && lead.estimatedValue) {
          campaignRevenue += lead.estimatedValue
        }
      })
    })

    if (totalCampaignBudget > 0) {
      campaignROI = ((campaignRevenue - totalCampaignBudget) / totalCampaignBudget) * 100
    }

    const inventoryItemsData = await safeExecute(
      () =>
        db.inventoryItem.findMany({
          where: inventoryWhere,
          select: {
            id: true,
            name: true,
            partNumber: true,
            quantity: true,
            unitPrice: true,
          },
        }),
      [] as Array<{
        id: string
        name: string
        partNumber: string
        quantity: number
        unitPrice: number
      }>
    )

    const totalInventoryValue = inventoryItemsData.reduce(
      (sum, item) => sum + (item.quantity || 0) * (item.unitPrice || 0),
      0
    )
    const lowStockItems = inventoryItemsData.filter(item => (item.quantity || 0) <= 10).length

    const topInvoiceItems = await safeExecute(
      () =>
        db.invoiceItem.groupBy({
          by: ['vehicleId', 'inventoryItemId'],
          where: {
            invoice: {
              ...invoiceWhere,
              status: 'PAID',
            },
          },
          _sum: {
            quantity: true,
            totalPrice: true,
          },
          orderBy: {
            _sum: {
              totalPrice: 'desc',
            },
          },
          take: 10,
        }),
      [] as Array<{
        vehicleId: string | null
        inventoryItemId: string | null
        _sum: { quantity: number | null; totalPrice: number | null }
      }>
    )

    const vehicleIds = topInvoiceItems
      .map(item => item.vehicleId)
      .filter((id): id is string => Boolean(id))
    const inventoryIds = topInvoiceItems
      .map(item => item.inventoryItemId)
      .filter((id): id is string => Boolean(id))

    const vehicles = vehicleIds.length
      ? await safeExecute(
          () =>
            db.vehicle.findMany({
              where: {
                id: {
                  in: vehicleIds,
                },
              },
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
              },
            }),
          [] as Array<{ id: string; make: string; model: string; year: number }>
        )
      : []

    const inventoryDetails = inventoryIds.length
      ? await safeExecute(
          () =>
            db.inventoryItem.findMany({
              where: {
                id: {
                  in: inventoryIds,
                },
              },
              select: {
                id: true,
                name: true,
                partNumber: true,
              },
            }),
          [] as Array<{ id: string; name: string; partNumber: string }>
        )
      : []

    const topSellingProductsWithDetails = topInvoiceItems.map(item => {
      const quantity = item._sum.quantity || 0
      const revenue = item._sum.totalPrice || 0

      if (item.vehicleId) {
        const vehicle = vehicles.find(v => v.id === item.vehicleId)
        return {
          id: item.vehicleId,
          type: 'VEHICLE' as const,
          name: vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year}` : 'Unknown Vehicle',
          quantity,
          revenue,
        }
      }

      if (item.inventoryItemId) {
        const inventoryItem = inventoryDetails.find(detail => detail.id === item.inventoryItemId)
        return {
          id: item.inventoryItemId,
          type: 'PART' as const,
          name: inventoryItem
            ? `${inventoryItem.name} (${inventoryItem.partNumber})`
            : 'Unknown Part',
          quantity,
          revenue,
        }
      }

      return {
        id: 'unassigned',
        type: 'SERVICE' as const,
        name: 'خدمة بدون عنصر مرتبط',
        quantity,
        revenue,
      }
    })

    const topPerformers = await safeExecute(
      () =>
        db.user.findMany({
          where: {
            role: {
              in: ['SALES', 'MANAGER'],
            },
            ...(branchFilter ? { branchId: branchFilter } : {}),
          },
          select: {
            id: true,
            name: true,
            role: true,
            invoices: {
              where: {
                ...invoiceWhere,
                status: 'PAID',
              },
              select: {
                totalAmount: true,
              },
            },
            assignedTickets: {
              where: {
                ...supportTicketWhere,
                status: 'RESOLVED',
                satisfaction: { not: null },
              },
              select: {
                satisfaction: true,
              },
            },
          },
          orderBy: {
            invoices: {
              _sum: {
                totalAmount: 'desc',
              },
            },
          },
          take: 5,
        }),
      [] as Array<{
        id: string
        name: string | null
        role: string
        invoices: Array<{ totalAmount: number }>
        assignedTickets: Array<{ satisfaction: number | null }>
      }>
    )

    const topPerformersWithMetrics = topPerformers.map(user => {
      const revenueTotal = user.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      const satisfactionRatings = user.assignedTickets
        .map(ticket => ticket.satisfaction)
        .filter(rating => rating !== null)

      const avgSatisfaction = satisfactionRatings.length > 0
        ? satisfactionRatings.reduce((sum, rating) => sum + rating!, 0) / satisfactionRatings.length
        : 0

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        revenue: revenueTotal,
        customers: user.invoices.length,
        satisfaction: avgSatisfaction,
      }
    })

    const reportData = {
      totalRevenue: revenue,
      totalExpenses: expenses,
      netProfit,
      totalCustomers,
      newCustomers,
      totalLeads,
      convertedLeads,
      conversionRate,
      totalTickets,
      resolvedTickets,
      avgResolutionTime: Math.round(avgResolutionTime * 100) / 100,
      totalCampaigns,
      activeCampaigns,
      campaignROI: Math.round(campaignROI * 100) / 100,
      inventoryValue: totalInventoryValue,
      lowStockItems,
      topSellingProducts: topSellingProductsWithDetails,
      topPerformers: topPerformersWithMetrics,
    }

    return NextResponse.json(reportData, { headers })
  } catch (error) {
    console.error('Error fetching overview report:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error instanceof Error ? error.message : 'Unknown error' },
      {
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        },
      }
    )
  }
}
