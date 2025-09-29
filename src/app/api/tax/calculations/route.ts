interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'

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
    // Mock tax calculations data - in a real system, this would be calculated from actual data
    const calculations: TaxCalculation[] = [
      {
        id: '1',
        period: 'يناير 2024',
        taxableIncome: 125000,
        taxAmount: 17500,
        effectiveRate: 14,
        deductions: 15000,
        credits: 2000,
        netTax: 15500,
        status: 'paid',
        dueDate: '2024-02-15',
        filedDate: '2024-02-10',
        paidDate: '2024-02-12'
      },
      {
        id: '2',
        period: 'فبراير 2024',
        taxableIncome: 142000,
        taxAmount: 19880,
        effectiveRate: 14,
        deductions: 18000,
        credits: 2500,
        netTax: 17380,
        status: 'paid',
        dueDate: '2024-03-15',
        filedDate: '2024-03-12',
        paidDate: '2024-03-14'
      },
      {
        id: '3',
        period: 'مارس 2024',
        taxableIncome: 138000,
        taxAmount: 19320,
        effectiveRate: 14,
        deductions: 16500,
        credits: 1800,
        netTax: 17520,
        status: 'filed',
        dueDate: '2024-04-15',
        filedDate: '2024-04-10'
      },
      {
        id: '4',
        period: 'أبريل 2024',
        taxableIncome: 155000,
        taxAmount: 21700,
        effectiveRate: 14,
        deductions: 20000,
        credits: 3000,
        netTax: 18700,
        status: 'calculated',
        dueDate: '2024-05-15'
      },
      {
        id: '5',
        period: 'مايو 2024',
        taxableIncome: 148000,
        taxAmount: 20720,
        effectiveRate: 14,
        deductions: 19000,
        credits: 2200,
        netTax: 18520,
        status: 'draft',
        dueDate: '2024-06-15'
      }
    ]

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
    const body = await request.json()
    const { period, taxableIncome, deductions, credits } = body

    // Calculate tax amount (simplified calculation)
    const taxAmount = taxableIncome * 0.14 // 14% tax rate
    const netTax = Math.max(0, taxAmount - deductions - credits)
    const effectiveRate = taxableIncome > 0 ? (netTax / taxableIncome) * 100 : 0

    // Create new tax calculation
    const newCalculation: TaxCalculation = {
      id: `calc_${Date.now()}`,
      period,
      taxableIncome,
      taxAmount,
      effectiveRate,
      deductions: deductions || 0,
      credits: credits || 0,
      netTax,
      status: 'draft',
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    }

    return NextResponse.json({
      success: true,
      calculation: newCalculation,
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