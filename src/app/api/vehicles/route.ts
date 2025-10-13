import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { VehicleStatus, VehicleCategory } from '@prisma/client'
import { PerformanceMonitor, monitorDbQuery } from '@/lib/performance-monitor'

// Simple cache implementation
const cache = new Map<string, { data: any; timestamp: number }>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes

function getCacheKey(searchParams: URLSearchParams): string {
  return searchParams.toString()
}

function getFromCache(key: string): any | null {
  const cached = cache.get(key)
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.data
  }
  if (cached) {
    cache.delete(key)
  }
  return null
}

function setCache(key: string, data: any): void {
  cache.set(key, { data, timestamp: Date.now() })
  
  // Clean up old cache entries periodically
  if (cache.size > 100) {
    const now = Date.now()
    for (const [k, v] of cache.entries()) {
      if (now - v.timestamp > CACHE_TTL) {
        cache.delete(k)
      }
    }
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const featured = searchParams.get('featured') === 'true'
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const fuelType = searchParams.get('fuelType') || ''
    const transmission = searchParams.get('transmission') || ''

    // Check cache first
    const cacheKey = getCacheKey(searchParams)
    const cachedData = getFromCache(cacheKey)
    if (cachedData) {
      return NextResponse.json(cachedData)
    }

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: VehicleStatus.AVAILABLE
    }

    if (category && category !== 'all') {
      where.category = category as VehicleCategory
    }

    if (fuelType && fuelType !== 'all') {
      where.fuelType = fuelType
    }

    if (transmission && transmission !== 'all') {
      where.transmission = transmission
    }

    if (featured) {
      where.featured = true
    }

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [vehicles, total] = await Promise.all([
      monitorDbQuery('vehicles-findMany', () =>
        db.vehicle.findMany({
          where,
          include: {
            images: {
              orderBy: {
                order: 'asc'
              },
              select: {
                id: true,
                imageUrl: true,
                altText: true,
                isPrimary: true,
                order: true
              }
            }
          },
          orderBy: [
            { featured: 'desc' },
            { createdAt: 'desc' }
          ],
          skip,
          take: limit
        })
      ),
      monitorDbQuery('vehicles-count', () =>
        db.vehicle.count({ where })
      )
    ])

    const responseData = {
      vehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    }

    // Cache the response
    setCache(cacheKey, responseData)

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المركبات' },
      { status: 500 }
    )
  }
}