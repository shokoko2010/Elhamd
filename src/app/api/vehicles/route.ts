import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const limit = parseInt(searchParams.get('limit') || '12')
    const page = parseInt(searchParams.get('page') || '1')
    const search = searchParams.get('search') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      status: 'ACTIVE'
    }

    if (category && category !== 'all') {
      where.category = {
        name: { contains: category, mode: 'insensitive' }
      }
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        include: {
          images: {
            orderBy: {
              displayOrder: 'asc'
            },
            select: {
              id: true,
              url: true,
              fileName: true,
              isPrimary: true,
              displayOrder: true
            }
          },
          category: true
        },
        orderBy: [
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      db.vehicle.count({ where })
    ])

    // Transform the data to match the expected format
    const transformedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      title: vehicle.title,
      description: vehicle.description,
      category: vehicle.category?.name || '',
      price: 0, // Default price since it's not in our schema
      fuelType: 'ديزل', // Default fuel type
      transmission: 'يدوي', // Default transmission
      year: 2024, // Default year
      make: 'Tata', // Default make
      model: vehicle.title,
      images: vehicle.images.map(img => ({
        id: img.id,
        imageUrl: img.url,
        altText: img.fileName,
        isPrimary: img.isPrimary,
        order: img.displayOrder
      })),
      specifications: vehicle.specifications,
      highlights: vehicle.highlights,
      features: vehicle.features,
      status: vehicle.status,
      createdAt: vehicle.createdAt,
      updatedAt: vehicle.updatedAt
    }))

    return NextResponse.json({
      vehicles: transformedVehicles,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المركبات' },
      { status: 500 }
    )
  }
}