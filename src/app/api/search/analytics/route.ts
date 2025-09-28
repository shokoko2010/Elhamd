import { NextRequest, NextResponse } from 'next/server'
export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Mock analytics data - in a real implementation, this would come from a search analytics table
    const analytics = {
      totalSearches: 15420,
      popularQueries: [
        { query: 'Toyota Corolla', count: 342 },
        { query: 'محرك', count: 289 },
        { query: 'فرامل', count: 234 },
        { query: 'BMW', count: 198 },
        { query: 'زيت', count: 176 }
      ],
      averageResults: 12.5,
      topCategories: [
        { category: 'vehicle', count: 8920 },
        { category: 'inventory_item', count: 3450 },
        { category: 'customer', count: 2100 },
        { category: 'booking', count: 850 },
        { category: 'supplier', count: 100 }
      ],
      searchTrends: [
        { date: '2024-01-01', count: 120 },
        { date: '2024-01-02', count: 135 },
        { date: '2024-01-03', count: 142 },
        { date: '2024-01-04', count: 158 },
        { date: '2024-01-05', count: 167 },
        { date: '2024-01-06', count: 189 },
        { date: '2024-01-07', count: 201 }
      ]
    }

    return NextResponse.json(analytics)

  } catch (error) {
    console.error('Error fetching search analytics:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}