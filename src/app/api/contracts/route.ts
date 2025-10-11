interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
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
        { contractNumber: { contains: search, mode: 'insensitive' } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { vehicle: { make: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
      ]
    }

    if (status) {
      where.status = status
    }

    if (type) {
      where.type = type
    }

    // Fetch contracts with related data
    const [contracts, total] = await Promise.all([
      db.contract.findMany({
        where,
        skip,
        take: limit,
        include: {
          customer: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
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
          branch: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
          creator: {
            select: {
              id: true,
              name: true,
            },
          },
          approver: {
            select: {
              id: true,
              name: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.contract.count({ where }),
    ])

    // Format response
    const formattedContracts = contracts.map((contract) => ({
      id: contract.id,
      contractNumber: contract.contractNumber,
      type: contract.type,
      customerName: contract.customer?.name || 'غير معروف',
      vehicleName: contract.vehicle ? `${contract.vehicle.make} ${contract.vehicle.model} (${contract.vehicle.year})` : undefined,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate?.toISOString(),
      value: contract.value,
      status: contract.status,
      branchName: contract.branch?.name,
      terms: contract.terms,
      attachments: contract.attachments,
      createdBy: contract.creator?.name,
      approvedBy: contract.approver?.name,
      approvedAt: contract.approvedAt?.toISOString(),
      createdAt: contract.createdAt.toISOString(),
    }))

    return NextResponse.json({
      contracts: formattedContracts,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching contracts:', error)
    return NextResponse.json({ error: 'حدث خطأ في جلب البيانات' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح بالدخول' }, { status: 401 })
    }

    const body = await request.json()
    const {
      type,
      customerId,
      vehicleId,
      startDate,
      endDate,
      value,
      terms,
      attachments,
      branchId,
    } = body

    // Validate required fields
    if (!type || !customerId || !startDate || !value) {
      return NextResponse.json({ error: 'جميع الحقول المطلوبة يجب ملؤها' }, { status: 400 })
    }

    // Generate contract number
    const contractCount = await db.contract.count()
    const contractNumber = `CON-${String(contractCount + 1).padStart(6, '0')}`

    // Create contract
    const contract = await db.contract.create({
      data: {
        contractNumber,
        type,
        customerId,
        vehicleId,
        startDate: new Date(startDate),
        endDate: endDate ? new Date(endDate) : null,
        value: parseFloat(value),
        terms,
        attachments,
        createdBy: session.session.user.id,
        branchId,
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
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
        branch: {
          select: {
            id: true,
            name: true,
            code: true,
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
      id: contract.id,
      contractNumber: contract.contractNumber,
      type: contract.type,
      customerName: contract.customer?.name,
      vehicleName: contract.vehicle ? `${contract.vehicle.make} ${contract.vehicle.model} (${contract.vehicle.year})` : undefined,
      startDate: contract.startDate.toISOString(),
      endDate: contract.endDate?.toISOString(),
      value: contract.value,
      status: contract.status,
      branchName: contract.branch?.name,
      createdBy: contract.creator?.name,
      createdAt: contract.createdAt.toISOString(),
    })
  } catch (error) {
    console.error('Error creating contract:', error)
    return NextResponse.json({ error: 'حدث خطأ في إنشاء العقد' }, { status: 500 })
  }
}