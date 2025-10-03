import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

interface RouteParams {
  params: Promise<{ id: string }>
}

export async function POST(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const { id: vehicleId } = await params
    const body = await request.json()
    
    const { imageUrl, altText, isPrimary = false, order = 0 } = body

    if (!imageUrl) {
      return NextResponse.json(
        { error: 'رابط الصورة مطلوب' },
        { status: 400 }
      )
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    // If this is set as primary, unset other primary images
    if (isPrimary) {
      await db.vehicleImage.updateMany({
        where: { 
          vehicleId,
          isPrimary: true 
        },
        data: { 
          isPrimary: false 
        }
      })
    }

    // Create new vehicle image
    const vehicleImage = await db.vehicleImage.create({
      data: {
        vehicleId,
        imageUrl,
        altText: altText || `${vehicle.make} ${vehicle.model} - صورة ${order + 1}`,
        isPrimary,
        order
      }
    })

    return NextResponse.json({
      success: true,
      image: vehicleImage
    })

  } catch (error) {
    console.error('Error adding vehicle image:', error)
    return NextResponse.json(
      { error: 'فشل في إضافة الصورة' },
      { status: 500 }
    )
  }
}