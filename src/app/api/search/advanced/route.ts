interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''
    const type = searchParams.get('type') || 'all'
    const category = searchParams.get('category') || 'all'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const minPrice = searchParams.get('minPrice')
    const maxPrice = searchParams.get('maxPrice')
    const status = searchParams.get('status')
    const tags = searchParams.get('tags')

    if (!query.trim()) {
      return NextResponse.json({ results: [] })
    }

    const results: any[] = []

    // Search vehicles
    if (type === 'all' || type === 'vehicle') {
      const vehicles = await db.vehicle.findMany({
        where: {
          AND: [
            {
              OR: [
                { make: { contains: query, mode: 'insensitive' } },
                { model: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } },
                { stockNumber: { contains: query, mode: 'insensitive' } }
              ]
            },
            category === 'all' ? {} : { category: category.toUpperCase() as any },
            startDate || endDate ? {
              createdAt: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined
              }
            } : {},
            minPrice || maxPrice ? {
              price: {
                gte: minPrice ? parseFloat(minPrice) : undefined,
                lte: maxPrice ? parseFloat(maxPrice) : undefined
              }
            } : {},
            status ? { status: status.toUpperCase() as any } : {}
          ]
        },
        take: 10
      })

      results.push(...vehicles.map(vehicle => ({
        id: vehicle.id,
        type: 'vehicle',
        title: `${vehicle.make} ${vehicle.model}`,
        description: vehicle.description || `${vehicle.year} • ${vehicle.category}`,
        category: vehicle.category,
        relevanceScore: calculateRelevanceScore(query, `${vehicle.make} ${vehicle.model} ${vehicle.description || ''}`),
        highlights: extractHighlights(query, `${vehicle.make} ${vehicle.model} ${vehicle.description || ''}`),
        metadata: {
          year: vehicle.year,
          price: vehicle.price,
          status: vehicle.status,
          mileage: vehicle.mileage
        },
        createdAt: vehicle.createdAt.toISOString(),
        updatedAt: vehicle.updatedAt.toISOString()
      })))
    }

    // Search customers
    if (type === 'all' || type === 'customer') {
      const customers = await db.user.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } }
              ]
            },
            startDate || endDate ? {
              createdAt: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined
              }
            } : {},
            status ? { status: status } : {}
          ]
        },
        take: 10
      })

      results.push(...customers.map(customer => ({
        id: customer.id,
        type: 'customer',
        title: customer.name || 'Unknown Customer',
        description: `${customer.email} • ${customer.phone}`,
        category: 'customer',
        relevanceScore: calculateRelevanceScore(query, `${customer.name || ''} ${customer.email} ${customer.phone}`),
        highlights: extractHighlights(query, `${customer.name || ''} ${customer.email} ${customer.phone}`),
        metadata: {
          email: customer.email,
          phone: customer.phone,
          status: customer.status,
          segment: customer.segment
        },
        createdAt: customer.createdAt.toISOString(),
        updatedAt: customer.updatedAt.toISOString()
      })))
    }

    // Search bookings
    if (type === 'all' || type === 'booking') {
      const bookings = await db.booking.findMany({
        where: {
          AND: [
            {
              OR: [
                { notes: { contains: query, mode: 'insensitive' } }
              ]
            },
            startDate || endDate ? {
              date: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined
              }
            } : {},
            status ? { status: status.toUpperCase() as any } : {}
          ]
        },
        include: {
          customer: {
            select: { name: true }
          },
          vehicle: {
            select: { make: true, model: true }
          },
          serviceType: {
            select: { name: true }
          }
        },
        take: 10
      })

      results.push(...bookings.map(booking => ({
        id: booking.id,
        type: 'booking',
        title: `حجز ${booking.type === 'test_drive' ? 'قيادة تجريبية' : 'خدمة'}`,
        description: `${booking.customer.name} • ${booking.vehicle ? `${booking.vehicle.make} ${booking.vehicle.model}` : booking.serviceType?.name}`,
        category: 'booking',
        relevanceScore: calculateRelevanceScore(query, booking.notes || ''),
        highlights: extractHighlights(query, booking.notes || ''),
        metadata: {
          type: booking.type,
          date: booking.date,
          status: booking.status,
          totalPrice: booking.totalPrice
        },
        createdAt: booking.createdAt.toISOString(),
        updatedAt: booking.updatedAt.toISOString()
      })))
    }

    // Search inventory items
    if (type === 'all' || type === 'inventory_item') {
      const inventoryItems = await db.inventoryItem.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { partNumber: { contains: query, mode: 'insensitive' } },
                { description: { contains: query, mode: 'insensitive' } }
              ]
            },
            category === 'all' ? {} : { category },
            startDate || endDate ? {
              createdAt: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined
              }
            } : {},
            minPrice || maxPrice ? {
              unitPrice: {
                gte: minPrice ? parseFloat(minPrice) : undefined,
                lte: maxPrice ? parseFloat(maxPrice) : undefined
              }
            } : {},
            status ? { status: status.toUpperCase() as any } : {}
          ]
        },
        take: 10
      })

      results.push(...inventoryItems.map(item => ({
        id: item.id,
        type: 'inventory_item',
        title: item.name,
        description: `${item.partNumber} • ${item.description || ''}`,
        category: item.category,
        relevanceScore: calculateRelevanceScore(query, `${item.name} ${item.partNumber} ${item.description || ''}`),
        highlights: extractHighlights(query, `${item.name} ${item.partNumber} ${item.description || ''}`),
        metadata: {
          partNumber: item.partNumber,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          status: item.status
        },
        createdAt: item.createdAt.toISOString(),
        updatedAt: item.updatedAt.toISOString()
      })))
    }

    // Search suppliers
    if (type === 'all' || type === 'supplier') {
      const suppliers = await db.supplier.findMany({
        where: {
          AND: [
            {
              OR: [
                { name: { contains: query, mode: 'insensitive' } },
                { contact: { contains: query, mode: 'insensitive' } },
                { email: { contains: query, mode: 'insensitive' } },
                { phone: { contains: query } }
              ]
            },
            startDate || endDate ? {
              createdAt: {
                gte: startDate ? new Date(startDate) : undefined,
                lte: endDate ? new Date(endDate) : undefined
              }
            } : {},
            status ? { status: status } : {}
          ]
        },
        take: 10
      })

      results.push(...suppliers.map(supplier => ({
        id: supplier.id,
        type: 'supplier',
        title: supplier.name,
        description: `${supplier.contact} • ${supplier.email}`,
        category: 'supplier',
        relevanceScore: calculateRelevanceScore(query, `${supplier.name} ${supplier.contact} ${supplier.email}`),
        highlights: extractHighlights(query, `${supplier.name} ${supplier.contact} ${supplier.email}`),
        metadata: {
          contact: supplier.contact,
          email: supplier.email,
          phone: supplier.phone,
          rating: supplier.rating
        },
        createdAt: supplier.createdAt.toISOString(),
        updatedAt: supplier.updatedAt.toISOString()
      })))
    }

    // Sort by relevance score
    results.sort((a, b) => b.relevanceScore - a.relevanceScore)

    return NextResponse.json({ results: results.slice(0, 50) })

  } catch (error) {
    console.error('Error performing advanced search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
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