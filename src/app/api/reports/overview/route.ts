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

    if (branchId && branchId !== 'all') {
      where.branchId = branchId
    }

    // Fetch financial data
    const [
      totalRevenue,
      totalExpenses,
      invoicesData
    ] = await Promise.all([
      db.invoice.aggregate({
        where: {
          ...where,
          status: 'PAID'
        },
        _sum: {
          totalAmount: true
        }
      }),
      db.transaction.aggregate({
        where: {
          ...where,
          type: 'EXPENSE'
        },
        _sum: {
          amount: true
        }
      }),
      db.invoice.findMany({
        where: {
          ...where,
          status: 'PAID'
        },
        select: {
          totalAmount: true,
          createdAt: true
        }
      })
    ])

    const revenue = totalRevenue._sum.totalAmount || 0
    const expenses = totalExpenses._sum.amount || 0
    const netProfit = revenue - expenses

    // Fetch customer data
    const [
      totalCustomers,
      newCustomers,
      leadsData
    ] = await Promise.all([
      db.customerProfile.count(),
      db.customerProfile.count({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate
          }
        }
      }),
      db.lead.findMany({
        where: {
          ...where
        },
        select: {
          status: true,
          estimatedValue: true
        }
      })
    ])

    const totalLeads = leadsData.length
    const convertedLeads = leadsData.filter(lead => lead.status === 'CLOSED_WON').length
    const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0

    // Fetch customer service data
    const [
      totalTickets,
      resolvedTickets,
      ticketsData
    ] = await Promise.all([
      db.supportTicket.count({ where }),
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

    // Fetch marketing data
    const [
      totalCampaigns,
      activeCampaigns,
      campaignsData
    ] = await Promise.all([
      db.marketingCampaign.count({ where }),
      db.marketingCampaign.count({
        where: {
          ...where,
          status: 'ACTIVE'
        }
      }),
      db.marketingCampaign.findMany({
        where: {
          ...where,
          budget: { not: null }
        },
        select: {
          budget: true,
          leads: {
            select: {
              id: true,
              estimatedValue: true,
              status: true
            }
          }
        }
      })
    ])

    // Calculate campaign ROI
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

    // Fetch inventory data
    const [
      inventoryValue,
      lowStockItems
    ] = await Promise.all([
      db.inventoryItem.aggregate({
        where: {
          ...(branchId && branchId !== 'all' && { branchId })
        },
        _sum: {
          totalValue: true
        }
      }),
      db.inventoryItem.count({
        where: {
          ...(branchId && branchId !== 'all' && { branchId }),
          quantity: {
            lte: 10 // Low stock threshold
          }
        }
      })
    ])

    // Fetch top selling products (from invoices)
    const topSellingProducts = await db.invoiceItem.groupBy({
      by: ['vehicleId'],
      where: {
        invoice: {
          ...where,
          status: 'PAID'
        }
      },
      _sum: {
        quantity: true,
        totalPrice: true
      },
      orderBy: {
        _sum: {
          quantity: 'desc'
        }
      },
      take: 10
    })

    // Get vehicle details for top selling products
    const vehicleIds = topSellingProducts.map(item => item.vehicleId)
    const vehicles = await db.vehicle.findMany({
      where: {
        id: {
          in: vehicleIds
        }
      },
      select: {
        id: true,
        make: true,
        model: true,
        year: true
      }
    })

    const topSellingProductsWithDetails = topSellingProducts.map(item => {
      const vehicle = vehicles.find(v => v.id === item.vehicleId)
      return {
        id: item.vehicleId,
        name: vehicle ? `${vehicle.make} ${vehicle.model} ${vehicle.year}` : 'Unknown',
        quantity: item._sum.quantity || 0,
        revenue: item._sum.totalPrice || 0
      }
    })

    // Fetch top performers (employees with best performance)
    const topPerformers = await Promise.all([
      // Top performers by revenue
      db.user.findMany({
        where: {
          role: {
            in: ['SALES', 'MANAGER']
          }
        },
        select: {
          id: true,
          name: true,
          role: true,
          invoices: {
            where: {
              ...where,
              status: 'PAID'
            },
            select: {
              totalAmount: true
            }
          },
          assignedTickets: {
            where: {
              ...where,
              satisfaction: { not: null }
            },
            select: {
              satisfaction: true
            }
          }
        },
        orderBy: {
          invoices: {
            _sum: {
              totalAmount: 'desc'
            }
          }
        },
        take: 5
      })
    ])

    const topPerformersWithMetrics = topPerformers[0].map(user => {
      const revenue = user.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      const satisfactionRatings = user.assignedTickets.map(ticket => ticket.satisfaction).filter(rating => rating !== null)
      const avgSatisfaction = satisfactionRatings.length > 0 
        ? satisfactionRatings.reduce((sum, rating) => sum + rating!, 0) / satisfactionRatings.length 
        : 0

      return {
        id: user.id,
        name: user.name,
        role: user.role,
        revenue,
        customers: user.invoices.length,
        satisfaction: avgSatisfaction
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
      inventoryValue: inventoryValue._sum.totalValue || 0,
      lowStockItems,
      topSellingProducts: topSellingProductsWithDetails,
      topPerformers: topPerformersWithMetrics
    }

    return NextResponse.json(reportData)
  } catch (error) {
    console.error('Error fetching overview report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}