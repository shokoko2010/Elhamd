import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { InvoiceStatus, PaymentStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'month'
    const branchId = searchParams.get('branchId')

    // Calculate date range based on period
    const now = new Date()
    let startDate: Date

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        break
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
        break
      case 'quarter':
        const quarter = Math.floor(now.getMonth() / 3)
        startDate = new Date(now.getFullYear(), quarter * 3, 1)
        break
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1)
    }

    const endDate = now

    // Build where clause
    const where: any = {
      createdAt: {
        gte: startDate,
        lte: endDate
      }
    }

    if (branchId) {
      where.branchId = branchId
    }

    // Fetch invoices
    const invoices = await db.invoice.findMany({
      where,
      include: {
        payments: {
          include: {
            payment: true
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

    // Fetch transactions
    const transactions = await db.transaction.findMany({
      where,
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Calculate metrics
    const totalRevenue = transactions
      .filter(t => t.type === 'INCOME')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactions
      .filter(t => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + t.amount, 0)

    const netProfit = totalRevenue - totalExpenses

    // Invoice statistics
    const invoiceStats = {
      total: invoices.length,
      draft: invoices.filter(inv => inv.status === InvoiceStatus.DRAFT).length,
      sent: invoices.filter(inv => inv.status === InvoiceStatus.SENT).length,
      paid: invoices.filter(inv => inv.status === InvoiceStatus.PAID).length,
      partiallyPaid: invoices.filter(inv => inv.status === InvoiceStatus.PARTIALLY_PAID).length,
      overdue: invoices.filter(inv => inv.status === InvoiceStatus.OVERDUE).length,
      cancelled: invoices.filter(inv => inv.status === InvoiceStatus.CANCELLED).length,
      refunded: invoices.filter(inv => inv.status === InvoiceStatus.REFUNDED).length
    }

    // Payment statistics
    const completedPayments = invoices
      .flatMap(inv => inv.payments)
      .filter(ip => ip.payment.status === PaymentStatus.COMPLETED)

    const paymentStats = {
      total: completedPayments.length,
      totalAmount: completedPayments.reduce((sum, ip) => sum + ip.amount, 0),
      byMethod: completedPayments.reduce((acc, ip) => {
        acc[ip.payment.paymentMethod] = (acc[ip.payment.paymentMethod] || 0) + ip.amount
        return acc
      }, {} as Record<string, number>)
    }

    // Outstanding amounts
    const outstandingInvoices = invoices.filter(inv => 
      inv.status !== InvoiceStatus.PAID && 
      inv.status !== InvoiceStatus.CANCELLED && 
      inv.status !== InvoiceStatus.REFUNDED
    )

    const totalOutstanding = outstandingInvoices.reduce((sum, inv) => 
      sum + (inv.totalAmount - inv.paidAmount), 0
    )

    // Recent activity
    const recentInvoices = invoices
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10)

    const recentPayments = completedPayments
      .sort((a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime())
      .slice(0, 10)

    // Monthly trend (if period is month or longer)
    const monthlyTrend = []
    if (period !== 'week') {
      const months = Math.ceil((endDate.getTime() - startDate.getTime()) / (30 * 24 * 60 * 60 * 1000))
      
      for (let i = 0; i < months; i++) {
        const monthStart = new Date(startDate.getFullYear(), startDate.getMonth() + i, 1)
        const monthEnd = new Date(startDate.getFullYear(), startDate.getMonth() + i + 1, 0)
        
        const monthTransactions = transactions.filter(t => {
          const date = new Date(t.date)
          return date >= monthStart && date <= monthEnd
        })

        const monthRevenue = monthTransactions
          .filter(t => t.type === 'INCOME')
          .reduce((sum, t) => sum + t.amount, 0)

        const monthExpenses = monthTransactions
          .filter(t => t.type === 'EXPENSE')
          .reduce((sum, t) => sum + t.amount, 0)

        monthlyTrend.push({
          month: monthStart.toLocaleDateString('ar-EG', { year: 'numeric', month: 'short' }),
          revenue: monthRevenue,
          expenses: monthExpenses,
          profit: monthRevenue - monthExpenses
        })
      }
    }

    const financialOverview = {
      period,
      dateRange: {
        start: startDate.toISOString(),
        end: endDate.toISOString()
      },
      summary: {
        totalRevenue,
        totalExpenses,
        netProfit,
        totalOutstanding
      },
      invoices: invoiceStats,
      payments: paymentStats,
      recentActivity: {
        invoices: recentInvoices,
        payments: recentPayments
      },
      monthlyTrend,
      topCustomers: await getTopCustomers(startDate, endDate, branchId),
      topServices: await getTopServices(startDate, endDate, branchId)
    }

    return NextResponse.json(financialOverview)

  } catch (error) {
    console.error('Error fetching financial overview:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch financial overview' 
    }, { status: 500 })
  }
}

async function getTopCustomers(startDate: Date, endDate: Date, branchId?: string) {
  const where: any = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  }

  if (branchId) {
    where.branchId = branchId
  }

  const invoices = await db.invoice.findMany({
    where,
    include: {
      customer: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    }
  })

  const customerRevenue = invoices.reduce((acc, invoice) => {
    const customerId = invoice.customerId
    if (!acc[customerId]) {
      acc[customerId] = {
        customer: invoice.customer,
        revenue: 0,
        invoiceCount: 0
      }
    }
    acc[customerId].revenue += invoice.paidAmount
    acc[customerId].invoiceCount += 1
    return acc
  }, {} as Record<string, any>)

  return Object.values(customerRevenue)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10)
}

async function getTopServices(startDate: Date, endDate: Date, branchId?: string) {
  const where: any = {
    createdAt: {
      gte: startDate,
      lte: endDate
    }
  }

  if (branchId) {
    where.branchId = branchId
  }

  const invoices = await db.invoice.findMany({
    where,
    include: {
      items: true
    }
  })

  const serviceRevenue = invoices.reduce((acc, invoice) => {
    invoice.items.forEach(item => {
      const key = item.description
      if (!acc[key]) {
        acc[key] = {
          service: key,
          revenue: 0,
          quantity: 0
        }
      }
      acc[key].revenue += item.totalPrice
      acc[key].quantity += item.quantity
    })
    return acc
  }, {} as Record<string, any>)

  return Object.values(serviceRevenue)
    .sort((a: any, b: any) => b.revenue - a.revenue)
    .slice(0, 10)
}