interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get timeline events from database
    const timelineEvents = await db.timelineEvent.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })

    if (timelineEvents.length === 0) {
      // Return default timeline events if none exist
      return NextResponse.json([
        {
          id: '1',
          year: '2005',
          title: 'تأسيس الشركة',
          description: 'تأسست الحمد للسيارات كموزع معتمد لسيارات تاتا في مدن القناة',
          icon: 'Car',
          order: 0,
          isActive: true
        },
        {
          id: '2',
          year: '2010',
          title: 'التوسع في الخدمات',
          description: 'إطلاق أول مركز خدمة متكامل لصيانة سيارات تاتا',
          icon: 'Wrench',
          order: 1,
          isActive: true
        },
        {
          id: '3',
          year: '2015',
          title: 'التوسع الجغرافي',
          description: 'افتتاح فروع جديدة في المحافظات المصرية',
          icon: 'MapPin',
          order: 2,
          isActive: true
        },
        {
          id: '4',
          year: '2015',
          title: 'التميز في الخدمة',
          description: 'الحصول على جائزة أفضل موزع خدمة لسيارات تاتا',
          icon: 'Award',
          order: 3,
          isActive: true
        },

      ])
    }

    // Remove duplicates and ensure unique events
    const uniqueEvents = timelineEvents.reduce((acc, current) => {
      const existingIndex = acc.findIndex(event =>
        event.year === current.year &&
        event.title === current.title
      )

      if (existingIndex === -1) {
        acc.push(current)
      }

      return acc
    }, [] as typeof timelineEvents)

    return NextResponse.json(uniqueEvents)
  } catch (error) {
    console.error('Error fetching timeline events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch timeline events' },
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

    // Delete all existing timeline events
    await db.timelineEvent.deleteMany()

    // Create new timeline events
    const newEvents = await db.timelineEvent.createMany({
      data: data.map((event: any) => ({
        year: event.year,
        title: event.title,
        description: event.description,
        icon: event.icon,
        order: event.order,
        isActive: event.isActive
      }))
    })

    // Return the created events
    const createdEvents = await db.timelineEvent.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(createdEvents)
  } catch (error) {
    console.error('Error updating timeline events:', error)
    return NextResponse.json(
      { error: 'Failed to update timeline events' },
      { status: 500 }
    )
  }
}