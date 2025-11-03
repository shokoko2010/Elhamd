import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const category = searchParams.get('category')
    const branchId = searchParams.get('branchId')

    // Calculate date range for current month if not provided
    const now = new Date()
    const monthStart = startDate 
      ? new Date(startDate) 
      : new Date(now.getFullYear(), now.getMonth(), 1)
    const monthEnd = endDate 
      ? new Date(endDate) 
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

    // Build where clause
    const where: any = {
      type: 'INCOME',
      date: {
        gte: monthStart,
        lte: monthEnd
      }
    }

    if (category) {
      where.category = category
    }

    if (branchId && branchId !== 'all') {
      where.branchId = branchId
    }

    // Fetch revenue transactions
    const revenueTransactions = await db.transaction.findMany({
      where,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            totalAmount: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Also fetch paid invoices for revenue calculation
    const invoices = await db.invoice.findMany({
      where: {
        status: 'PAID',
        createdAt: {
          gte: monthStart,
          lte: monthEnd
        },
        ...(branchId && branchId !== 'all' ? { branchId } : {})
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calculate total revenue from transactions
    const totalRevenueFromTransactions = revenueTransactions.reduce((sum, rev) => sum + rev.amount, 0)
    
    // Calculate total revenue from invoices
    const totalRevenueFromInvoices = invoices.reduce((sum, inv) => sum + inv.totalAmount, 0)
    
    // Total revenue
    const totalRevenue = totalRevenueFromTransactions + totalRevenueFromInvoices

    // Group revenue by source
    const revenueBySource = revenueTransactions.reduce((acc: any, rev) => {
      const source = rev.category || 'غير محدد'
      if (!acc[source]) {
        acc[source] = { source, amount: 0, count: 0, trend: '+0%' }
      }
      acc[source].amount += rev.amount
      acc[source].count += 1
      return acc
    }, {})

    // Add invoice-based revenue
    invoices.forEach(inv => {
      const source = inv.type === 'SALE' ? 'مبيعات سيارات جديدة' : 
                     inv.type === 'USED_SALE' ? 'مبيعات سيارات مستعملة' :
                     inv.type === 'SERVICE' ? 'خدمات الصيانة' :
                     inv.type === 'PARTS' ? 'قطع غيار' :
                     'خدمات إضافية'
      
      if (!revenueBySource[source]) {
        revenueBySource[source] = { source, amount: 0, count: 0, trend: '+0%' }
      }
      revenueBySource[source].amount += inv.totalAmount
      revenueBySource[source].count += 1
    })

    // Calculate net profit (revenue - expenses)
    const expenses = await db.transaction.aggregate({
      where: {
        type: 'EXPENSE',
        date: {
          gte: monthStart,
          lte: monthEnd
        },
        ...(branchId && branchId !== 'all' ? { branchId } : {})
      },
      _sum: {
        amount: true
      }
    })

    const totalExpenses = expenses._sum.amount || 0
    const netProfit = totalRevenue - totalExpenses
    const profitMargin = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0

    // Calculate previous month for trend comparison
    const prevMonthStart = new Date(monthStart)
    prevMonthStart.setMonth(prevMonthStart.getMonth() - 1)
    const prevMonthEnd = new Date(monthStart)
    prevMonthEnd.setDate(prevMonthEnd.getDate() - 1)

    const prevMonthRevenue = await db.transaction.aggregate({
      where: {
        type: 'INCOME',
        date: {
          gte: prevMonthStart,
          lte: prevMonthEnd
        },
        ...(branchId && branchId !== 'all' ? { branchId } : {})
      },
      _sum: {
        amount: true
      }
    })

    const prevMonthInvoices = await db.invoice.aggregate({
      where: {
        status: 'PAID',
        createdAt: {
          gte: prevMonthStart,
          lte: prevMonthEnd
        },
        ...(branchId && branchId !== 'all' ? { branchId } : {})
      },
      _sum: {
        totalAmount: true
      }
    })

    const prevMonthTotal = (prevMonthRevenue._sum.amount || 0) + (prevMonthInvoices._sum.totalAmount || 0)
    const revenueTrend = prevMonthTotal > 0 
      ? ((totalRevenue - prevMonthTotal) / prevMonthTotal) * 100 
      : 0

    return NextResponse.json({
      revenue: revenueTransactions,
      invoices,
      summary: {
        totalRevenue,
        totalRevenueFromTransactions,
        totalRevenueFromInvoices,
        revenueBySource: Object.values(revenueBySource),
        netProfit,
        profitMargin,
        revenueTrend,
        count: revenueTransactions.length + invoices.length
      }
    })
  } catch (error) {
    console.error('Error fetching revenue:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      category,
      amount,
      description,
      date,
      paymentMethod,
      branchId,
      reference,
      customerId,
      invoiceId
    } = body

    if (!category || !amount || !date) {
      return NextResponse.json({ 
        error: 'Missing required fields: category, amount, date' 
      }, { status: 400 })
    }

    // Generate unique referenceId
    const refCount = await db.transaction.count({
      where: {
        type: 'INCOME'
      }
    })
    const referenceId = `INC-${String(refCount + 1).padStart(6, '0')}`

    // Create revenue transaction
    const revenue = await db.transaction.create({
      data: {
        referenceId,
        type: 'INCOME',
        category,
        amount: parseFloat(amount),
        currency: 'EGP',
        description,
        date: new Date(date),
        paymentMethod: paymentMethod || 'CASH',
        branchId: branchId || user.branchId,
        reference,
        customerId,
        invoiceId,
        metadata: {
          createdBy: user.id,
          createdAt: new Date().toISOString()
        }
      },
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    return NextResponse.json(revenue, { status: 201 })
  } catch (error) {
    console.error('Error creating revenue:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

