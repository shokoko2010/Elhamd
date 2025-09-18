import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
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
          year: '1999',
          title: 'تأسيس الشركة',
          description: 'تأسست الحمد للسيارات كوكيل رسمي لسيارات تاتا في مصر',
          icon: 'Car',
          order: 0,
          isActive: true
        },
        {
          id: '2',
          year: '2005',
          title: 'التوسع في الخدمات',
          description: 'إطلاق أول مركز خدمة متكامل لصيانة سيارات تاتا',
          icon: 'Wrench',
          order: 1,
          isActive: true
        },
        {
          id: '3',
          year: '2010',
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
          description: 'الحصول على جائزة أفضل وكيل خدمة لسيارات تاتا',
          icon: 'Award',
          order: 3,
          isActive: true
        },
        {
          id: '5',
          year: '2020',
          title: 'التحول الرقمي',
          description: 'إطلاق المنصة الرقمية الشاملة لخدمة العملاء',
          icon: 'Smartphone',
          order: 4,
          isActive: true
        },
        {
          id: '6',
          year: '2024',
          title: 'سيارات كهربائية',
          description: 'إدخال سيارات تاتا الكهربائية إلى السوق المصري',
          icon: 'Zap',
          order: 5,
          isActive: true
        }
      ])
    }

    return NextResponse.json(timelineEvents)
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