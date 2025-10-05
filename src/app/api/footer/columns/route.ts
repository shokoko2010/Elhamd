interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { authorize, UserRole } from '@/lib/unified-auth'
import { db } from '@/lib/db'
import { FooterColumnType } from '@prisma/client'

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
          type: 'LINKS'
        },
        { 
          id: '2', 
          title: 'خدماتنا', 
          content: 'بيع السيارات\nقيادة تجريبية\nحجز الخدمة\nالتمويل\nالصيانة', 
          order: 2, 
          isVisible: true,
          type: 'LINKS'
        },
        { 
          id: '3', 
          title: 'معلومات التواصل', 
          content: '+20 2 1234 5678\ninfo@alhamdcars.com\nالقاهرة، مصر', 
          order: 3, 
          isVisible: true,
          type: 'CONTACT'
        },
        { 
          id: '4', 
          title: 'تابعنا', 
          content: 'فيسبوك\nتويتر\nانستغرام\nلينكدإن', 
          order: 4, 
          isVisible: true,
          type: 'SOCIAL'
        },
        { 
          id: '5', 
          title: 'سياسة الخصوصية', 
          content: 'سياسة الخصوصية\nالشروط والأحكام\nالأسئلة الشائعة\nخريطة الموقع', 
          order: 5, 
          isVisible: true,
          type: 'LINKS'
        },
        { 
          id: '6', 
          title: 'الدعم الفني', 
          content: 'الدعم الفني\nالضمان\nالصيانة\nقطع الغيار', 
          order: 6, 
          isVisible: true,
          type: 'LINKS'
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
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })

    const data = await request.json()

    // Delete all existing columns
    await db.footerColumn.deleteMany()

    // Create new columns with proper enum mapping
    const newColumns = await db.footerColumn.createMany({
      data: data.map((column: any) => {
        // Map string type to enum value
        let typeEnum: FooterColumnType
        switch (column.type?.toUpperCase()) {
          case 'LINKS':
            typeEnum = FooterColumnType.LINKS
            break
          case 'TEXT':
            typeEnum = FooterColumnType.TEXT
            break
          case 'CONTACT':
            typeEnum = FooterColumnType.CONTACT
            break
          case 'SOCIAL':
            typeEnum = FooterColumnType.SOCIAL
            break
          default:
            typeEnum = FooterColumnType.LINKS // Default fallback
        }

        return {
          title: column.title,
          content: column.content,
          order: column.order,
          isVisible: column.isVisible,
          type: typeEnum
        }
      })
    })

    // Return the created columns
    const createdColumns = await db.footerColumn.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(createdColumns)
  } catch (error) {
    console.error('Error updating footer columns:', error)
    return NextResponse.json(
      { error: 'Failed to update footer columns' },
      { status: 500 }
    )
  }
}