import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

// DELETE /api/admin/tata-vehicles/[id]/images/[imageId] - Delete specific image
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = user.role === 'SUPER_ADMIN' || 
                         user.role === 'ADMIN' || 
                         user.role === 'BRANCH_MANAGER' ||
                         user.customPermissions?.VEHICLE_MANAGEMENT?.['vehicles.images.delete']

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

    // Check if image exists and belongs to this vehicle
    const image = await db.vehicleImage.findFirst({
      where: {
        id: params.imageId,
        vehicleId: params.id
      }
    })

    if (!image) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    // Check if this is the only image
    const imageCount = await db.vehicleImage.count({
      where: { vehicleId: params.id }
    })

    if (imageCount === 1) {
      return NextResponse.json({ 
        error: 'Cannot delete the only image. Add another image first.' 
      }, { status: 400 })
    }

    // If this is the primary image, set another image as primary
    if (image.isPrimary) {
      const nextImage = await db.vehicleImage.findFirst({
        where: {
          vehicleId: params.id,
          id: { not: params.imageId }
        },
        orderBy: { order: 'asc' }
      })

      if (nextImage) {
        await db.vehicleImage.update({
          where: { id: nextImage.id },
          data: { isPrimary: true }
        })
      }
    }

    // Delete the image
    await db.vehicleImage.delete({
      where: { id: params.imageId }
    })

    // Reorder remaining images
    const remainingImages = await db.vehicleImage.findMany({
      where: { vehicleId: params.id },
      orderBy: { order: 'asc' }
    })

    await db.$transaction(async (tx) => {
      for (let i = 0; i < remainingImages.length; i++) {
        await tx.vehicleImage.update({
          where: { id: remainingImages[i].id },
          data: { order: i + 1 }
        })
      }
    })

    return NextResponse.json({ message: 'Image deleted successfully' })

  } catch (error) {
    console.error('Error deleting vehicle image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/tata-vehicles/[id]/images/[imageId] - Update specific image
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string; imageId: string } }
) {
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

    // Check if image exists and belongs to this vehicle
    const existingImage = await db.vehicleImage.findFirst({
      where: {
        id: params.imageId,
        vehicleId: params.id
      }
    })

    if (!existingImage) {
      return NextResponse.json({ error: 'Image not found' }, { status: 404 })
    }

    const body = await request.json()
    const { imageUrl, altText, isPrimary } = body

    const updateData: any = {}
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl
    if (altText !== undefined) updateData.altText = altText
    if (isPrimary !== undefined) {
      // If setting as primary, unset all other primary images
      if (isPrimary) {
        await db.vehicleImage.updateMany({
          where: { 
            vehicleId: params.id,
            id: { not: params.imageId }
          },
          data: { isPrimary: false }
        })
      }
      updateData.isPrimary = isPrimary
    }

    const updatedImage = await db.vehicleImage.update({
      where: { id: params.imageId },
      data: updateData
    })

    return NextResponse.json({ image: updatedImage })

  } catch (error) {
    console.error('Error updating vehicle image:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}