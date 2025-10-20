interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get footer columns from database
    const footerColumns = await db.footerColumn.findMany({
      orderBy: { order: 'asc' }
    })
    
    if (footerColumns.length === 0) {
      // Return default columns if none exist
      return NextResponse.json([
        { 
          id: '1', 
          title: 'روابط سريعة', 
          content: 'الرئيسية\nالسيارات\nالخدمات\nمن نحن\nاتصل بنا', 
          order: 1, 
          isVisible: true,
          type: 'links'
        },
        { 
          id: '2', 
          title: 'خدماتنا', 
          content: 'بيع السيارات\nقيادة تجريبية\nحجز الخدمة\nالتمويل\nالصيانة', 
          order: 2, 
          isVisible: true,
          type: 'links'
        },
        { 
          id: '3', 
          title: 'معلومات التواصل', 
          content: '+20 2 1234 5678\ninfo@elhamdimport.com\nالقاهرة، مصر', 
          order: 3, 
          isVisible: true,
          type: 'contact'
        },
        { 
          id: '4', 
          title: 'تابعنا', 
          content: 'فيسبوك\nتويتر\nانستغرام\nلينكدإن', 
          order: 4, 
          isVisible: true,
          type: 'social'
        },
        { 
          id: '5', 
          title: 'سياسة الخصوصية', 
          content: 'سياسة الخصوصية\nالشروط والأحكام\nالأسئلة الشائعة\nخريطة الموقع', 
          order: 5, 
          isVisible: true,
          type: 'links'
        },
        { 
          id: '6', 
          title: 'الدعم الفني', 
          content: 'الدعم الفني\nالضمان\nالصيانة\nقطع الغيار', 
          order: 6, 
          isVisible: true,
          type: 'links'
        }
      ])
    }

    return NextResponse.json(footerColumns)
  } catch (error) {
    console.error('Error fetching footer columns:', error)
    return NextResponse.json(
      { error: 'Failed to fetch footer columns' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('=== DEBUG: Footer Columns PUT API Called ===')
    
    const user = await getAuthUser()
    if (!user) {
      console.log('No authenticated user found')
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    console.log('User authenticated:', user.email, 'Role:', user.role)
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN

    if (!hasAccess) {
      console.log('User does not have required role')
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    const data = await request.json()
    console.log('Footer columns data received:', JSON.stringify(data, null, 2))

    // Delete all existing columns
    console.log('Deleting existing footer columns...')
    await db.footerColumn.deleteMany()

    // Create new columns
    console.log('Creating new footer columns...')
    const newColumns = await db.footerColumn.createMany({
      data: data.map((column: any) => ({
        title: column.title,
        content: column.content,
        order: column.order,
        isVisible: column.isVisible,
        type: column.type
      }))
    })

    console.log('Footer columns created successfully')

    // Return the created columns
    const createdColumns = await db.footerColumn.findMany({
      orderBy: { order: 'asc' }
    })

    console.log('Retrieved created columns:', createdColumns.length)

    return NextResponse.json(createdColumns)
  } catch (error) {
    console.error('Error updating footer columns:', error)
    return NextResponse.json(
      { error: 'Failed to update footer columns' },
      { status: 500 }
    )
  }
}