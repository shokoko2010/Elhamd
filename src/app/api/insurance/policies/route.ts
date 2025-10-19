interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorize, UserRole } from '@/lib/auth-server'

const authHandler = async (request: NextRequest) => {
  try {
    return await authorize(request, { roles: [UserRole.ADMIN,UserRole.SUPER_ADMIN,UserRole.MANAGER,] })
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  const auth = await authHandler(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const status = searchParams.get('status') || ''
    const companyId = searchParams.get('companyId') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { policyNumber: { contains: search, mode: 'insensitive' } },
        { vehicle: { make: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (companyId && companyId !== 'all') {
      where.companyId = companyId
    }

    const [policies, total] = await Promise.all([
      db.insurancePolicy.findMany({
        where,
        include: {
          vehicle: {
            select: { make: true, model: true, year: true, stockNumber: true }
          },
          customer: {
            select: { name: true, email: true, phone: true }
          },
          company: {
            select: { name: true, code: true }
          },
          creator: {
            select: { name: true, email: true }
          },
          approver: {
            select: { name: true, email: true }
          },
          _count: {
            select: { claims: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.insurancePolicy.count({ where })
    ])

    return NextResponse.json({
      policies,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching insurance policies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance policies' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await authHandler(request)
  if (!auth) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  
  try {

    const body = await request.json()
    const {
      vehicleId,
      customerId,
      companyId,
      type,
      startDate,
      endDate,
      premium,
      coverage,
      deductible,
      notes
    } = body

    // Validate required fields
    if (!vehicleId || !customerId || !companyId || !type || !startDate || !endDate || !premium) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id: vehicleId }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'Vehicle not found' },
        { status: 404 }
      )
    }

    // Check if customer exists
    const customer = await db.user.findUnique({
      where: { id: customerId }
    })

    if (!customer) {
      return NextResponse.json(
        { error: 'Customer not found' },
        { status: 404 }
      )
    }

    // Check if company exists
    const company = await db.insuranceCompany.findUnique({
      where: { id: companyId }
    })

    if (!company) {
      return NextResponse.json(
        { error: 'Insurance company not found' },
        { status: 404 }
      )
    }

    // Generate policy number
    const policyNumber = `INS-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    const policy = await db.insurancePolicy.create({
      data: {
        policyNumber,
        vehicleId,
        customerId,
        companyId,
        type,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        premium: parseFloat(premium),
        coverage,
        deductible: parseFloat(deductible) || 0,
        notes,
        createdBy: auth.id
      },
      include: {
        vehicle: {
          select: { make: true, model: true, year: true, stockNumber: true }
        },
        customer: {
          select: { name: true, email: true, phone: true }
        },
        company: {
          select: { name: true, code: true }
        },
        creator: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(policy, { status: 201 })
  } catch (error) {
    console.error('Error creating insurance policy:', error)
    return NextResponse.json(
      { error: 'Failed to create insurance policy' },
      { status: 500 }
    )
  }
}