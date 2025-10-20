interface RouteParams {
  params: Promise<{ id: string; imageId: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'

// PUT /api/admin/vehicles/[id]/images/[imageId]/primary - Set image as primary
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id, imageId } = await context.params
    
    console.log(`Setting image ${imageId} as primary for vehicle ${id}`)
    
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      console.log('Authentication failed:', user?.role)
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id }
    })

    if (!vehicle) {
      console.log('Vehicle not found:', id)
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
      console.log('Image not found:', imageId)
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

    console.log('Successfully set primary image:', updatedImage.id)
    return NextResponse.json(updatedImage)
  } catch (error) {
    console.error('Error setting primary image:', error)
    return NextResponse.json(
      { error: 'فشل في تعيين الصورة كأساسية', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}