interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorize, UserRole } from '@/lib/auth-server'

// GET single slider (public)
export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    const slider = await db.slider.findUnique({
      where: { id }
    })

    if (!slider) {
      return NextResponse.json(
        { error: 'السلايدر غير موجود' },
        { status: 404 }
      )
    }

    return NextResponse.json({ slider })
  } catch (error) {
    console.error('Error fetching slider:', error)
    return NextResponse.json(
      { error: 'فشل في جلب السلايدر' },
      { status: 500 }
    )
  }
}

// PUT update slider
export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    // Check authentication and authorization
    await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })

    const body = await request.json()
    const {
      title,
      subtitle,
      description,
      imageUrl,
      ctaText,
      ctaLink,
      badge,
      badgeColor,
      order,
      isActive
    } = body

    // Check if slider exists
    const existingSlider = await db.slider.findUnique({
      where: { id }
    })

    if (!existingSlider) {
      return NextResponse.json(
        { error: 'السلايدر غير موجود' },
        { status: 404 }
      )
    }

    // Update slider
    const slider = await db.slider.update({
      where: { id },
      data: {
        ...(title && { title }),
        ...(subtitle !== undefined && { subtitle: subtitle || null }),
        ...(description !== undefined && { description: description || null }),
        ...(imageUrl && { imageUrl }),
        ...(ctaText !== undefined && { ctaText: ctaText || null }),
        ...(ctaLink !== undefined && { ctaLink: ctaLink || null }),
        ...(badge !== undefined && { badge: badge || null }),
        ...(badgeColor !== undefined && { badgeColor: badgeColor || 'bg-blue-500' }),
        ...(order !== undefined && { order }),
        ...(isActive !== undefined && { isActive })
      }
    })

    return NextResponse.json({ slider })
  } catch (error) {
    console.error('Error updating slider:', error)
    if (error.message.includes('Access denied') || error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'فشل في تحديث السلايدر' },
      { status: 500 }
    )
  }
}

// DELETE slider
export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const { id } = await context.params
    // Check authentication and authorization
    await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })

    // Check if slider exists
    const existingSlider = await db.slider.findUnique({
      where: { id }
    })

    if (!existingSlider) {
      return NextResponse.json(
        { error: 'السلايدر غير موجود' },
        { status: 404 }
      )
    }

    // Delete slider
    await db.slider.delete({
      where: { id }
    })

    // Reorder remaining sliders
    const remainingSliders = await db.slider.findMany({
      orderBy: { order: 'asc' }
    })

    for (let i = 0; i < remainingSliders.length; i++) {
      await db.slider.update({
        where: { id: remainingSliders[i].id },
        data: { order: i }
      })
    }

    return NextResponse.json({ message: 'تم حذف السلايدر بنجاح' })
  } catch (error) {
    console.error('Error deleting slider:', error)
    if (error.message.includes('Access denied') || error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'فشل في حذف السلايدر' },
      { status: 500 }
    )
  }
}