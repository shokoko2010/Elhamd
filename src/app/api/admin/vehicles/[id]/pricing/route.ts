interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUnifiedUser, requireUnifiedAuth } from '@/lib/unified-auth'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
const pricingSchema = z.object({
  basePrice: z.number().positive('السعر الأساسي يجب أن يكون موجباً'),
  discountPrice: z.number().optional().nullable(),
  discountPercentage: z.number().min(0).max(100).optional().nullable(),
  taxes: z.number().min(0).default(0),
  fees: z.number().min(0).default(0),
  currency: z.string().default('EGP'),
  hasDiscount: z.boolean().default(false),
  discountExpires: z.string().datetime().optional().nullable()
}).refine(data => {
  if (data.hasDiscount && !data.discountPrice && !data.discountPercentage) {
    return false
  }
  return true
}, {
  message: 'يجب تحديد سعر الخصم أو نسبة الخصم عند تفعيل الخصم'
}).refine(data => {
  if (data.discountPrice && data.discountPrice >= data.basePrice) {
    return false
  }
  return true
}, {
  message: 'سعر الخصم يجب أن يكون أقل من السعر الأساسي'
})

// GET /api/admin/vehicles/[id]/pricing - Get vehicle pricing
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    // Check authentication and authorization
    const user = await getUnifiedUser(request)
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id },
      include: {
        pricing: true
      }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    // If no pricing exists, create default pricing
    if (!vehicle.pricing) {
      const defaultPricing = await db.vehiclePricing.create({
        data: {
          vehicleId: id,
          basePrice: vehicle.price,
          discountPrice: null,
          discountPercentage: null,
          taxes: 0,
          fees: 0,
          totalPrice: vehicle.price,
          currency: 'EGP',
          hasDiscount: false,
          discountExpires: null
        }
      })

      return NextResponse.json(defaultPricing)
    }

    return NextResponse.json(vehicle.pricing)
  } catch (error) {
    console.error('Error fetching vehicle pricing:', error)
    return NextResponse.json(
      { error: 'فشل في جلب تسعير المركبة' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/vehicles/[id]/pricing - Update vehicle pricing
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    // Check authentication and authorization
    const user = await getUnifiedUser(request)
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
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

    const body = await request.json()
    
    // Validate input
    const validatedData = pricingSchema.parse(body)

    // Calculate total price
    let totalPrice = validatedData.basePrice + validatedData.taxes + validatedData.fees
    
    if (validatedData.hasDiscount) {
      if (validatedData.discountPrice) {
        totalPrice = validatedData.discountPrice + validatedData.taxes + validatedData.fees
      } else if (validatedData.discountPercentage) {
        const discountAmount = validatedData.basePrice * (validatedData.discountPercentage / 100)
        totalPrice = (validatedData.basePrice - discountAmount) + validatedData.taxes + validatedData.fees
      }
    }

    // Check if pricing exists
    const existingPricing = await db.vehiclePricing.findUnique({
      where: { vehicleId: id }
    })

    let pricing
    if (existingPricing) {
      // Update existing pricing
      pricing = await db.vehiclePricing.update({
        where: { vehicleId: id },
        data: {
          ...validatedData,
          totalPrice
        }
      })
    } else {
      // Create new pricing
      pricing = await db.vehiclePricing.create({
        data: {
          ...validatedData,
          vehicleId: id,
          totalPrice
        }
      })
    }

    return NextResponse.json(pricing)
  } catch (error) {
    console.error('Error updating vehicle pricing:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'فشل في تحديث تسعير المركبة' },
      { status: 500 }
    )
  }
}