import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface SearchSuggestion {
  id: string
  text: string
  type: 'make' | 'model' | 'category' | 'fuel' | 'transmission'
  count?: number
  popularity?: number
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')?.trim() || ''
    const limit = parseInt(searchParams.get('limit') || '8')

    if (!query) {
      return NextResponse.json({ suggestions: [] })
    }

    const suggestions: SearchSuggestion[] = []

    // Get unique makes
    const makes = await db.vehicle.findMany({
      where: {
        make: {
          contains: query,
          mode: 'insensitive'
        },
        status: 'AVAILABLE'
      },
      select: {
        make: true
      },
      distinct: ['make'],
      take: limit
    })

    makes.forEach((make, index) => {
      suggestions.push({
        id: `make-${index}`,
        text: make.make,
        type: 'make',
        popularity: Math.floor(Math.random() * 30) + 70 // Simulated popularity
      })
    })

    // Get models for the makes
    const models = await db.vehicle.findMany({
      where: {
        model: {
          contains: query,
          mode: 'insensitive'
        },
        status: 'AVAILABLE'
      },
      select: {
        model: true,
        make: true
      },
      distinct: ['model'],
      take: limit
    })

    models.forEach((model, index) => {
      suggestions.push({
        id: `model-${index}`,
        text: `${model.make} ${model.model}`,
        type: 'model',
        popularity: Math.floor(Math.random() * 40) + 60
      })
    })

    // Get categories
    const categories = await db.vehicle.findMany({
      where: {
        category: {
          contains: query,
          mode: 'insensitive'
        },
        status: 'AVAILABLE'
      },
      select: {
        category: true
      },
      distinct: ['category']
    })

    categories.forEach((category, index) => {
      const count = Math.floor(Math.random() * 20) + 5 // Simulated count
      suggestions.push({
        id: `category-${index}`,
        text: category.category,
        type: 'category',
        count
      })
    })

    // Get fuel types
    const fuelTypes = await db.vehicle.findMany({
      where: {
        fuelType: {
          contains: query,
          mode: 'insensitive'
        },
        status: 'AVAILABLE'
      },
      select: {
        fuelType: true
      },
      distinct: ['fuelType']
    })

    fuelTypes.forEach((fuel, index) => {
      const count = Math.floor(Math.random() * 25) + 10
      suggestions.push({
        id: `fuel-${index}`,
        text: fuel.fuelType,
        type: 'fuel',
        count
      })
    })

    // Get transmission types
    const transmissions = await db.vehicle.findMany({
      where: {
        transmission: {
          contains: query,
          mode: 'insensitive'
        },
        status: 'AVAILABLE'
      },
      select: {
        transmission: true
      },
      distinct: ['transmission']
    })

    transmissions.forEach((transmission, index) => {
      const count = Math.floor(Math.random() * 20) + 8
      suggestions.push({
        id: `transmission-${index}`,
        text: transmission.transmission,
        type: 'transmission',
        count
      })
    })

    // Sort by relevance (exact matches first, then by popularity/count)
    const sortedSuggestions = suggestions
      .sort((a, b) => {
        // Exact matches first
        const aExact = a.text.toLowerCase() === query.toLowerCase()
        const bExact = b.text.toLowerCase() === query.toLowerCase()
        if (aExact && !bExact) return -1
        if (!aExact && bExact) return 1

        // Then by starts with
        const aStartsWith = a.text.toLowerCase().startsWith(query.toLowerCase())
        const bStartsWith = b.text.toLowerCase().startsWith(query.toLowerCase())
        if (aStartsWith && !bStartsWith) return -1
        if (!aStartsWith && bStartsWith) return 1

        // Then by popularity/count
        const aScore = a.popularity || a.count || 0
        const bScore = b.popularity || b.count || 0
        return bScore - aScore
      })
      .slice(0, limit)

    return NextResponse.json({ suggestions: sortedSuggestions })

  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الاقتراحات' },
      { status: 500 }
    )
  }
}