interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get service items from database
    const serviceItems = await db.serviceItem.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    
    if (serviceItems.length === 0) {
      // Return default service items if none exist
      return NextResponse.json([
        {
          id: '1',
          title: 'بيع سيارات جديدة',
          description: 'أحدث موديلات تاتا مع ضمان المصنع الكامل',
          icon: 'Car',
          link: '/vehicles',
          order: 0,
          isActive: true
        },
        {
          id: '2',
          title: 'خدمة الصيانة',
          description: 'صيانة احترافية بأسعار تنافسية',
          icon: 'Wrench',
          link: '/maintenance',
          order: 1,
          isActive: true
        },
        {
          id: '3',
          title: 'قطع غيار أصلية',
          description: 'قطع غيار تاتا الأصلية مع ضمان الجودة',
          icon: 'Package',
          link: '/parts',
          order: 2,
          isActive: true
        },
        {
          id: '4',
          title: 'تمويل سيارات',
          description: 'خيارات تمويل متنوعة بأفضل الأسعار',
          icon: 'CreditCard',
          link: '/financing',
          order: 3,
          isActive: true
        }
      ])
    }

    return NextResponse.json(serviceItems)
  } catch (error) {
    console.error('Error fetching service items:', error)
    return NextResponse.json(
      { error: 'Failed to fetch service items' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Delete all existing service items
    await db.serviceItem.deleteMany()

    // Create new service items
    const newItems = await db.serviceItem.createMany({
      data: data.map((item: any) => ({
        title: item.title,
        description: item.description,
        icon: item.icon,
        link: item.link,
        order: item.order,
        isActive: item.isActive
      }))
    })

    // Return the created items
    const createdItems = await db.serviceItem.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(createdItems)
  } catch (error) {
    console.error('Error updating service items:', error)
    return NextResponse.json(
      { error: 'Failed to update service items' },
      { status: 500 }
    )
  }
}