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

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { claimNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { make: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
        { warranty: { warrantyNumber: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (status) {
      where.status = status
    }

    // Fetch warranty claims with related data
    const [claims, total] = await Promise.all([
      db.warrantyClaim.findMany({
        where,
        skip,
        take: limit,
        include: {
          warranty: {
            select: {
              id: true,
              warrantyNumber: true,
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
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.warrantyClaim.count({ where }),
    ])

    // Format response
    const formattedClaims = claims.map((claim) => ({
      id: claim.id,
      claimNumber: claim.claimNumber,
      warrantyNumber: claim.warranty.warrantyNumber,
      warrantyType: claim.warranty.type,
      customerName: claim.customer?.name || 'غير معروف',
      vehicleName: `${claim.vehicle.make} ${claim.vehicle.model} (${claim.vehicle.year})`,
      claimDate: claim.claimDate.toISOString(),
      status: claim.status,
      description: claim.description,
      estimatedCost: claim.estimatedCost,
      actualCost: claim.actualCost,
      approvedBy: claim.approver?.name,
      approvedAt: claim.approvedAt?.toISOString(),
      resolvedAt: claim.resolvedAt?.toISOString(),
      resolution: claim.resolution,
      attachments: claim.attachments,
      createdBy: claim.creator?.name,
      createdAt: claim.createdAt.toISOString(),
    }))

    return NextResponse.json({
      claims: formattedClaims,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching warranty claims:', error)
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
      warrantyId,
      vehicleId,
      customerId,
      description,
      estimatedCost,
      attachments,
    } = body

    // Validate required fields
    if (!warrantyId || !vehicleId || !customerId || !description) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب ملؤها' }, { status: 400 })
    }

    // Generate claim number
    const claimCount = await db.warrantyClaim.count()
    const claimNumber = `CLM-${String(claimCount + 1).padStart(6, '0')}`

    // Create warranty claim
    const claim = await db.warrantyClaim.create({
      data: {
        claimNumber,
        warrantyId,
        vehicleId,
        customerId,
        description,
        claimDate: new Date(),
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        attachments,
        createdBy: user.id,
      },
      include: {
        warranty: {
          select: {
            id: true,
            warrantyNumber: true,
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
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          },
        },
        creator: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json({
      id: claim.id,
      claimNumber: claim.claimNumber,
      warrantyNumber: claim.warranty.warrantyNumber,
      warrantyType: claim.warranty.type,
      customerName: claim.customer?.name,
      vehicleName: `${claim.vehicle.make} ${claim.vehicle.model} (${claim.vehicle.year})`,
      claimDate: claim.claimDate.toISOString(),
      status: claim.status,
      description: claim.description,
      estimatedCost: claim.estimatedCost,
      actualCost: claim.actualCost,
      attachments: claim.attachments,
      createdBy: claim.creator?.name,
      createdAt: claim.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Error creating warranty claim:', error)
    return NextResponse.json({ error: 'حدث خطأ في إنشاء مطالبة الضمان' }, { status: 500 })
  }
}