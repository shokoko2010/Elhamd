import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Calculate current month's financial overview
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    // Get start and end of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1)
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0)

    // Get all invoices for current month
    const invoices = await db.invoice.findMany({
      where: {
        issueDate: {
          gte: startOfMonth,
          lte: endOfMonth
        }
      },
      include: {
        customer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Calculate financial metrics
    const totalRevenue = invoices
      .filter(inv => inv.status === 'PAID' || inv.status === 'PARTIALLY_PAID')
      .reduce((sum, inv) => sum + inv.paidAmount, 0)

    const totalExpenses = 0 // TODO: Implement expense tracking
    const netProfit = totalRevenue - totalExpenses

    const pendingInvoices = invoices.filter(inv => inv.status === 'SENT' || inv.status === 'DRAFT').length
    const overdueInvoices = invoices.filter(inv => {
      const dueDate = new Date(inv.dueDate)
      return inv.status !== 'PAID' && dueDate < currentDate
    }).length

    const paidInvoices = invoices.filter(inv => inv.status === 'PAID').length

    const overview = {
      totalRevenue,
      totalExpenses,
      netProfit,
      pendingInvoices,
      overdueInvoices,
      paidInvoices,
      period: {
        start: startOfMonth.toISOString(),
        end: endOfMonth.toISOString()
      }
    }

    return NextResponse.json(overview)
  } catch (error) {
    console.error('Error fetching financial overview:', error)
    return NextResponse.json(
      { error: 'Failed to fetch financial overview' },
      { status: 500 }
    )
  }
}