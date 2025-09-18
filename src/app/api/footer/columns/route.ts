import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
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
          content: '+20 2 1234 5678\ninfo@alhamdcars.com\nالقاهرة، مصر', 
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

    // Delete all existing columns
    await db.footerColumn.deleteMany()

    // Create new columns
    const newColumns = await db.footerColumn.createMany({
      data: data.map((column: any) => ({
        title: column.title,
        content: column.content,
        order: column.order,
        isVisible: column.isVisible,
        type: column.type
      }))
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