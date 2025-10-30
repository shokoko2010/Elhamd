interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
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

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const year = searchParams.get('year')
    const status = searchParams.get('status')

    // Build where clause
    const where: any = {}
    if (year) {
      where.period = { contains: year, mode: 'insensitive' }
    }
    if (status) {
      where.status = status
    }

    // Fetch real tax calculations from database
    const taxRecords = await db.taxRecord.findMany({
      where,
      orderBy: {
        period: 'desc'
      },
      include: {
        invoice: {
          select: {
            invoiceNumber: true,
            totalAmount: true,
            customer: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })

    // Transform database records to match expected format
    const calculations: TaxCalculation[] = taxRecords.map(record => ({
      id: record.id,
      period: record.period,
      taxableIncome: record.taxableIncome,
      taxAmount: record.taxAmount,
      effectiveRate: record.taxableIncome > 0 ? (record.taxAmount / record.taxableIncome) * 100 : 0,
      deductions: record.deductions,
      credits: record.credits,
      netTax: record.netTax,
      status: record.status as 'draft' | 'calculated' | 'filed' | 'paid',
      dueDate: record.dueDate.toISOString().split('T')[0],
      filedDate: record.filedDate?.toISOString().split('T')[0],
      paidDate: record.paidDate?.toISOString().split('T')[0]
    }))

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
    const { period, taxableIncome, deductions, credits } = body

    // Validate required fields
    if (!period || taxableIncome === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields: period, taxableIncome' },
        { status: 400 }
      )
    }

    // Calculate tax amount based on current tax rates
    const taxRates = await db.taxRate.findMany({
      where: { isActive: true }
    })

    let taxAmount = 0
    if (taxRates.length > 0) {
      // Use the highest applicable tax rate
      const highestRate = Math.max(...taxRates.map(rate => rate.rate))
      taxAmount = taxableIncome * (highestRate / 100)
    } else {
      // Default to 14% if no tax rates are configured
      taxAmount = taxableIncome * 0.14
    }

    const netTax = Math.max(0, taxAmount - (deductions || 0) - (credits || 0))
    const effectiveRate = taxableIncome > 0 ? (netTax / taxableIncome) * 100 : 0

    // Create new tax calculation in database
    const newCalculation = await db.taxRecord.create({
      data: {
        period,
        taxableIncome,
        taxAmount,
        deductions: deductions || 0,
        credits: credits || 0,
        netTax,
        status: 'DRAFT',
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }
    })

    return NextResponse.json({
      success: true,
      calculation: {
        id: newCalculation.id,
        period: newCalculation.period,
        taxableIncome: newCalculation.taxableIncome,
        taxAmount: newCalculation.taxAmount,
        effectiveRate,
        deductions: newCalculation.deductions,
        credits: newCalculation.credits,
        netTax: newCalculation.netTax,
        status: newCalculation.status,
        dueDate: newCalculation.dueDate.toISOString().split('T')[0]
      },
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