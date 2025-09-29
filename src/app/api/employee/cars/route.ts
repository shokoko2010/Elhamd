interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view cars
    // User already available from requireUnifiedAuth

    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const category = searchParams.get('category') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { stockNumber: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (category && category !== 'all') {
      where.category = category.toUpperCase()
    }

    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          pricing: true,
          specifications: {
            orderBy: { category: 'asc' }
          }
        },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      db.vehicle.count({ where })
    ])

    // Transform the data to match the expected format
    const transformedVehicles = vehicles.map(vehicle => ({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.pricing?.basePrice || vehicle.price,
      type: vehicle.mileage && vehicle.mileage > 0 ? 'used' : 'new',
      status: vehicle.status.toLowerCase(),
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      description: vehicle.description || '',
      images: vehicle.images.map(img => img.imageUrl),
      features: vehicle.specifications.map(spec => spec.value),
      stockNumber: vehicle.stockNumber,
      vin: vehicle.vin,
      category: vehicle.category,
      color: vehicle.color,
      featured: vehicle.featured
    }))

    return NextResponse.json(transformedVehicles)
  } catch (error) {
    console.error('Error fetching vehicles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch vehicles' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // User already available from requireUnifiedAuth

    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      make,
      model,
      year,
      price,
      type,
      status,
      mileage,
      fuelType,
      transmission,
      description,
      features
    } = body

    // Validate required fields
    if (!make || !model || !year || !price || !fuelType || !transmission) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate stock number
    const stockNumber = `${make.substring(0, 3).toUpperCase()}${model.substring(0, 3).toUpperCase()}${year}${Date.now().toString().slice(-4)}`

    // Create vehicle
    const vehicle = await db.vehicle.create({
      data: {
        make,
        model,
        year,
        price,
        stockNumber,
        description,
        category: type === 'used' ? 'USED' : 'NEW',
        fuelType,
        transmission,
        mileage: type === 'used' ? mileage || 0 : null,
        color: body.color || null,
        status: status.toUpperCase() as any,
        featured: false
      }
    })

    // Create pricing
    await db.vehiclePricing.create({
      data: {
        vehicleId: vehicle.id,
        basePrice: price,
        totalPrice: price
      }
    })

    // Create specifications from features
    if (features && features.length > 0) {
      await db.vehicleSpecification.createMany({
        data: features.map((feature: string, index: number) => ({
          vehicleId: vehicle.id,
          key: `feature_${index}`,
          label: 'Feature',
          value: feature,
          category: 'TECHNOLOGY'
        }))
      })
    }

    return NextResponse.json({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      type: type,
      status: vehicle.status.toLowerCase(),
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      description: vehicle.description || '',
      images: [],
      features: features || [],
      stockNumber: vehicle.stockNumber
    })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to create vehicle' },
      { status: 500 }
    )
  }
}