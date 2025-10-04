interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { authorize, UserRole } from '@/lib/unified-auth'
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
    console.log('Footer columns PUT - Starting request')
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER] })
    console.log('Footer columns PUT - Auth successful for user:', auth.email, 'role:', auth.role)

    const data = await request.json()
    console.log('Footer columns PUT - Received data:', JSON.stringify(data, null, 2))

    // Validate and map types to match enum values
    const validTypes = ['LINKS', 'TEXT', 'CONTACT', 'SOCIAL']
    const validatedData = data.map((column: any) => {
      let type = column.type || 'LINKS'
      // Convert lowercase/types to uppercase enum values
      if (type === 'links') type = 'LINKS'
      else if (type === 'social') type = 'SOCIAL'
      else if (type === 'contact') type = 'CONTACT'
      else if (type === 'text') type = 'TEXT'
      
      if (!validTypes.includes(type)) {
        throw new Error(`Invalid footer column type: ${type}. Valid types: ${validTypes.join(', ')}`)
      }
      
      return {
        title: column.title,
        content: column.content,
        order: column.order,
        isVisible: column.isVisible,
        type
      }
    })
    console.log('Footer columns PUT - Validated data:', JSON.stringify(validatedData, null, 2))

    // Delete all existing columns
    console.log('Footer columns PUT - Deleting existing columns')
    await db.footerColumn.deleteMany()
    console.log('Footer columns PUT - Existing columns deleted')

    // Create new columns
    console.log('Footer columns PUT - Creating new columns')
    const newColumns = await db.footerColumn.createMany({
      data: validatedData
    })
    console.log('Footer columns PUT - New columns created:', newColumns)

    // Return the created columns
    const createdColumns = await db.footerColumn.findMany({
      orderBy: { order: 'asc' }
    })
    console.log('Footer columns PUT - Retrieved created columns:', createdColumns.length)

    return NextResponse.json(createdColumns)
  } catch (error) {
    console.error('Error updating footer columns:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json(
      { error: 'Failed to update footer columns', details: error.message },
      { status: 500 }
    )
  }
}