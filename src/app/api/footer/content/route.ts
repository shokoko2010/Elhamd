interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { authorize, UserRole } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { normalizeBrandingObject } from '@/lib/branding'

const ALLOWED_FIELDS = [
  'logoUrl',
  'logoText',
  'tagline',
  'primaryPhone',
  'secondaryPhone',
  'primaryEmail',
  'secondaryEmail',
  'address',
  'workingHours',
  'copyrightText',
  'newsletterText',
  'backToTopText'
] as const

type FooterContentPayload = Partial<Record<(typeof ALLOWED_FIELDS)[number], string | null>>

import { stripLargeData } from '@/services/home-data'

export async function GET() {
  try {
    // Get footer content from database
    const footerContent = await db.footerContent.findFirst()

    if (!footerContent) {
      // Return default content if none exists
      return NextResponse.json(normalizeBrandingObject({
        logoText: 'الحمد للسيارات',
        tagline: 'الموزع المعتمد لتاتا موتورز في مدن القناة',
        primaryPhone: '+20 2 1234 5678',
        primaryEmail: 'info@elhamdimport.com',
        address: 'القاهرة، مصر',
        workingHours: 'السبت - الخميس: 9 صباحاً - 8 مساءً، الجمعة: 2 مساءً - 8 مساءً',
        copyrightText: '© 2024 الحمد للسيارات. جميع الحقوق محفوظة.',
        newsletterText: 'اشترك في نشرتنا الإخبارية للحصول على آخر التحديثات والعروض.',
        backToTopText: 'العودة للأعلى'
      }))
    }

    return NextResponse.json(normalizeBrandingObject({
      ...footerContent,
      logoUrl: stripLargeData(footerContent.logoUrl, 'logo', footerContent.id)
    }))
  } catch (error) {
    console.error('Error fetching footer content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch footer content' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })

    if (auth.error) {
      return auth.error
    }

    const payload = (await request.json()) as Record<string, any>

    const sanitized: FooterContentPayload = Object.fromEntries(
      ALLOWED_FIELDS.map((field) => {
        const value = payload[field]

        if (value === undefined) return [field, null]
        if (value === null) return [field, null]

        return [field, typeof value === 'string' ? value : String(value)]
      }),
    ) as FooterContentPayload

    const normalizedData = normalizeBrandingObject(sanitized)
    const existing = await db.footerContent.findFirst()
    const contentId = existing?.id ?? 'footer-default'

    const result = await db.footerContent.upsert({
      create: { id: contentId, ...normalizedData },
      update: normalizedData,
      where: { id: contentId }
    })

    return NextResponse.json(normalizeBrandingObject(result))
  } catch (error) {
    console.error('Error updating footer content:', error)
    return NextResponse.json(
      { error: 'Failed to update footer content' },
      { status: 500 }
    )
  }
}