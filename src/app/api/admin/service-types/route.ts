import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ServiceCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const isActive = searchParams.get('isActive')

    const where: any = {}
    if (category && category !== 'all') {
      where.category = category as ServiceCategory
    }
    if (isActive !== null && isActive !== 'all') {
      where.isActive = isActive === 'true'
    }

    const serviceTypes = await db.serviceType.findMany({
      where,
      include: {
        _count: {
          select: {
            serviceBookings: true
          }
        }
      },
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ serviceTypes })
  } catch (error) {
    console.error('Error fetching service types:', error)
    return NextResponse.json(
      { error: 'فشل في جلب أنواع الخدمات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, duration, price, category } = body

    // Validate required fields
    if (!name || !duration || !category) {
      return NextResponse.json(
        { error: 'الاسم والمدة والفئة مطلوبة' },
        { status: 400 }
      )
    }

    // Create service type
    const serviceType = await db.serviceType.create({
      data: {
        name,
        description,
        duration: parseInt(duration),
        price: price ? parseFloat(price) : null,
        category: category as ServiceCategory
      },
      include: {
        _count: {
          select: {
            serviceBookings: true
          }
        }
      }
    })

    return NextResponse.json({ serviceType }, { status: 201 })
  } catch (error) {
    console.error('Error creating service type:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء نوع الخدمة' },
      { status: 500 }
    )
  }
}