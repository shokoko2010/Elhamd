interface RouteParams {
  params: Promise<{ id: string }>
}

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

    // Transform to match frontend interface
    const transformedServices = serviceTypes.map(service => ({
      id: service.id,
      name: service.name,
      description: service.description || '',
      duration: service.duration,
      price: service.price || 0,
      category: service.category,
      isActive: service.isActive
    }))

    return NextResponse.json(transformedServices)
  } catch (error) {
    console.error('Error fetching service types:', error)
    return NextResponse.json(
      { error: 'فشل في جلب أنواع الخدمات' },
      { status: 500 }
    )
  }
}