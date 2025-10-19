interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { startOfDay, endOfDay, subDays, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addMonths, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const branchId = searchParams.get('branchId')

    let startDate: Date
    let endDate: Date
    let monthsToShow = 12

    const now = new Date()

    switch (period) {
      case 'today':
        startDate = startOfDay(now)
        endDate = endOfDay(now)
        monthsToShow = 1
        break
      case 'week':
        startDate = startOfWeek(now, { weekStartsOn: 0 })
        endDate = endOfWeek(now, { weekStartsOn: 0 })
        monthsToShow = 3
        break
      case 'month':
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        monthsToShow = 12
        break
      case 'quarter':
        const currentMonth = now.getMonth()
        const quarterStart = Math.floor(currentMonth / 3) * 3
        startDate = new Date(now.getFullYear(), quarterStart, 1)
        endDate = new Date(now.getFullYear(), quarterStart + 3, 0)
        monthsToShow = 12
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        endDate = new Date(now.getFullYear(), 11, 31)
        monthsToShow = 24
        break
      default:
        startDate = startOfMonth(now)
        endDate = endOfMonth(now)
        monthsToShow = 12
    }

    const where: any = {}

    if (branchId && branchId !== 'all') {
      where.branchId = branchId
    }

    // Generate monthly customer metrics
    const customerMetrics = []
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = addMonths(startDate, -i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      const monthWhere = {
        ...where,
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        }
      }

      const [
        newCustomers,
        totalCustomersAtEnd,
        activeCustomers
      ] = await Promise.all([
        db.customerProfile.count({
          where: {
            ...monthWhere
          }
        }),
        db.customerProfile.count({
          where: {
            createdAt: {
              lte: monthEnd
            }
          }
        }),
        db.customerProfile.count({
          where: {
            createdAt: {
              lte: monthEnd
            },
            OR: [
              {
                invoices: {
                  some: {
                    createdAt: {
                      gte: subDays(monthEnd, 90) // Active in last 90 days
                    }
                  }
                }
              },
              {
                serviceBookings: {
                  some: {
                    createdAt: {
                      gte: subDays(monthEnd, 90)
                    }
                  }
                }
              }
            ]
          }
        })
      ])

      const retention = totalCustomersAtEnd > 0 ? (activeCustomers / totalCustomersAtEnd) * 100 : 0

      customerMetrics.push({
        month: format(monthDate, 'MMM yyyy', { locale: { code: 'ar' } }),
        newCustomers,
        totalCustomers: totalCustomersAtEnd,
        retention: Math.round(retention * 100) / 100
      })
    }

    // Get current period detailed breakdown
    const currentPeriodWhere = {
      ...where,
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    const [
      customerSegments,
      topCustomers,
      customerAcquisition,
      customerLifetimeValue,
      churnRate
    ] = await Promise.all([
      // Customer segments
      db.customerProfile.groupBy({
        by: ['segment'],
        where: {
          ...where
        },
        _count: {
          _all: true
        }
      }),
      // Top customers by revenue
      db.customerProfile.findMany({
        where: {
          ...where
        },
        include: {
          invoices: {
            where: {
              status: 'PAID'
            },
            select: {
              totalAmount: true
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
        take: 10
      }),
      // Customer acquisition sources
      db.lead.groupBy({
        by: ['source'],
        where: {
          ...currentPeriodWhere,
          status: 'CLOSED_WON'
        },
        _count: {
          _all: true
        }
      }),
      // Customer lifetime value
      db.customerProfile.findMany({
        where: {
          ...where
        },
        include: {
          invoices: {
            where: {
              status: 'PAID'
            },
            select: {
              totalAmount: true,
              createdAt: true
            }
          }
        }
      }),
      // Churn rate calculation
      Promise.all([
        // Customers at start of period
        db.customerProfile.count({
          where: {
            createdAt: {
              lte: subDays(startDate, 1)
            }
          }
        }),
        // Customers who churned in period
        db.customerProfile.count({
          where: {
            createdAt: {
              lte: subDays(startDate, 1)
            },
            AND: [
              {
                invoices: {
                  none: {
                    createdAt: {
                      gte: startDate
                    }
                  }
                }
              },
              {
                serviceBookings: {
                  none: {
                    createdAt: {
                      gte: startDate
                    }
                  }
                }
              }
            ]
          }
        })
      ])
    ])

    // Calculate customer lifetime value
    const customerLifetimeValueData = customerLifetimeValue.map(customer => {
      const totalSpent = customer.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      const firstPurchase = customer.invoices.length > 0 ? Math.min(...customer.invoices.map(i => new Date(i.createdAt).getTime())) : 0
      const customerAge = firstPurchase > 0 ? (now.getTime() - firstPurchase) / (1000 * 60 * 60 * 24 * 365) : 0 // in years
      
      return {
        id: customer.id,
        name: customer.name,
        totalSpent,
        customerAge: Math.round(customerAge * 100) / 100,
        lifetimeValue: customerAge > 0 ? totalSpent / customerAge : 0
      }
    })

    // Calculate churn rate
    const [customersAtStart, churnedCustomers] = churnRate
    const churnRateValue = customersAtStart > 0 ? (churnedCustomers / customersAtStart) * 100 : 0

    // Process top customers with revenue
    const topCustomersWithRevenue = topCustomers.map(customer => {
      const totalRevenue = customer.invoices.reduce((sum, invoice) => sum + invoice.totalAmount, 0)
      return {
        id: customer.id,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        revenue: totalRevenue,
        invoiceCount: customer.invoices.length
      }
    })

    const customerReport = {
      metrics: customerMetrics,
      segments: customerSegments,
      topCustomers: topCustomersWithRevenue,
      acquisitionSources: customerAcquisition,
      customerLifetimeValue: customerLifetimeValueData.sort((a, b) => b.lifetimeValue - a.lifetimeValue).slice(0, 10),
      churnRate: Math.round(churnRateValue * 100) / 100,
      period: {
        start: startDate,
        end: endDate,
        type: period
      }
    }

    return NextResponse.json(customerReport)
  } catch (error) {
    console.error('Error fetching customer report:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}