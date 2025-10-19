interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get company values from database
    const companyValues = await db.companyValue.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    
    if (companyValues.length === 0) {
      // Return default company values if none exist
      return NextResponse.json([
        {
          id: '1',
          title: 'الجودة',
          description: 'نلتزم بأعلى معايير الجودة في جميع منتجاتنا وخدماتنا',
          icon: 'Shield',
          order: 0,
          isActive: true
        },
        {
          id: '2',
          title: 'العميل أولاً',
          description: 'نضع رضا العملاء في مقدمة أولوياتنا في كل قرار نتخذه',
          icon: 'Users',
          order: 1,
          isActive: true
        },
        {
          id: '3',
          title: 'الابتكار',
          description: 'نسعى دائماً لتقديم حلول مبتكرة تلبي احتياجات العملاء',
          icon: 'Lightbulb',
          order: 2,
          isActive: true
        },
        {
          id: '4',
          title: 'النزاهة',
          description: 'نعمل بشفافية ونزاهة في جميع تعاملاتنا',
          icon: 'Heart',
          order: 3,
          isActive: true
        },
        {
          id: '5',
          title: 'التميز',
          description: 'نسعى دائماً لتقديم أفضل الخدمات والمنتجات في السوق',
          icon: 'Star',
          order: 4,
          isActive: true
        }
      ])
    }

    return NextResponse.json(companyValues)
  } catch (error) {
    console.error('Error fetching company values:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company values' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { id: user.id }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Delete all existing company values
    await db.companyValue.deleteMany()

    // Create new company values
    const newValues = await db.companyValue.createMany({
      data: data.map((value: any) => ({
        title: value.title,
        description: value.description,
        icon: value.icon,
        order: value.order,
        isActive: value.isActive
      }))
    })

    // Return the created values
    const createdValues = await db.companyValue.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(createdValues)
  } catch (error) {
    console.error('Error updating company values:', error)
    return NextResponse.json(
      { error: 'Failed to update company values' },
      { status: 500 }
    )
  }
}