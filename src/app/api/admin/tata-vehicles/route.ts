import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { withSecurity } from '@/lib/api-middleware'
import { z } from 'zod'

// Schema for vehicle creation/update
const vehicleSchema = z.object({
  make: z.string().min(1),
  model: z.string().min(1),
  year: z.number().min(1900).max(2030),
  price: z.number().min(0),
  description: z.string().optional(),
  category: z.enum(['SEDAN', 'SUV', 'HATCHBACK', 'TRUCK', 'VAN', 'COMMERCIAL', 'BUS', 'PICKUP', 'HEAVY_COMMERCIAL', 'LIGHT_COMMERCIAL']),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG']),
  transmission: z.enum(['MANUAL', 'AUTOMATIC', 'CVT']),
  mileage: z.number().optional(),
  color: z.string().optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'MAINTENANCE']).default('AVAILABLE'),
  featured: z.boolean().default(false),
  branchId: z.string().optional(),
  specifications: z.array(z.object({
    key: z.string(),
    label: z.string(),
    value: z.string(),
    category: z.enum(['ENGINE', 'EXTERIOR', 'INTERIOR', 'SAFETY', 'TECHNOLOGY']).default('ENGINE')
  })).optional(),
  images: z.array(z.object({
    imageUrl: z.string().url(),
    altText: z.string().optional(),
    isPrimary: z.boolean().default(false),
    order: z.number().default(0)
  })).optional(),
  pricing: z.object({
    basePrice: z.number().min(0),
    discountPrice: z.number().optional(),
    discountPercentage: z.number().optional(),
    taxes: z.number().default(0),
    fees: z.number().default(0),
    currency: z.string().default('EGP')
  }).optional()
})

// GET /api/admin/tata-vehicles - Get all Tata vehicles
export const GET = withSecurity(async (request: NextRequest) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = user.role === 'SUPER_ADMIN' || 
                         user.role === 'ADMIN' || 
                         user.role === 'BRANCH_MANAGER' ||
                         user.customPermissions?.VEHICLE_MANAGEMENT?.['vehicles.read']

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where: any = {
      make: 'Tata Motors'
    }

    if (search) {
      where.OR = [
        { model: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category) {
      where.category = category
    }

    if (status) {
      where.status = status
    }

    const [vehicles, total] = await Promise.all([
      db.vehicle.findMany({
        where,
        include: {
          images: {
            orderBy: { order: 'asc' }
          },
          specifications: {
            orderBy: { category: 'asc' }
          },
          pricing: true,
          branch: {
            select: {
              id: true,
              name: true,
              code: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.vehicle.count({ where })
    ])

    return NextResponse.json({
      vehicles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching Tata vehicles:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, {
  rateLimitKey: 'tata-vehicles-api'
})

// POST /api/admin/tata-vehicles - Create new Tata vehicle
export const POST = withSecurity(async (request: NextRequest) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = user.role === 'SUPER_ADMIN' || 
                         user.role === 'ADMIN' || 
                         user.role === 'BRANCH_MANAGER' ||
                         user.customPermissions?.VEHICLE_MANAGEMENT?.['vehicles.create']

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const validatedData = vehicleSchema.parse(body)

    // Generate unique stock number
    const stockNumber = `TATA-${validatedData.model.replace(/\s+/g, '-')}-${Date.now()}`

    // Create vehicle
    const vehicle = await db.vehicle.create({
      data: {
        make: validatedData.make,
        model: validatedData.model,
        year: validatedData.year,
        price: validatedData.price,
        stockNumber,
        description: validatedData.description,
        category: validatedData.category,
        fuelType: validatedData.fuelType,
        transmission: validatedData.transmission,
        mileage: validatedData.mileage,
        color: validatedData.color,
        status: validatedData.status,
        featured: validatedData.featured,
        branchId: validatedData.branchId
      }
    })

    // Create specifications if provided
    if (validatedData.specifications && validatedData.specifications.length > 0) {
      await db.vehicleSpecification.createMany({
        data: validatedData.specifications.map(spec => ({
          vehicleId: vehicle.id,
          key: spec.key,
          label: spec.label,
          value: spec.value,
          category: spec.category
        }))
      })
    }

    // Create images if provided
    if (validatedData.images && validatedData.images.length > 0) {
      await db.vehicleImage.createMany({
        data: validatedData.images.map((image, index) => ({
          vehicleId: vehicle.id,
          imageUrl: image.imageUrl,
          altText: image.altText || `${vehicle.model} - Image ${index + 1}`,
          isPrimary: image.isPrimary || index === 0,
          order: image.order || index
        }))
      })
    }

    // Create pricing if provided
    if (validatedData.pricing) {
      await db.vehiclePricing.create({
        data: {
          vehicleId: vehicle.id,
          basePrice: validatedData.pricing.basePrice,
          discountPrice: validatedData.pricing.discountPrice,
          discountPercentage: validatedData.pricing.discountPercentage,
          taxes: validatedData.pricing.taxes,
          fees: validatedData.pricing.fees,
          totalPrice: validatedData.pricing.basePrice + validatedData.pricing.taxes + validatedData.pricing.fees - (validatedData.pricing.discountPrice || 0),
          currency: validatedData.pricing.currency
        }
      })
    } else {
      // Create default pricing
      await db.vehiclePricing.create({
        data: {
          vehicleId: vehicle.id,
          basePrice: validatedData.price,
          totalPrice: validatedData.price,
          currency: 'EGP'
        }
      })
    }

    // Fetch the complete vehicle with all relations
    const completeVehicle = await db.vehicle.findUnique({
      where: { id: vehicle.id },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        specifications: {
          orderBy: { category: 'asc' }
        },
        pricing: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json({ vehicle: completeVehicle }, { status: 201 })

  } catch (error) {
    console.error('Error creating Tata vehicle:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, {
  rateLimitKey: 'tata-vehicles-api'
})