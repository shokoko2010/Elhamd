import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { VehicleCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const limitParam = searchParams.get('limit') || '12'
    const limit = limitParam === 'all' ? 0 : parseInt(limitParam)
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''
    const fuelType = searchParams.get('fuelType') || ''
    const transmission = searchParams.get('transmission') || ''
    const status = searchParams.get('status') || 'AVAILABLE'

    const fetchAll = searchParams.get('all') === 'true' || limitParam === 'all'
    const effectiveLimit = fetchAll ? undefined : limit
    const skip = fetchAll ? undefined : (page - 1) * limit

    // Build where clause - only show available vehicles to public
    const where: any = {}

    if (status !== 'all') {
      where.status = 'AVAILABLE'
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

    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [vehicles, total] = await Promise.all([
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
          { createdAt: 'desc' }
        ],
        skip,
        take: effectiveLimit
      }),
      db.vehicle.count({ where })
    ])

    return NextResponse.json({
      vehicles,
      pagination: {
        total,
        page,
        limit: fetchAll ? total : limit,
        totalPages: fetchAll ? 1 : Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching public vehicles:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المركبات' },
      { status: 500 }
    )
  }
}