interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireAnyRole } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await requireAnyRole([UserRole.ADMIN, UserRole.SUPER_ADMIN])

    const body = await request.json()
    const { sliderIds } = body

    if (!Array.isArray(sliderIds) || sliderIds.length === 0) {
      return NextResponse.json(
        { error: 'قائمة السلايدرات غير صالحة' },
        { status: 400 }
      )
    }

    // Update order for each slider
    for (let i = 0; i < sliderIds.length; i++) {
      await db.slider.update({
        where: { id: sliderIds[i] },
        data: { order: i }
      })
    }

    return NextResponse.json({ message: 'تم إعادة ترتيب السلايدرات بنجاح' })
  } catch (error) {
    console.error('Error reordering sliders:', error)
    if (error.message.includes('Access denied') || error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'فشل في إعادة ترتيب السلايدرات' },
      { status: 500 }
    )
  }
}