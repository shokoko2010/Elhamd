import { NextRequest, NextResponse } from 'next/server'

interface KeyMetrics {
  averageTransactionValue: number
  customerLifetimeValue: number
  customerAcquisitionCost: number
  returnOnInvestment: number
  breakEvenPoint: number
  cashFlow: number
  workingCapital: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'month'

    // Mock key metrics data - in a real system, this would be calculated from actual data
    const metrics: KeyMetrics = {
      averageTransactionValue: 2850,
      customerLifetimeValue: 45600,
      customerAcquisitionCost: 1200,
      returnOnInvestment: 24.5,
      breakEvenPoint: 156,
      cashFlow: 32400,
      workingCapital: 185000
    }

    return NextResponse.json(metrics)
  } catch (error) {
    console.error('Error generating key metrics:', error)
    return NextResponse.json(
      { error: 'Failed to generate key metrics' },
      { status: 500 }
    )
  }
}