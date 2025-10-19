import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { withSecurity } from '@/lib/api-middleware'
import { z } from 'zod'

// Schema for image creation/update
const imageSchema = z.object({
  imageUrl: z.string().url(),
  altText: z.string().optional(),
  isPrimary: z.boolean().default(false),
  order: z.number().default(0)
})

// GET /api/admin/tata-vehicles/[id]/images - Get vehicle images
export const GET = withSecurity(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = user.role === 'SUPER_ADMIN' || 
                         user.role === 'ADMIN' || 
                         user.role === 'BRANCH_MANAGER' ||
                         user.customPermissions?.VEHICLE_MANAGEMENT?.['vehicles.read'] ||
                         user.customPermissions?.VEHICLE_MANAGEMENT?.['vehicles.images.read']

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if vehicle exists and is a Tata vehicle
    const vehicle = await db.vehicle.findFirst({
      where: {
        id: params.id,
        make: 'Tata Motors'
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const images = await db.vehicleImage.findMany({
      where: { vehicleId: params.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ images })

  } catch (error) {
    console.error('Error fetching vehicle images:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, {
  rateLimitKey: 'tata-vehicles-api'
})

// POST /api/admin/tata-vehicles/[id]/images - Add new image
export const POST = withSecurity(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = user.role === 'SUPER_ADMIN' || 
                         user.role === 'ADMIN' || 
                         user.role === 'BRANCH_MANAGER' ||
                         user.customPermissions?.VEHICLE_MANAGEMENT?.['vehicles.images.create']

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if vehicle exists and is a Tata vehicle
    const vehicle = await db.vehicle.findFirst({
      where: {
        id: params.id,
        make: 'Tata Motors'
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = imageSchema.parse(body)

    // If this is set as primary, unset all other primary images
    if (validatedData.isPrimary) {
      await db.vehicleImage.updateMany({
        where: { vehicleId: params.id },
        data: { isPrimary: false }
      })
    }

    // Get the next order number if not provided
    let order = validatedData.order
    if (order === 0) {
      const lastImage = await db.vehicleImage.findFirst({
        where: { vehicleId: params.id },
        orderBy: { order: 'desc' }
      })
      order = (lastImage?.order || 0) + 1
    }

    const image = await db.vehicleImage.create({
      data: {
        vehicleId: params.id,
        imageUrl: validatedData.imageUrl,
        altText: validatedData.altText || `${vehicle.model} - Image`,
        isPrimary: validatedData.isPrimary,
        order
      }
    })

    return NextResponse.json({ image }, { status: 201 })

  } catch (error) {
    console.error('Error creating vehicle image:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, {
  rateLimitKey: 'tata-vehicles-api'
})

// PUT /api/admin/tata-vehicles/[id]/images - Reorder images
export const PUT = withSecurity(async (
  request: NextRequest,
  { params }: { params: { id: string } }
) => {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = user.role === 'SUPER_ADMIN' || 
                         user.role === 'ADMIN' || 
                         user.role === 'BRANCH_MANAGER' ||
                         user.customPermissions?.VEHICLE_MANAGEMENT?.['vehicles.images.update']

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if vehicle exists and is a Tata vehicle
    const vehicle = await db.vehicle.findFirst({
      where: {
        id: params.id,
        make: 'Tata Motors'
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const body = await request.json()
    const { images } = body

    if (!Array.isArray(images)) {
      return NextResponse.json({ error: 'Invalid data: images must be an array' }, { status: 400 })
    }

    // Update images in a transaction
    await db.$transaction(async (tx) => {
      for (const imageData of images) {
        if (!imageData.id || typeof imageData.order !== 'number') {
          throw new Error('Invalid image data')
        }

        await tx.vehicleImage.update({
          where: { 
            id: imageData.id,
            vehicleId: params.id 
          },
          data: { 
            order: imageData.order,
            isPrimary: imageData.isPrimary || false
          }
        })
      }

      // Ensure only one primary image
      const primaryImages = images.filter(img => img.isPrimary)
      if (primaryImages.length > 1) {
        // Keep only the first one as primary
        const firstPrimary = primaryImages[0]
        await tx.vehicleImage.updateMany({
          where: { 
            vehicleId: params.id,
            id: { not: firstPrimary.id }
          },
          data: { isPrimary: false }
        })
      } else if (primaryImages.length === 0) {
        // If no primary image, set the first one as primary
        const firstImage = images[0]
        if (firstImage) {
          await tx.vehicleImage.update({
            where: { id: firstImage.id },
            data: { isPrimary: true }
          })
        }
      }
    })

    // Fetch updated images
    const updatedImages = await db.vehicleImage.findMany({
      where: { vehicleId: params.id },
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ images: updatedImages })

  } catch (error) {
    console.error('Error reordering vehicle images:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}, {
  rateLimitKey: 'tata-vehicles-api'
})