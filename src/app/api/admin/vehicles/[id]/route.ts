interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions, getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db'
import { UserRole, VehicleStatus, VehicleCategory, FuelType, TransmissionType } from '@prisma/client'
import { z } from 'zod'

// Validation schema for updates
const updateVehicleSchema = z.object({
  make: z.string().min(1, 'الماركة مطلوبة').optional(),
  model: z.string().min(1, 'الموديل مطلوب').optional(),
  year: z.number().int().min(1900).max(new Date().getFullYear() + 1).optional(),
  price: z.number().positive('السعر يجب أن يكون موجباً').optional(),
  stockNumber: z.string().min(1, 'رقم المخزون مطلوب').optional(),
  vin: z.string().optional(),
  description: z.string().optional(),
  category: z.nativeEnum(VehicleCategory).optional(),
  fuelType: z.nativeEnum(FuelType).optional(),
  transmission: z.nativeEnum(TransmissionType).optional(),
  mileage: z.number().min(0).optional(),
  color: z.string().optional(),
  status: z.nativeEnum(VehicleStatus).optional(),
  featured: z.boolean().optional(),
  isActive: z.boolean().optional()
})

// GET /api/admin/vehicles/[id] - Get single vehicle
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !(['ADMIN', 'SUPER_ADMIN', 'STAFF', 'BRANCH_MANAGER'] as const).includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    const vehicle = await db.vehicle.findUnique({
      where: { id }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    // Get related data separately
    const [images, specifications, pricing, testDriveBookings, serviceBookings] = await Promise.all([
      db.vehicleImage.findMany({
        where: { vehicleId: id },
        orderBy: { order: 'asc' }
      }),
      db.vehicleSpecification.findMany({
        where: { vehicleId: id },
        orderBy: { category: 'asc' }
      }),
      db.vehiclePricing.findUnique({
        where: { vehicleId: id }
      }),
      db.testDriveBooking.findMany({
        where: { vehicleId: id },
        select: { id: true, date: true, timeSlot: true, status: true }
      }),
      db.serviceBooking.findMany({
        where: { vehicleId: id },
        select: { id: true, date: true, timeSlot: true, status: true }
      })
    ])

    return NextResponse.json({
      ...vehicle,
      images,
      specifications,
      pricing,
      testDriveBookings,
      serviceBookings
    })
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
    if (!user || !(['ADMIN', 'SUPER_ADMIN', 'STAFF', 'BRANCH_MANAGER'] as const).includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if vehicle exists
    const existingVehicle = await db.vehicle.findUnique({
      where: { id }
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

    // Check if stock number already exists (if being updated)
    if (validatedData.stockNumber && validatedData.stockNumber !== existingVehicle.stockNumber) {
      const stockNumberExists = await db.vehicle.findUnique({
        where: { stockNumber: validatedData.stockNumber }
      })
      
      if (stockNumberExists) {
        return NextResponse.json(
          { error: 'رقم المخزون مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // Check if VIN already exists (if being updated)
    if (validatedData.vin && validatedData.vin !== existingVehicle.vin) {
      const vinExists = await db.vehicle.findUnique({
        where: { vin: validatedData.vin }
      })
      
      if (vinExists) {
        return NextResponse.json(
          { error: 'رقم الهيكل (VIN) مستخدم بالفعل' },
          { status: 400 }
        )
      }
    }

    // Update vehicle
    const vehicle = await db.vehicle.update({
      where: { id },
      data: validatedData
    })

    // Get related data separately
    const [images, specifications, pricing] = await Promise.all([
      db.vehicleImage.findMany({
        where: { vehicleId: id },
        orderBy: { order: 'asc' }
      }),
      db.vehicleSpecification.findMany({
        where: { vehicleId: id },
        orderBy: { category: 'asc' }
      }),
      db.vehiclePricing.findUnique({
        where: { vehicleId: id }
      })
    ])

    return NextResponse.json({
      ...vehicle,
      images,
      specifications,
      pricing
    })
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
    if (!user || !(['ADMIN', 'BRANCH_MANAGER'] as const).includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    // Check if vehicle has active bookings
    const [testDriveBookings, serviceBookings] = await Promise.all([
      db.testDriveBooking.findMany({
        where: { vehicleId: id }
      }),
      db.serviceBooking.findMany({
        where: { vehicleId: id }
      })
    ])

    const hasActiveBookings = testDriveBookings.some(booking => 
      ['PENDING', 'CONFIRMED'].includes(booking.status)
    ) || serviceBookings.some(booking => 
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