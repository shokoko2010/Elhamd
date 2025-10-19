interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const type = searchParams.get('type') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { warrantyNumber: { contains: search, mode: 'insensitive' } },
        { vehicle: { make: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
        { contract: { contractNumber: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    // Fetch warranties with related data
    const [warranties, total] = await Promise.all([
      db.warranty.findMany({
        where,
        skip,
        take: limit,
        include: {
          contract: {
            select: {
              id: true,
              contractNumber: true,
              type: true,
            },
          },
          vehicle: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              stockNumber: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.warranty.count({ where }),
    ])

    // Format response
    const formattedWarranties = warranties.map((warranty) => ({
      id: warranty.id,
      warrantyNumber: warranty.warrantyNumber,
      type: warranty.type,
      vehicleName: `${warranty.vehicle.make} ${warranty.vehicle.model} (${warranty.vehicle.year})`,
      contractNumber: warranty.contract.contractNumber,
      contractType: warranty.contract.type,
      startDate: warranty.startDate.toISOString(),
      endDate: warranty.endDate.toISOString(),
      status: warranty.status,
      coverage: warranty.coverage,
      terms: warranty.terms,
      createdAt: warranty.createdAt.toISOString(),
    }))

    return NextResponse.json({
      warranties: formattedWarranties,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching warranties:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 })
    }

    const body = await request.json()
    const {
      contractId,
      vehicleId,
      type,
      startDate,
      endDate,
      coverage,
      terms,
    } = body

    // Validate required fields
    if (!contractId || !vehicleId || !type || !startDate || !endDate) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب ملؤها' }, { status: 400 })
    }

    // Generate warranty number
    const warrantyCount = await db.warranty.count()
    const warrantyNumber = `WAR-${String(warrantyCount + 1).padStart(6, '0')}`

    // Create warranty
    const warranty = await db.warranty.create({
      data: {
        warrantyNumber,
        contractId,
        vehicleId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        coverage,
        terms,
      },
      include: {
        contract: {
          select: {
            id: true,
            contractNumber: true,
            type: true,
          },
        },
        vehicle: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            stockNumber: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: warranty.id,
      warrantyNumber: warranty.warrantyNumber,
      type: warranty.type,
      vehicleName: `${warranty.vehicle.make} ${warranty.vehicle.model} (${warranty.vehicle.year})`,
      contractNumber: warranty.contract.contractNumber,
      contractType: warranty.contract.type,
      startDate: warranty.startDate.toISOString(),
      endDate: warranty.endDate.toISOString(),
      status: warranty.status,
      coverage: warranty.coverage,
      terms: warranty.terms,
      createdAt: warranty.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Error creating warranty:', error)
    return NextResponse.json({ error: 'حدث خطأ في إنشاء الضمان' }, { status: 500 })
  }
}