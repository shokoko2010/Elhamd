interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
const imageSchema = z.object({
  imageUrl: z.string().url('رابط الصورة غير صالح'),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false)
})

const updateImageOrderSchema = z.object({
  images: z.array(z.object({
    id: z.string(),
    order: z.number().int().min(0)
  }))
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/admin/vehicles/[id]/images - Get vehicle images
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    const images = await db.vehicleImage.findMany({
      where: { vehicleId: id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(images)
  } catch (error) {
    console.error('Error fetching vehicle images:', error)
    return NextResponse.json(
      { error: 'فشل في جلب صور المركبة' },
      { status: 500 }
    )
  }
}

// POST /api/admin/vehicles/[id]/images - Add new image
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
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
    const validatedData = imageSchema.parse(body)

    // Get current image count for ordering
    const imageCount = await db.vehicleImage.count({
      where: { vehicleId: id }
    })

    // If this is the first image or marked as primary, update other images
    if (validatedData.isPrimary || imageCount === 0) {
      await db.vehicleImage.updateMany({
        where: { vehicleId: id },
        data: { isPrimary: false }
      })
      validatedData.isPrimary = true
    }

    // Create image
    const image = await db.vehicleImage.create({
      data: {
        ...validatedData,
        vehicleId: id,
        order: imageCount,
        thumbnailUrl: validatedData.imageUrl // In real app, generate thumbnail
      }
    })

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle image:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'فشل في إضافة الصورة' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/vehicles/[id]/images - Update image order
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = updateImageOrderSchema.parse(body)

    // Update image orders
    await Promise.all(
      validatedData.images.map(img =>
        db.vehicleImage.update({
          where: { id: img.id },
          data: { order: img.order }
        })
      )
    )

    return NextResponse.json({ message: 'تم تحديث ترتيب الصور بنجاح' })
  } catch (error) {
    console.error('Error updating image order:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'فشل في تحديث ترتيب الصور' },
      { status: 500 }
    )
  }
}