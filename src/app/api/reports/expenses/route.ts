import { NextRequest, NextResponse } from 'next/server'

interface ExpenseBreakdown {
  categories: Array<{
    category: string
    amount: number
    percentage: number
    trend: 'up' | 'down' | 'stable'
  }>
  byMonth: Array<{
    month: string
    amount: number
  }>
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const timeRange = searchParams.get('timeRange') || 'month'

    // Mock expense data - in a real system, this would come from actual expense tracking
    const categories = [
      { category: 'الرواتب والمزايا', amount: 45000, trend: 'up' as const },
      { category: 'الإيجار والمرافق', amount: 25000, trend: 'stable' as const },
      { category: 'التسويق والإعلان', amount: 15000, trend: 'up' as const },
      { category: 'الصيانة والتشغيل', amount: 12000, trend: 'down' as const },
      { category: 'التأمين والضرائب', amount: 18000, trend: 'up' as const },
      { category: 'التكنولوجيا والبرمجيات', amount: 8000, trend: 'stable' as const },
      { category: 'المواد والمستلزمات', amount: 10000, trend: 'down' as const },
      { category: 'أخرى', amount: 7000, trend: 'stable' as const }
    ]

    const totalExpenses = categories.reduce((sum, cat) => sum + cat.amount, 0)

    const categoriesWithPercentage = categories.map(cat => ({
      ...cat,
      percentage: (cat.amount / totalExpenses) * 100
    }))

    // Monthly breakdown for the last 6 months
    const byMonth = []
    const currentDate = new Date()
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1)
      const baseAmount = totalExpenses + (Math.random() - 0.5) * 10000
      
      byMonth.push({
        month: monthDate.toLocaleDateString('ar-EG', { month: 'short', year: 'numeric' }),
        amount: Math.max(0, baseAmount)
      })
    }

    const report: ExpenseBreakdown = {
      categories: categoriesWithPercentage,
      byMonth
    }

    return NextResponse.json(report)
  } catch (error) {
    console.error('Error generating expense breakdown:', error)
    return NextResponse.json(
      { error: 'Failed to generate expense breakdown' },
      { status: 500 }
    )
  }
}