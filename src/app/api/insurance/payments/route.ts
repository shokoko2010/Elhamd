interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''

    const skip = (page - 1) * limit

    const where: any = {}

    if (type && type !== 'all') {
      where.type = type
    }

    if (status && status !== 'all') {
      where.status = status
    }

    const [payments, total] = await Promise.all([
      db.insurancePayment.findMany({
        where,
        include: {
          policy: {
            select: { policyNumber: true, type: true }
          },
          claim: {
            select: { claimNumber: true, type: true }
          },
          creator: {
            select: { name: true, email: true }
          },
          approver: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      db.insurancePayment.count({ where })
    ])

    return NextResponse.json({
      payments,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching insurance payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance payments' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      policyId,
      claimId,
      type,
      amount,
      currency,
      paymentMethod,
      reference,
      dueDate,
      notes
    } = body

    // Validate required fields
    if (!type || !amount || !paymentMethod) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Either policyId or claimId must be provided
    if (!policyId && !claimId) {
      return NextResponse.json(
        { error: 'Either policyId or claimId must be provided' },
        { status: 400 }
      )
    }

    // If claimId is provided, verify the claim exists
    if (claimId) {
      const claim = await db.insuranceClaim.findUnique({
        where: { id: claimId }
      })

      if (!claim) {
        return NextResponse.json(
          { error: 'Insurance claim not found' },
          { status: 404 }
        )
      }
    }

    // If policyId is provided, verify the policy exists
    if (policyId) {
      const policy = await db.insurancePolicy.findUnique({
        where: { id: policyId }
      })

      if (!policy) {
        return NextResponse.json(
          { error: 'Insurance policy not found' },
          { status: 404 }
        )
      }
    }

    const payment = await db.insurancePayment.create({
      data: {
        policyId,
        claimId,
        type,
        amount: parseFloat(amount),
        currency: currency || 'EGP',
        paymentMethod,
        reference,
        dueDate: dueDate ? new Date(dueDate) : null,
        notes,
        createdBy: session.user.id
      },
      include: {
        policy: {
          select: { policyNumber: true, type: true }
        },
        claim: {
          select: { claimNumber: true, type: true }
        },
        creator: {
          select: { name: true, email: true }
        }
      }
    })

    return NextResponse.json(payment, { status: 201 })
  } catch (error) {
    console.error('Error creating insurance payment:', error)
    return NextResponse.json(
      { error: 'Failed to create insurance payment' },
      { status: 500 }
    )
  }
}