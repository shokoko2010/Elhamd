interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole, VehicleStatus, VehicleCategory, FuelType, TransmissionType } from '@prisma/client'
import { z } from 'zod'
import { PERMISSIONS } from '@/lib/permissions'

const baseVehicleSchema = z.object({
  make: z.string().min(1, 'الماركة مطلوبة'),
  model: z.string().min(1, 'الموديل مطلوب'),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1),
  price: z.number().positive('السعر يجب أن يكون موجباً'),
  stockNumber: z.string().min(1, 'رقم المخزون مطلوب'),
  stockQuantity: z.number().int().min(0).default(0),
  vin: z.string().optional(),
  description: z.string().optional(),
  category: z.nativeEnum(VehicleCategory),
  fuelType: z.nativeEnum(FuelType),
  transmission: z.nativeEnum(TransmissionType),
  mileage: z.number().int().min(0).optional(),
  color: z.string().optional(),
  status: z.nativeEnum(VehicleStatus),
  featured: z.boolean().optional()
})

const createVehicleSchema = baseVehicleSchema
const updateVehicleSchema = baseVehicleSchema.partial()

const sanitizeVehiclePayload = <T extends Partial<z.infer<typeof baseVehicleSchema>>>(
  payload: T,
  options: { applyDefaults?: boolean } = {}
) => {
  const data: Record<string, unknown> = { ...payload }

  if (data.vin !== undefined) {
    const vin = typeof data.vin === 'string' ? data.vin.trim() : data.vin
    data.vin = vin ? vin : undefined
  }

  if (data.description !== undefined && typeof data.description === 'string') {
    const trimmed = data.description.trim()
    data.description = trimmed ? trimmed : undefined
  }

  if (data.color !== undefined && typeof data.color === 'string') {
    const trimmed = data.color.trim()
    data.color = trimmed ? trimmed : undefined
  }

  if (data.mileage !== undefined && data.mileage !== null) {
    data.mileage = Number(data.mileage)
  }

  if (data.stockQuantity !== undefined && data.stockQuantity !== null) {
    data.stockQuantity = Number(data.stockQuantity)
  }

  if (options.applyDefaults) {
    data.stockQuantity = typeof data.stockQuantity === 'number' ? data.stockQuantity : 0
    data.featured = typeof data.featured === 'boolean' ? data.featured : false
  }

  return data as T
}

// GET /api/admin/vehicles - List all vehicles
export async function GET(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : []
    const hasAccess =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.STAFF ||
      user.role === UserRole.BRANCH_MANAGER ||
      userPermissions.includes(PERMISSIONS.VIEW_VEHICLES)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const category = searchParams.get('category') || ''
    const status = searchParams.get('status') || ''
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
          _count: {
            select: {
              testDriveBookings: true,
              serviceBookings: true
            }
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
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : []
    const hasAccess =
      user.role === UserRole.ADMIN ||
      user.role === UserRole.SUPER_ADMIN ||
      user.role === UserRole.STAFF ||
      user.role === UserRole.BRANCH_MANAGER ||
      userPermissions.includes(PERMISSIONS.CREATE_VEHICLES)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = createVehicleSchema.parse(body)
    const sanitizedData = sanitizeVehiclePayload(validatedData, { applyDefaults: true })

    // Check if stock number already exists
    const existingVehicle = await db.vehicle.findUnique({
      where: { stockNumber: sanitizedData.stockNumber }
    })
    
    if (existingVehicle) {
      return NextResponse.json(
        { error: 'رقم المخزون مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Check if VIN already exists (if provided)
    const sanitizedVin = sanitizedData.vin as string | undefined
    if (sanitizedVin) {
      const existingVin = await db.vehicle.findUnique({
        where: { vin: sanitizedVin }
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
        ...sanitizedData,
        pricing: {
          create: {
            basePrice: sanitizedData.price,
            discountPrice: null,
            discountPercentage: null,
            taxes: 0,
            fees: 0,
            totalPrice: sanitizedData.price,
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