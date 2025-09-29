interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category') || 'all'
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const fuelType = searchParams.get('fuelType')
    const transmission = searchParams.get('transmission')
    const year = searchParams.get('year')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '12')
    const sortBy = searchParams.get('sortBy') || 'relevance'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    if (!query.trim()) {
      return NextResponse.json({ 
        results: [],
        pagination: {
          total: 0,
          page: 1,
          limit: 12,
          totalPages: 0
        }
      })
    }

    const skip = (page - 1) * limit

    // Build where clause for vehicles
    const whereClause: any = {
      AND: [
        {
          OR: [
            { make: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } },
            { features: { has: query } }
          ]
        }
      ]
    }

    // Add filters
    if (category !== 'all') {
      whereClause.AND.push({ category: category.toUpperCase() as any })
    }

    if (minPrice || maxPrice) {
      whereClause.AND.push({
        price: {
          gte: minPrice ? parseFloat(minPrice) : undefined,
          lte: maxPrice ? parseFloat(maxPrice) : undefined
        }
      })
    }

    if (fuelType && fuelType !== 'all') {
      whereClause.AND.push({ fuelType: fuelType.toUpperCase() as any })
    }

    if (transmission && transmission !== 'all') {
      whereClause.AND.push({ transmission: transmission.toUpperCase() as any })
    }

    if (year) {
      whereClause.AND.push({ year: parseInt(year) })
    }

    // Build sort options
    let orderBy: any = {}
    switch (sortBy) {
      case 'price':
        orderBy = { price: sortOrder === 'asc' ? 'asc' : 'desc' }
        break
      case 'year':
        orderBy = { year: sortOrder === 'asc' ? 'asc' : 'desc' }
        break
      case 'mileage':
        orderBy = { mileage: sortOrder === 'asc' ? 'asc' : 'desc' }
        break
      case 'created':
        orderBy = { createdAt: sortOrder === 'asc' ? 'asc' : 'desc' }
        break
      default:
        // For relevance, we'll calculate it after fetching
        orderBy = { createdAt: 'desc' }
    }

    // Fetch vehicles with filters
    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where: whereClause,
        include: {
          images: {
            where: { isPrimary: true },
            take: 1
          }
        },
        orderBy,
        skip,
        take: limit
      }),
      db.vehicle.count({ where: whereClause })
    ])

    // Calculate relevance scores and format results
    const results = vehicles.map(vehicle => {
      const relevanceScore = calculateRelevanceScore(query, `${vehicle.make} ${vehicle.model} ${vehicle.description || ''}`)
      
      return {
        id: vehicle.id,
        type: 'vehicle',
        title: `${vehicle.make} ${vehicle.model}`,
        description: vehicle.description || `${vehicle.year} • ${vehicle.category}`,
        category: vehicle.category,
        relevanceScore,
        highlights: extractHighlights(query, `${vehicle.make} ${vehicle.model} ${vehicle.description || ''}`),
        metadata: {
          year: vehicle.year,
          price: vehicle.price,
          status: vehicle.status,
          mileage: vehicle.mileage,
          fuelType: vehicle.fuelType,
          transmission: vehicle.transmission,
          primaryImage: vehicle.images[0]?.imageUrl || null
        },
        createdAt: vehicle.createdAt.toISOString(),
        updatedAt: vehicle.updatedAt.toISOString()
      }
    })

    // Sort by relevance if that's the selected sort option
    if (sortBy === 'relevance') {
      results.sort((a, b) => sortOrder === 'asc' ? a.relevanceScore - b.relevanceScore : b.relevanceScore - a.relevanceScore)
    }

    // Get available filters for the current query
    const availableFilters = await getAvailableFilters(query, whereClause.AND.slice(1))

    return NextResponse.json({
      results,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      },
      filters: availableFilters,
      suggestions: await getSearchSuggestions(query)
    })

  } catch (error) {
    console.error('Error performing public search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function getAvailableFilters(query: string, additionalFilters: any[]) {
  try {
    const baseWhere = {
      AND: [
        {
          OR: [
            { make: { contains: query, mode: 'insensitive' } },
            { model: { contains: query, mode: 'insensitive' } },
            { description: { contains: query, mode: 'insensitive' } }
          ]
        },
        ...additionalFilters
      ]
    }

    // Get categories
    const categories = await db.vehicle.findMany({
      where: baseWhere,
      select: { category: true },
      distinct: ['category']
    })

    // Get fuel types
    const fuelTypes = await db.vehicle.findMany({
      where: baseWhere,
      select: { fuelType: true },
      distinct: ['fuelType']
    })

    // Get transmissions
    const transmissions = await db.vehicle.findMany({
      where: baseWhere,
      select: { transmission: true },
      distinct: ['transmission']
    })

    // Get years
    const years = await db.vehicle.findMany({
      where: baseWhere,
      select: { year: true },
      distinct: ['year'],
      orderBy: { year: 'desc' }
    })

    // Get price range
    const priceStats = await db.vehicle.aggregate({
      where: baseWhere,
      _min: { price: true },
      _max: { price: true }
    })

    return {
      categories: categories.map(c => c.category),
      fuelTypes: fuelTypes.map(f => f.fuelType),
      transmissions: transmissions.map(t => t.transmission),
      years: years.map(y => y.year),
      priceRange: {
        min: priceStats._min.price || 0,
        max: priceStats._max.price || 1000000
      }
    }
  } catch (error) {
    console.error('Error getting available filters:', error)
    return {
      categories: [],
      fuelTypes: [],
      transmissions: [],
      years: [],
      priceRange: { min: 0, max: 1000000 }
    }
  }
}

async function getSearchSuggestions(query: string) {
  try {
    if (!query.trim() || query.length < 2) {
      return []
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

    return suggestions.map((vehicle, index) => ({
      id: `suggestion-${index}`,
      text: `${vehicle.make} ${vehicle.model}`,
      type: 'vehicle',
      category: vehicle.category,
      popularity: Math.floor(Math.random() * 100) + 1
    }))
  } catch (error) {
    console.error('Error getting search suggestions:', error)
    return []
  }
}

function calculateRelevanceScore(query: string, text: string): number {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  
  let score = 0
  
  // Exact match gets highest score
  if (textLower.includes(queryLower)) {
    score += 0.8
  }
  
  // Word matches
  const queryWords = queryLower.split(' ')
  const textWords = textLower.split(' ')
  
  queryWords.forEach(queryWord => {
    textWords.forEach(textWord => {
      if (textWord === queryWord) {
        score += 0.2
      } else if (textWord.includes(queryWord) || queryWord.includes(textWord)) {
        score += 0.1
      }
    })
  })
  
  return Math.min(score, 1)
}

function extractHighlights(query: string, text: string): string[] {
  const queryLower = query.toLowerCase()
  const textLower = text.toLowerCase()
  const highlights: string[] = []
  
  const queryWords = queryLower.split(' ')
  const textWords = text.split(' ')
  
  textWords.forEach(word => {
    const wordLower = word.toLowerCase()
    queryWords.forEach(queryWord => {
      if (wordLower.includes(queryWord) && word.length > 2) {
        highlights.push(word)
      }
    })
  })
  
  return [...new Set(highlights)].slice(0, 5)
}