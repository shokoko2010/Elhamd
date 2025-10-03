interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { UserRole, VehicleStatus, VehicleCategory, FuelType, TransmissionType } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
const createVehicleSchema = z.object({
  make: z.string().min(1, 'الماركة مطلوبة'),
  model: z.string().min(1, 'الموديل مطلوب'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive('السعر يجب أن يكون موجباً'),
  stockNumber: z.string().min(1, 'رقم المخزون مطلوب'),
  vin: z.string().optional(),
  description: z.string().optional(),
  category: z.nativeEnum(VehicleCategory),
  fuelType: z.nativeEnum(FuelType),
  transmission: z.nativeEnum(TransmissionType),
  mileage: z.number().min(0).optional(),
  color: z.string().optional(),
  status: z.nativeEnum(VehicleStatus),
  featured: z.boolean(),
  isActive: z.boolean()
})

const updateVehicleSchema = createVehicleSchema.partial().extend({
  id: z.string().cuid()
})

// GET /api/admin/vehicles - List all vehicles
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await requireUnifiedAuth(request)
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
    const featured = searchParams.get('featured') || ''
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { make: { contains: search, mode: 'insensitive' } },
        { model: { contains: search, mode: 'insensitive' } },
        { stockNumber: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (category && category !== 'all') {
      where.category = category as VehicleCategory
    }
    
    if (status && status !== 'all') {
      where.status = status as VehicleStatus
    }
    
    if (featured === 'true') {
      where.featured = true
    } else if (featured === 'false') {
      where.featured = false
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
          testDriveBookings: {
            select: { id: true }
          },
          serviceBookings: {
            select: { id: true }
          }
        },
        orderBy: [
          { [sortBy]: sortOrder },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      db.vehicle.count({ where })
    ])

    return NextResponse.json({
      vehicles,
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

// POST /api/admin/vehicles - Create new vehicle
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await requireUnifiedAuth(request)
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = createVehicleSchema.parse(body)

    // Check if stock number already exists
    const existingVehicle = await db.vehicle.findUnique({
      where: { stockNumber: validatedData.stockNumber }
    })
    
    if (existingVehicle) {
      return NextResponse.json(
        { error: 'رقم المخزون مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Check if VIN already exists (if provided)
    if (validatedData.vin) {
      const existingVin = await db.vehicle.findUnique({
        where: { vin: validatedData.vin }
      })
      
      if (existingVin) {
        return NextResponse.json(
          { error: 'رقم الهيكل (VIN) مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // Create vehicle with default pricing
    const vehicle = await db.vehicle.create({
      data: {
        ...validatedData,
        pricing: {
          create: {
            basePrice: validatedData.price,
            discountPrice: null,
            discountPercentage: null,
            taxes: 0,
            fees: 0,
            totalPrice: validatedData.price,
            currency: 'EGP',
            hasDiscount: false,
            discountExpires: null
          }
        }
      },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        pricing: true
      }
    })

    return NextResponse.json(vehicle, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'فشل في إنشاء المركبة' },
      { status: 500 }
    )
  }
}