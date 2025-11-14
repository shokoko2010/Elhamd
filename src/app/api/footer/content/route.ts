interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, UserRole } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { normalizeBrandingObject } from '@/lib/branding'

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

    return NextResponse.json(normalizeBrandingObject(footerContent))
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
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN

    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }
    
    const data = await request.json()

    // Update or create footer content
    const existingContent = await db.footerContent.findFirst()
    
    if (existingContent) {
      const updatedContent = await db.footerContent.update({
        where: { id: existingContent.id },
        data
      })
      return NextResponse.json(normalizeBrandingObject(updatedContent))
    } else {
      const newContent = await db.footerContent.create({
        data
      })
      return NextResponse.json(normalizeBrandingObject(newContent))
    }
  } catch (error) {
    console.error('Error updating footer content:', error)
    return NextResponse.json(
      { error: 'Failed to update footer content' },
      { status: 500 }
    )
  }
}