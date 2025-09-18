import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
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
        primaryEmail: 'info@alhamdcars.com',
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
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

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