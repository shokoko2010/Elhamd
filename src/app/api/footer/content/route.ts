interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { authorize, UserRole } from '@/lib/unified-auth'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get footer content from database
    const footerContent = await db.footerContent.findFirst()
    
    if (!footerContent) {
      // Return default content if none exists
      return NextResponse.json({
        logoText: 'الحمد للسيارات',
        tagline: 'وكيل تاتا المعتمد في مصر',
        primaryPhone: '+20 2 1234 5678',
        primaryEmail: 'info@elhamdimport.com',
        address: 'القاهرة، مصر',
        workingHours: 'السبت - الخميس: 9 صباحاً - 8 مساءً، الجمعة: 2 مساءً - 8 مساءً',
        copyrightText: '© 2024 الحمد للسيارات. جميع الحقوق محفوظة.',
        newsletterText: 'اشترك في نشرتنا الإخبارية للحصول على آخر التحديثات والعروض.',
        backToTopText: 'العودة للأعلى'
      })
    }

    return NextResponse.json(footerContent)
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
    
    const data = await request.json()

    // Update or create footer content
    const existingContent = await db.footerContent.findFirst()
    
    if (existingContent) {
      const updatedContent = await db.footerContent.update({
        where: { id: existingContent.id },
        data
      })
      return NextResponse.json(updatedContent)
    } else {
      const newContent = await db.footerContent.create({
        data
      })
      return NextResponse.json(newContent)
    }
  } catch (error) {
    console.error('Error updating footer content:', error)
    return NextResponse.json(
      { error: 'Failed to update footer content' },
      { status: 500 }
    )
  }
}