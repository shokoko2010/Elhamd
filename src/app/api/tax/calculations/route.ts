interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { Prisma, TaxStatus, TaxType } from '@prisma/client'

import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'

interface TaxCalculation {
  id: string
  period: string
  taxableIncome: number
  taxAmount: number
  effectiveRate: number
  deductions: number
  credits: number
  netTax: number
  status: 'draft' | 'calculated' | 'filed' | 'paid'
  dueDate: string
  filedDate?: string
  paidDate?: string
}

const STATUS_MAP: Record<TaxStatus, TaxCalculation['status']> = {
  [TaxStatus.PENDING]: 'draft',
  [TaxStatus.CALCULATED]: 'calculated',
  [TaxStatus.FILED]: 'filed',
  [TaxStatus.PAID]: 'paid',
  [TaxStatus.OVERDUE]: 'draft',
  [TaxStatus.CANCELLED]: 'draft',
  [TaxStatus.UNDER_REVIEW]: 'draft',
  [TaxStatus.APPROVED]: 'filed',
  [TaxStatus.REJECTED]: 'draft'
}

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    const where: Prisma.TaxRecordWhereInput = {}
    if (year) {
      where.period = { contains: year, mode: 'insensitive' }
    }
    if (status) {
      const normalizedStatus = status.toUpperCase() as TaxStatus
      if ((Object.values(TaxStatus) as string[]).includes(normalizedStatus)) {
        where.status = normalizedStatus
      }
    }

    const taxRecords = await db.taxRecord.findMany({
      where,
      orderBy: {
        dueDate: 'desc'
      }
    })

    const calculations: TaxCalculation[] = taxRecords.map(record => {
      const taxableAmount = record.amount
      const netTax = record.amount
      return {
        id: record.id,
        period: record.period,
        taxableIncome: taxableAmount,
        taxAmount: taxableAmount,
        effectiveRate: taxableAmount > 0 ? 100 : 0,
        deductions: 0,
        credits: 0,
        netTax,
        status: STATUS_MAP[record.status] ?? 'draft',
        dueDate: record.dueDate.toISOString().split('T')[0],
        filedDate: record.updatedAt.toISOString().split('T')[0],
        paidDate: record.paidDate?.toISOString().split('T')[0]
      }
    })

    return NextResponse.json({ calculations })
  } catch (error) {
    console.error('Error fetching tax calculations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tax calculations' },
      { status: 500 }
    )
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
      period,
      taxableIncome,
      deductions = 0,
      credits = 0,
      type,
      reference,
      notes,
      branchId,
      documents
    } = body

    if (typeof period !== 'string' || period.trim().length === 0) {
      return NextResponse.json(
        { error: 'Missing required field: period' },
        { status: 400 }
      )
    }

    if (typeof taxableIncome !== 'number' || Number.isNaN(taxableIncome)) {
      return NextResponse.json(
        { error: 'taxableIncome must be a number' },
        { status: 400 }
      )
    }

    const taxRates = await db.taxRate.findMany({
      where: { isActive: true }
    })

    let taxAmount = taxableIncome
    if (taxRates.length > 0) {
      const highestRate = Math.max(...taxRates.map(rate => rate.rate))
      taxAmount = taxableIncome * (highestRate / 100)
    } else {
      taxAmount = taxableIncome * 0.14
    }

    const netTax = Math.max(0, taxAmount - deductions - credits)
    const effectiveRate = taxableIncome > 0 ? (netTax / taxableIncome) * 100 : 0

    const parsedType = (type ? String(type).toUpperCase() : 'VAT') as TaxType
    const taxType = (Object.values(TaxType) as string[]).includes(parsedType)
      ? parsedType
      : TaxType.VAT

    const dueDate = (() => {
      if (/^\d{4}-\d{2}$/.test(period.trim())) {
        const [yearStr, monthStr] = period.trim().split('-')
        const year = Number(yearStr)
        const monthIndex = Number(monthStr)
        if (!Number.isNaN(year) && !Number.isNaN(monthIndex)) {
          return new Date(year, monthIndex, 0)
        }
      }
      const fallback = new Date()
      fallback.setMonth(fallback.getMonth() + 1)
      return fallback
    })()

    const newRecord = await db.taxRecord.create({
      data: {
        type: taxType,
        period: period.trim(),
        amount: netTax,
        dueDate,
        reference,
        documents: documents ?? null,
        notes,
        branchId: branchId || user.branchId || null,
        createdBy: user.id,
        status: TaxStatus.CALCULATED
      }
    })

    const calculation: TaxCalculation = {
      id: newRecord.id,
      period: newRecord.period,
      taxableIncome,
      taxAmount,
      effectiveRate,
      deductions,
      credits,
      netTax,
      status: STATUS_MAP[newRecord.status] ?? 'draft',
      dueDate: newRecord.dueDate.toISOString().split('T')[0],
      filedDate: newRecord.updatedAt.toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      calculation,
      message: 'Tax calculation created successfully'
    })
  } catch (error) {
    console.error('Error creating tax calculation:', error)
    return NextResponse.json(
      { error: 'Failed to create tax calculation' },
      { status: 500 }
    )
  }
}