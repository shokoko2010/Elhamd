import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PaymentStatus, PaymentMethod } from '@prisma/client'

interface RevenueBreakdown {
  byServiceType: Array<{
    name: string
    amount: number
    count: number
    percentage: number
  }>
  byPaymentMethod: Array<{
    method: PaymentMethod
    amount: number
    count: number
    percentage: number
  }>
  byMonth: Array<{
    month: string
    revenue: number
    expenses: number
    profit: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'month'

    // Calculate date range based on timeRange
    const currentDate = new Date()
    let startDate: Date

    switch (timeRange) {
      case 'week':
        startDate = new Date(currentDate)
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        break
      case 'quarter':
        const currentQuarter = Math.floor(currentDate.getMonth() / 3)
        startDate = new Date(currentDate.getFullYear(), currentQuarter * 3, 1)
        break
      case 'year':
        startDate = new Date(currentDate.getFullYear(), 0, 1)
        break
      default:
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
    }

    const endDate = new Date()

    // Fetch completed payments with service details
    const payments = await db.payment.findMany({
      where: {
        createdAt: {
          gte: startDate,
          lte: endDate
        },
        status: PaymentStatus.COMPLETED
      },
      include: {
        serviceBooking: {
          include: {
            serviceType: {
              select: { name: true }
            }
          }
        }
      }
    })

    // Calculate total revenue
    const totalRevenue = payments.reduce((sum, payment) => sum + payment.amount, 0)

    // Breakdown by service type
    const serviceTypeMap = new Map<string, { amount: number; count: number }>()
    payments.forEach(payment => {
      const serviceName = payment.serviceBooking?.serviceType?.name || 'Unknown'
      const current = serviceTypeMap.get(serviceName) || { amount: 0, count: 0 }
      serviceTypeMap.set(serviceName, {
        amount: current.amount + payment.amount,
        count: current.count + 1
      })
    })

    const byServiceType = Array.from(serviceTypeMap.entries()).map(([name, data]) => ({
      name,
      amount: data.amount,
      count: data.count,
      percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0
    }))

    // Breakdown by payment method
    const paymentMethodMap = new Map<PaymentMethod, { amount: number; count: number }>()
    payments.forEach(payment => {
      const method = payment.paymentMethod
      const current = paymentMethodMap.get(method) || { amount: 0, count: 0 }
      paymentMethodMap.set(method, {
        amount: current.amount + payment.amount,
        count: current.count + 1
      })
    })

    const byPaymentMethod = Array.from(paymentMethodMap.entries()).map(([method, data]) => ({
      method,
      amount: data.amount,
      count: data.count,
      percentage: totalRevenue > 0 ? (data.amount / totalRevenue) * 100 : 0
    }))

    // Monthly breakdown (for the last 6 months)
    const byMonth = []
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const monthEndDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i + 1, 0)
      
      const monthPayments = await db.payment.findMany({
        where: {
          createdAt: {
            gte: monthDate,
            lte: monthEndDate
          },
          status: PaymentStatus.COMPLETED
        }
      })

      const monthRevenue = monthPayments.reduce((sum, payment) => sum + payment.amount, 0)
      const monthExpenses = monthRevenue * 0.6 // Simplified expense calculation
      const monthProfit = monthRevenue - monthExpenses

      byMonth.push({
        month: monthDate.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' }),
        revenue: monthRevenue,
        expenses: monthExpenses,
        profit: monthProfit
      })
    }

    const report: RevenueBreakdown = {
      byServiceType,
      byPaymentMethod,
      byMonth
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating revenue breakdown:', error)
    return NextResponse.json(
      { error: 'Failed to generate revenue breakdown' },
      { status: 500 }
    )
  }
}