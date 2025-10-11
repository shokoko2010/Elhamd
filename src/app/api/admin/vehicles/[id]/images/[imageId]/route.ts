interface RouteParams {
  params: Promise<{ id: string; imageId: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions, getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

// PUT /api/admin/vehicles/[id]/images/[imageId]/primary - Set image as primary
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id, imageId } = await context.params
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !(['ADMIN', 'SUPER_ADMIN', 'STAFF', 'BRANCH_MANAGER'] as const).includes(user.role as any)) {
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

    // Check if image exists
    const image = await db.vehicleImage.findUnique({
      where: { id: imageId }
    })

    if (!image) {
      return NextResponse.json(
        { error: 'الصورة غير موجودة' },
        { status: 404 }
      )
    }

    // Set all other images to non-primary
    await db.vehicleImage.updateMany({
      where: { vehicleId: id },
      data: { isPrimary: false }
    })

    // Set this image as primary
    const updatedImage = await db.vehicleImage.update({
      where: { id: imageId },
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
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id, imageId } = await context.params
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !(['ADMIN', 'SUPER_ADMIN', 'STAFF', 'BRANCH_MANAGER'] as const).includes(user.role as any)) {
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

    // Check if image exists
    const image = await db.vehicleImage.findUnique({
      where: { id: imageId }
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
          vehicleId: id,
          id: { not: imageId }
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
      where: { id: imageId }
    })

    // Reorder remaining images
    const remainingImages = await db.vehicleImage.findMany({
      where: { vehicleId: id },
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