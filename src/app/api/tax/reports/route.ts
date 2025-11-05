import { NextRequest, NextResponse } from 'next/server'
import { TaxStatus, TaxType } from '@prisma/client'

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
    const branchId = searchParams.get('branchId')
    const type = searchParams.get('type') as TaxType | null

    const where: Record<string, unknown> = {}

    if (startDate && endDate) {
      where.dueDate = {
        gte: new Date(startDate),
        lte: new Date(endDate)
      }
    }

    if (branchId) {
      where.branchId = branchId
    }

    if (type) {
      where.type = type
    }

    const [byType, byStatus, byPeriod] = await Promise.all([
      db.taxRecord.groupBy({
        by: ['type'],
        _sum: { amount: true },
        _count: { id: true },
        where
      }),
      db.taxRecord.groupBy({
        by: ['status'],
        _sum: { amount: true },
        _count: { id: true },
        where
      }),
      db.taxRecord.groupBy({
        by: ['period'],
        _sum: { amount: true },
        _count: { id: true },
        where,
        orderBy: { period: 'asc' }
      })
    ])

    const twelveMonthsAgo = new Date()
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

    const monthlyTrends = await db.taxRecord.findMany({
      where: {
        ...where,
        dueDate: {
          gte: twelveMonthsAgo
        }
      },
      select: {
        dueDate: true,
        amount: true,
        status: true,
        type: true
      },
      orderBy: { dueDate: 'asc' }
    })

    const monthlyData: Record<
      string,
      {
        period: string
        total: number
        paid: number
        pending: number
        overdue: number
        byType: Record<string, number>
      }
    > = {}

    monthlyTrends.forEach(record => {
      const monthKey = record.dueDate.toISOString().substring(0, 7)
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = {
          period: monthKey,
          total: 0,
          paid: 0,
          pending: 0,
          overdue: 0,
          byType: {}
        }
      }

      monthlyData[monthKey].total += record.amount

      if (!monthlyData[monthKey].byType[record.type]) {
        monthlyData[monthKey].byType[record.type] = 0
      }
      monthlyData[monthKey].byType[record.type] += record.amount

      switch (record.status) {
        case TaxStatus.PAID:
          monthlyData[monthKey].paid += record.amount
          break
        case TaxStatus.PENDING:
          monthlyData[monthKey].pending += record.amount
          break
        case TaxStatus.OVERDUE:
          monthlyData[monthKey].overdue += record.amount
          break
      }
    })

    const allRecords = await db.taxRecord.findMany({ where })
    const totalTaxAmount = allRecords.reduce((sum, record) => sum + record.amount, 0)
    const paidAmount = allRecords
      .filter(record => record.status === TaxStatus.PAID)
      .reduce((sum, record) => sum + record.amount, 0)
    const pendingAmount = allRecords
      .filter(record => record.status === TaxStatus.PENDING)
      .reduce((sum, record) => sum + record.amount, 0)
    const overdueAmount = allRecords
      .filter(record => record.status === TaxStatus.OVERDUE)
      .reduce((sum, record) => sum + record.amount, 0)

    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const upcomingPaymentsRaw = await db.taxRecord.findMany({
      where: {
        ...where,
        dueDate: {
          gte: new Date(),
          lte: thirtyDaysFromNow
        },
        status: {
          in: [TaxStatus.PENDING, TaxStatus.CALCULATED]
        }
      },
      select: {
        id: true,
        amount: true,
        dueDate: true,
        status: true,
        type: true,
        period: true,
        branchId: true
      },
      orderBy: { dueDate: 'asc' }
    })

    const upcomingBranchIds = Array.from(
      new Set(
        upcomingPaymentsRaw
          .map(payment => payment.branchId)
          .filter(Boolean) as string[]
      )
    )

    const upcomingBranches = upcomingBranchIds.length
      ? await db.branch.findMany({
          where: { id: { in: upcomingBranchIds } },
          select: { id: true, name: true, code: true }
        })
      : []

    const upcomingBranchMap = new Map(upcomingBranches.map(branch => [branch.id, branch]))

    const upcomingPayments = upcomingPaymentsRaw.map(payment => ({
      ...payment,
      branch: payment.branchId ? upcomingBranchMap.get(payment.branchId) ?? null : null
    }))

    const efficiencyMetrics = {
      paymentRate: totalTaxAmount > 0 ? (paidAmount / totalTaxAmount) * 100 : 0,
      overdueRate: totalTaxAmount > 0 ? (overdueAmount / totalTaxAmount) * 100 : 0,
      averageProcessingTime: 0
    }

    const complianceRate = totalTaxAmount > 0 ? (paidAmount / totalTaxAmount) * 100 : 0

    return NextResponse.json({
      summary: {
        totalTaxCollected: paidAmount,
        totalTaxPaid: paidAmount,
        taxDue: pendingAmount + overdueAmount,
        complianceRate,
        totalTaxAmount,
        pendingAmount,
        overdueAmount,
        totalRecords: allRecords.length
      },
      byType,
      byStatus,
      byPeriod,
      monthlyTrends: Object.values(monthlyData),
      upcomingPayments,
      efficiencyMetrics,
      filings: upcomingPayments.map(payment => ({
        period: payment.period,
        status: payment.status,
        amount: payment.amount,
        dueDate: payment.dueDate.toISOString()
      }))
    })
  } catch (error) {
    console.error('Error generating tax report:', error)
    return NextResponse.json(
      {
        error: 'Failed to generate tax report',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
