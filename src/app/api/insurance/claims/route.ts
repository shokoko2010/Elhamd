interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
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
    const policyId = searchParams.get('policyId') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (search) {
      where.OR = [
        { claimNumber: { contains: search, mode: 'insensitive' } },
        { policy: { policyNumber: { contains: search, mode: 'insensitive' } } },
        { vehicle: { make: { contains: search, mode: 'insensitive' } } },
        { vehicle: { model: { contains: search, mode: 'insensitive' } } },
        { customer: { name: { contains: search, mode: 'insensitive' } } },
        { customer: { email: { contains: search, mode: 'insensitive' } } }
      ]
    }

    if (status && status !== 'all') {
      where.status = status
    }

    if (policyId && policyId !== 'all') {
      where.policyId = policyId
    }

    const [claims, total] = await Promise.all([
      db.insuranceClaim.findMany({
        where,
        include: {
          policy: {
            select: { policyNumber: true, type: true }
          },
          vehicle: {
            select: { make: true, model: true, year: true }
          },
          customer: {
            select: { name: true, email: true, phone: true }
          },
          assignee: {
            select: { name: true, email: true }
          },
          creator: {
            select: { name: true, email: true }
          },
          _count: {
            select: { payments: true }
          }
        },
        orderBy: { incidentDate: 'desc' },
        skip,
        take: limit
      }),
      db.insuranceClaim.count({ where })
    ])

    return NextResponse.json({
      claims,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching insurance claims:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance claims' },
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
      policyId,
      type,
      description,
      incidentDate,
      incidentLocation,
      estimatedAmount
    } = body

    // Validate required fields
    if (!policyId || !type || !description || !incidentDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if policy exists and get related data
    const policy = await db.insurancePolicy.findUnique({
      where: { id: policyId },
      include: {
        vehicle: true,
        customer: true
      }
    })

    if (!policy) {
      return NextResponse.json(
        { error: 'Insurance policy not found' },
        { status: 404 }
      )
    }

    // Generate claim number
    const claimNumber = `CLM-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000).toString().padStart(4, '0')}`

    const claim = await db.insuranceClaim.create({
      data: {
        claimNumber,
        policyId,
        vehicleId: policy.vehicleId,
        customerId: policy.customerId,
        type,
        description,
        incidentDate: new Date(incidentDate),
        incidentLocation,
        estimatedAmount: estimatedAmount ? parseFloat(estimatedAmount) : null,
        createdBy: auth.id
      },
      include: {
        policy: {
          select: { policyNumber: true, type: true }
        },
        vehicle: {
          select: { make: true, model: true, year: true }
        },
        customer: {
          select: { name: true, email: true, phone: true }
        },
        creator: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(claim, { status: 201 })
  } catch (error) {
    console.error('Error creating insurance claim:', error)
    return NextResponse.json(
      { error: 'Failed to create insurance claim' },
      { status: 500 }
    )
  }
}