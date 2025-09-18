import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'

// GET all sliders
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const sliders = await db.slider.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: 'asc' }
    })

    return NextResponse.json({ sliders })
  } catch (error) {
    console.error('Error fetching sliders:', error)
    return NextResponse.json(
      { error: 'فشل في جلب السلايدرات' },
      { status: 500 }
    )
  }
}

// POST create new slider
export async function POST(request: NextRequest) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }

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

    // Validate required fields
    if (!title || !imageUrl) {
      return NextResponse.json(
        { error: 'العنوان والصورة مطلوبان' },
        { status: 400 }
      )
    }

    // Get the highest order if not provided
    let finalOrder = order
    if (finalOrder === undefined || finalOrder === null) {
      const lastSlider = await db.slider.findFirst({
        orderBy: { order: 'desc' }
      })
      finalOrder = lastSlider ? lastSlider.order + 1 : 0
    }

    const slider = await db.slider.create({
      data: {
        title,
        subtitle: subtitle || null,
        description: description || null,
        imageUrl,
        ctaText: ctaText || null,
        ctaLink: ctaLink || null,
        badge: badge || null,
        badgeColor: badgeColor || 'bg-blue-500',
        order: finalOrder,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    return NextResponse.json({ slider }, { status: 201 })
  } catch (error) {
    console.error('Error creating slider:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء السلايدر' },
      { status: 500 }
    )
  }
}