import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PaymentStatus, PaymentMethod } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    // Set default date range to current month if not provided
    const currentDate = new Date()
    const currentMonth = currentDate.getMonth()
    const currentYear = currentDate.getFullYear()
    
    const start = startDate ? new Date(startDate) : new Date(currentYear, currentMonth, 1)
    const end = endDate ? new Date(endDate) : new Date(currentYear, currentMonth + 1, 0)

    // Fetch all payments in the date range
    const payments = await db.payment.findMany({
      where: {
        createdAt: {
          gte: start,
          lte: end
        }
      }
    })

    // Calculate statistics
    const totalRevenue = payments
      .filter(p => p.status === PaymentStatus.COMPLETED)
      .reduce((sum, p) => sum + p.amount, 0)

    const successfulPayments = payments.filter(p => p.status === PaymentStatus.COMPLETED).length
    const pendingPayments = payments.filter(p => p.status === PaymentStatus.PENDING).length
    const failedPayments = payments.filter(p => p.status === PaymentStatus.FAILED).length
    const refundedPayments = payments.filter(p => p.status === PaymentStatus.REFUNDED).length

    // Calculate gateway statistics
    const gatewayStats = payments.reduce((acc, payment) => {
      const gateway = payment.gateway || 'Unknown'
      
      if (!acc[gateway]) {
        acc[gateway] = {
          count: 0,
          amount: 0,
          successRate: 0
        }
      }
      
      acc[gateway].count++
      if (payment.status === PaymentStatus.COMPLETED) {
        acc[gateway].amount += payment.amount
      }
      
      return acc
    }, {} as Record<string, { count: number; amount: number; successRate: number }>)

    // Calculate success rates for each gateway
    Object.keys(gatewayStats).forEach(gateway => {
      const gatewayPayments = payments.filter(p => (p.gateway || 'Unknown') === gateway)
      const successfulCount = gatewayPayments.filter(p => p.status === PaymentStatus.COMPLETED).length
      const totalCount = gatewayPayments.length
      
      gatewayStats[gateway].successRate = totalCount > 0 
        ? Math.round((successfulCount / totalCount) * 100) 
        : 0
    })

    // Calculate payment method statistics
    const paymentMethodStats = Object.values(PaymentMethod).reduce((acc, method) => {
      const methodPayments = payments.filter(p => p.paymentMethod === method)
      const count = methodPayments.length
      const amount = methodPayments
        .filter(p => p.status === PaymentStatus.COMPLETED)
        .reduce((sum, p) => sum + p.amount, 0)
      
      if (count > 0) {
        acc[method] = { count, amount }
      }
      
      return acc
    }, {} as Record<PaymentMethod, { count: number; amount: number }>)

    // Calculate average transaction value
    const avgTransactionValue = successfulPayments > 0 
      ? totalRevenue / successfulPayments 
      : 0

    // Calculate growth rate (compared to previous period)
    const previousStart = new Date(start)
    previousStart.setMonth(previousStart.getMonth() - 1)
    const previousEnd = new Date(end)
    previousEnd.setMonth(previousEnd.getMonth() - 1)

    const previousPayments = await db.payment.findMany({
      where: {
        createdAt: {
          gte: previousStart,
          lte: previousEnd
        },
        status: PaymentStatus.COMPLETED
      }
    })

    const previousRevenue = previousPayments.reduce((sum, p) => sum + p.amount, 0)
    const growthRate = previousRevenue > 0 
      ? ((totalRevenue - previousRevenue) / previousRevenue) * 100 
      : 0

    return NextResponse.json({
      totalRevenue,
      successfulPayments,
      pendingPayments,
      failedPayments,
      refundedPayments,
      gatewayStats,
      paymentMethodStats,
      avgTransactionValue,
      growthRate,
      period: {
        start: start.toISOString(),
        end: end.toISOString()
      }
    })
  } catch (error) {
    console.error('Error fetching payment stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment statistics' },
      { status: 500 }
    )
  }
}