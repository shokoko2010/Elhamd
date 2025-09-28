import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'

interface RouteParams {
  params: {
    id: string
    imageId: string
  }
}

// PUT /api/admin/vehicles/[id]/images/[imageId]/primary - Set image as primary
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id: params.id }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    // Check if image exists
    const image = await db.vehicleImage.findUnique({
      where: { id: params.imageId }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'الصورة غير موجودة' },
        { status: 404 }
      )
    }

    // Set all other images to non-primary
    await db.vehicleImage.updateMany({
      where: { vehicleId: params.id },
      data: { isPrimary: false }
    })

    // Set this image as primary
    const updatedImage = await db.vehicleImage.update({
      where: { id: params.imageId },
      data: { isPrimary: true }
    })

    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error('Error setting primary image:', error)
    return NextResponse.json(
      { error: 'فشل في تعيين الصورة كأساسية' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/vehicles/[id]/images/[imageId] - Delete image
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id: params.id }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    // Check if image exists
    const image = await db.vehicleImage.findUnique({
      where: { id: params.imageId }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'الصورة غير موجودة' },
        { status: 404 }
      )
    }

    // If this is the primary image, check if there are other images
    if (image.isPrimary) {
      const remainingImages = await db.vehicleImage.findMany({
        where: { 
          vehicleId: params.id,
          id: { not: params.imageId }
        }
      })

      if (remainingImages.length > 0) {
        // Set the first remaining image as primary
        await db.vehicleImage.update({
          where: { id: remainingImages[0].id },
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

    await Promise.all(
      remainingImages.map((img, index) =>
        db.vehicleImage.update({
          where: { id: img.id },
          data: { order: index }
        })
      )
    )

    return NextResponse.json({ message: 'تم حذف الصورة بنجاح' })
  } catch (error) {
    console.error('Error deleting vehicle image:', error)
    return NextResponse.json(
      { error: 'فشل في حذف الصورة' },
      { status: 500 }
    )
  }
}