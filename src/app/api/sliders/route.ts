interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorize, UserRole } from '@/lib/auth-server'

const normalizeContentPosition = (position?: string) => {
  switch (position) {
    case 'top-right':
    case 'bottom-right':
    case 'top-center':
    case 'bottom-center':
    case 'top-left':
    case 'bottom-left':
    case 'middle-left':
    case 'middle-center':
    case 'middle-right':
      return position
    case 'left':
      return 'middle-left'
    case 'center':
      return 'middle-center'
    case 'right':
      return 'middle-right'
    case 'top':
      return 'top-center'
    case 'bottom':
      return 'bottom-center'
    default:
      return 'top-right'
  }
}

// GET all sliders (public)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const activeOnly = searchParams.get('activeOnly') === 'true'

    const sliders = await db.slider.findMany({
      where: activeOnly ? { isActive: true } : {},
      orderBy: { order: 'asc' }
    })

    // Remove duplicate sliders based on title and imageUrl
    // Keep the slider with the lowest order value for each unique content
    const uniqueSliders = sliders.reduce((acc, current) => {
      // Create a unique key based on title and imageUrl
      const uniqueKey = `${current.title}-${current.imageUrl}`

      // If we haven't seen this content before, or if the current slider has a lower order
      if (!acc[uniqueKey] || current.order < acc[uniqueKey].order) {
        acc[uniqueKey] = current
      }

      return acc
    }, {} as Record<string, typeof sliders[0]>)

    // Convert back to array and sort by order
    const deduplicatedSliders = Object.values(uniqueSliders).sort((a, b) => a.order - b.order)

    return NextResponse.json({ sliders: deduplicatedSliders })
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
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })
    if ('error' in auth) {
      return auth.error
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
      contentPosition,
      contentSize,
      contentColor,
      contentShadow,
      contentStrokeColor,
      contentStrokeWidth,
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
        contentPosition: normalizeContentPosition(contentPosition),
        contentSize: contentSize || 'lg',
        contentColor: contentColor || '#ffffff',
        contentShadow: contentShadow !== false,
        contentStrokeColor: contentStrokeColor || '#000000',
        contentStrokeWidth:
          typeof contentStrokeWidth === 'number' && contentStrokeWidth >= 0 ? contentStrokeWidth : 0,
        order: finalOrder,
        isActive: isActive !== undefined ? isActive : true
      }
    })

    // Revalidate the homepage cache
    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/', 'page')
    } catch (e) {
      console.error('Error revalidating path:', e)
    }

    return NextResponse.json({ slider }, { status: 201 })
  } catch (error) {
    console.error('Error creating slider:', error)
    if (error.message.includes('Access denied') || error.message.includes('Authentication required')) {
      return NextResponse.json(
        { error: 'غير مصرح لك بالوصول' },
        { status: 401 }
      )
    }
    return NextResponse.json(
      { error: 'فشل في إنشاء السلايدر' },
      { status: 500 }
    )
  }
}