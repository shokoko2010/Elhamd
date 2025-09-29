interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query.trim() || query.length < 2) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions = await db.vehicle.findMany({
      where: {
        OR: [
          { make: { contains: query, mode: 'insensitive' } },
          { model: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        make: true,
        model: true,
        category: true
      },
      take: 8,
      distinct: ['make', 'model']
    })

    const formattedSuggestions = suggestions.map((vehicle, index) => ({
      id: `suggestion-${index}`,
      text: `${vehicle.make} ${vehicle.model}`,
      type: 'vehicle',
      category: vehicle.category,
      popularity: Math.floor(Math.random() * 100) + 1
    }))

    return NextResponse.json({ suggestions: formattedSuggestions })

  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}