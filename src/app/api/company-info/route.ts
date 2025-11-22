interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { authorize, UserRole } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { normalizeBrandingObject } from '@/lib/branding'

export const revalidate = 0
export const dynamic = 'force-dynamic'
export const fetchCache = 'force-no-store'

const normalizeArrayField = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }

  if (typeof value === 'string') {
    return value
      .split('\n')
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const normalizeButtons = (value: unknown) => {
  if (Array.isArray(value)) {
    return value.filter(
      (item): item is { text: string; link: string; variant?: string } =>
        typeof item === 'object' && item !== null && 'text' in item && 'link' in item
    )
  }

  return []
}

export async function GET() {
  try {
    // Get company info from database
    const companyInfo = await db.companyInfo.findFirst({
      where: { isActive: true },
      orderBy: { updatedAt: 'desc' }
    })

    if (!companyInfo) {
      // Return default company info if none exists
      return NextResponse.json(normalizeBrandingObject({
        id: 'default',
        title: 'مرحباً بك في الحمد للسيارات',
        subtitle: 'الموزع المعتمد لسيارات تاتا في مدن القناة',
        description: 'نحن فخورون بخدمة مدن القناة كموزع معتمد لسيارات تاتا، حيث نقدم أحدث الموديلات مع ضمان الجودة الأصلي وخدمات ما بعد البيع المتميزة.',
        imageUrl: '/uploads/showroom-luxury.jpg',
        features: [
          'أحدث موديلات تاتا 2024',
          'ضمان المصنع لمدة 3 سنوات',
          'خدمة صيانة على مدار الساعة',
          'تمويل سيارات بأفضل الأسعار'
        ],
        ctaButtons: [
          { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
          { text: 'قيادة تجريبية', link: '/test-drive', variant: 'secondary' }
        ],
        isActive: true
      }), {
        status: 200,
        headers: { 'Cache-Control': 'no-store' }
      })
    }

    return NextResponse.json(
      normalizeBrandingObject({
        ...companyInfo,
        features: normalizeArrayField(companyInfo.features),
        ctaButtons: normalizeButtons(companyInfo.ctaButtons)
      }),
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching company info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company info' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authorize(request, {
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN]
    })

    if ('error' in auth) {
      return auth.error
    }

    const data = await request.json()

    const sanitizedData = {
      title: typeof data.title === 'string' ? data.title : undefined,
      subtitle: typeof data.subtitle === 'string' ? data.subtitle : undefined,
      description: typeof data.description === 'string' ? data.description : undefined,
      imageUrl: typeof data.imageUrl === 'string' ? data.imageUrl : undefined,
      features: normalizeArrayField(data.features),
      ctaButtons: normalizeButtons(data.ctaButtons),
      isActive: 'isActive' in data ? Boolean(data.isActive) : true
    }

    // Update or create company info
    const existingInfo = await db.companyInfo.findFirst()

    if (existingInfo) {
      const updatedInfo = await db.companyInfo.update({
        where: { id: existingInfo.id },
        data: sanitizedData
      })
      return NextResponse.json(
        normalizeBrandingObject({
          ...updatedInfo,
          features: normalizeArrayField(updatedInfo.features),
          ctaButtons: normalizeButtons(updatedInfo.ctaButtons)
        }),
        { headers: { 'Cache-Control': 'no-store' } }
      )
    } else {
      const newInfo = await db.companyInfo.create({
        data: sanitizedData
      })
      return NextResponse.json(
        normalizeBrandingObject({
          ...newInfo,
          features: normalizeArrayField(newInfo.features),
          ctaButtons: normalizeButtons(newInfo.ctaButtons)
        }),
        { headers: { 'Cache-Control': 'no-store' } }
      )
    }
  } catch (error) {
    console.error('Error updating company info:', error)
    if (error instanceof Error && error.message.includes('Access denied')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    return NextResponse.json(
      { error: 'Failed to update company info' },
      { status: 500 }
    )
  }
}