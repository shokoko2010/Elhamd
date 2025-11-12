interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { Prisma, UserRole, VehicleStatus, VehicleCategory, FuelType, TransmissionType } from '@prisma/client'
import { z } from 'zod'
import { PERMISSIONS } from '@/lib/permissions'

const updateVehicleSchema = z.object({
  make: z.string().min(1, 'الماركة مطلوبة').optional(),
  model: z.string().min(1, 'الموديل مطلوب').optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  price: z.number().positive('السعر يجب أن يكون موجباً').optional(),
  stockNumber: z.string().min(1, 'رقم المخزون مطلوب').optional(),
  stockQuantity: z.number().int().min(0).optional(),
  vin: z.string().optional(),
  description: z.string().optional(),
  category: z.nativeEnum(VehicleCategory).optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  transmission: z.nativeEnum(TransmissionType).optional(),
  mileage: z.number().int().min(0).optional(),
  color: z.string().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  featured: z.boolean().optional()
})

const sanitizeVehiclePayload = (payload: z.infer<typeof updateVehicleSchema>) => {
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

  return data as z.infer<typeof updateVehicleSchema>
}

// GET /api/admin/vehicles/[id] - Get single vehicle
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
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
      userPermissions.includes(PERMISSIONS.EDIT_VEHICLES) ||
      userPermissions.includes(PERMISSIONS.DELETE_VEHICLES) ||
      userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) ||
      userPermissions.includes(PERMISSIONS.VIEW_VEHICLES)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        specifications: {
          orderBy: { category: 'asc' }
        },
        pricing: true,
        testDriveBookings: {
          select: { id: true, date: true, timeSlot: true, status: true }
        },
        serviceBookings: {
          select: { id: true, date: true, timeSlot: true, status: true }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error fetching vehicle:', error)
    return NextResponse.json(
      { error: 'فشل في جلب المركبة' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/vehicles/[id] - Update vehicle
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
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
      userPermissions.includes(PERMISSIONS.EDIT_VEHICLES) ||
      userPermissions.includes(PERMISSIONS.DELETE_VEHICLES) ||
      userPermissions.includes(PERMISSIONS.CREATE_VEHICLES) ||
      userPermissions.includes(PERMISSIONS.VIEW_VEHICLES)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    // Check if vehicle exists
    const existingVehicle = await db.vehicle.findUnique({
      where: { id },
      include: { pricing: true }
    })

    if (!existingVehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateVehicleSchema.parse(body)
    const sanitizedData = sanitizeVehiclePayload(validatedData)

    const updateData: Prisma.VehicleUpdateInput = {
      ...sanitizedData
    }

    // Check if stock number already exists (if being updated)
    if (sanitizedData.stockNumber && sanitizedData.stockNumber !== existingVehicle.stockNumber) {
      const stockNumberExists = await db.vehicle.findUnique({
        where: { stockNumber: sanitizedData.stockNumber }
      })

      if (stockNumberExists) {
        return NextResponse.json(
          { error: 'رقم المخزون مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // Check if VIN already exists (if being updated)
    const sanitizedVin = sanitizedData.vin as string | undefined
    if (sanitizedVin && sanitizedVin !== existingVehicle.vin) {
      const vinExists = await db.vehicle.findUnique({
        where: { vin: sanitizedVin }
      })

      if (vinExists) {
        return NextResponse.json(
          { error: 'رقم الهيكل (VIN) مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    if (sanitizedData.price !== undefined) {
      const basePrice = sanitizedData.price
      const existingPricing = existingVehicle.pricing
      const taxes = existingPricing?.taxes ?? 0
      const fees = existingPricing?.fees ?? 0

      let discountPrice = existingPricing?.discountPrice ?? null
      let discountPercentage = existingPricing?.discountPercentage ?? null
      let hasDiscount = existingPricing?.hasDiscount ?? false

      if (hasDiscount && discountPrice !== null) {
        if (discountPrice >= basePrice) {
          discountPrice = basePrice
          discountPercentage = 0
          hasDiscount = discountPrice < basePrice
        } else {
          const computedDiscount = ((basePrice - discountPrice) / basePrice) * 100
          discountPercentage = Number.isFinite(computedDiscount) ? Number(computedDiscount.toFixed(2)) : null
          hasDiscount = true
        }
      } else {
        discountPrice = null
        discountPercentage = null
        hasDiscount = false
      }

      if (!hasDiscount) {
        discountPrice = null
        discountPercentage = null
      }

      const totalPrice = hasDiscount && discountPrice !== null ? discountPrice + taxes + fees : basePrice + taxes + fees

      updateData.pricing = existingPricing
        ? {
            update: {
              basePrice,
              taxes,
              fees,
              totalPrice,
              hasDiscount,
              discountPrice,
              discountPercentage
            }
          }
        : {
            create: {
              basePrice,
              taxes,
              fees,
              totalPrice,
              currency: 'EGP',
              hasDiscount,
              discountPrice,
              discountPercentage
            }
          }
    }

    // Update vehicle
    const vehicle = await db.vehicle.update({
      where: { id },
      data: updateData,
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        specifications: {
          orderBy: { category: 'asc' }
        },
        pricing: true
      }
    })

    return NextResponse.json(vehicle)
  } catch (error) {
    console.error('Error updating vehicle:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'فشل في تحديث المركبة' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/vehicles/[id] - Delete vehicle
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
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
      userPermissions.includes(PERMISSIONS.DELETE_VEHICLES)
    
    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        testDriveBookings: true,
        serviceBookings: true
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    // Check if vehicle has active bookings
    const hasActiveBookings = vehicle.testDriveBookings.some(booking => 
      ['PENDING', 'CONFIRMED'].includes(booking.status)
    ) || vehicle.serviceBookings.some(booking => 
      ['PENDING', 'CONFIRMED'].includes(booking.status)
    )

    if (hasActiveBookings) {
      return NextResponse.json(
        { error: 'لا يمكن حذف المركبة بسبب وجود حجوزات نشطة' },
        { status: 400 }
      )
    }

    // Delete vehicle images first
    await db.vehicleImage.deleteMany({
      where: { vehicleId: id }
    })

    // Delete vehicle
    await db.vehicle.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'تم حذف المركبة بنجاح' })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json(
      { error: 'فشل في حذف المركبة' },
      { status: 500 }
    )
  }
}