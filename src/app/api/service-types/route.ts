import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { ServiceCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const active = searchParams.get('active') !== 'false'

    const where: any = {
      isActive: active
    }

    if (category && category !== 'all') {
      where.category = category as ServiceCategory
    }

    const serviceTypes = await db.serviceType.findMany({
      where,
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