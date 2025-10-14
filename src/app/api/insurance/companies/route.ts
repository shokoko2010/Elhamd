interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { InsuranceCompany } from '@prisma/client'
import { authorize, UserRole } from '@/lib/unified-auth'

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
    const companies = await db.insuranceCompany.findMany({
      include: {
        creator: {
          select: { name: true, email: true }
        },
        branch: {
          select: { name: true }
        },
        _count: {
          select: { policies: true }
        }
      },
      orderBy: { name: 'asc' }
    })

    return NextResponse.json(companies)
  } catch (error) {
    console.error('Error fetching insurance companies:', error)
    return NextResponse.json(
      { error: 'Failed to fetch insurance companies' },
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
      name,
      code,
      contactPerson,
      phone,
      email,
      address,
      website,
      branchId
    } = body

    // Check if company with same name or code already exists
    const existingCompany = await db.insuranceCompany.findFirst({
      where: {
        OR: [
          { name: { equals: name, mode: 'insensitive' } },
          { code: { equals: code, mode: 'insensitive' } }
        ]
      }
    })

    if (existingCompany) {
      return NextResponse.json(
        { error: 'Company with this name or code already exists' },
        { status: 400 }
      )
    }

    // Generate company code if not provided
    const companyCode = code || name
      .replace(/[^a-zA-Z0-9]/g, '')
      .toUpperCase()
      .substring(0, 10)

    const company = await db.insuranceCompany.create({
      data: {
        name,
        code: companyCode,
        contactPerson,
        phone,
        email,
        address,
        website,
        branchId,
        createdBy: auth.id
      },
      include: {
        creator: {
          select: { name: true, email: true }
        },
        branch: {
          select: { name: true }
        }
      }
    })

    return NextResponse.json(company, { status: 201 })
  } catch (error) {
    console.error('Error creating insurance company:', error)
    return NextResponse.json(
      { error: 'Failed to create insurance company' },
      { status: 500 }
    )
  }
}