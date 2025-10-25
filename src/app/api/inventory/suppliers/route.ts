interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorize, UserRole } from '@/lib/auth-server'

const authHandler = async (request: NextRequest) => {
  try {
    return await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER] })
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authHandler(request)
    if (auth.error) {
      return auth.error
    }

    // Get suppliers
    const suppliers = await db.supplier.findMany({
      orderBy: { name: 'asc' }
    })

    // Transform suppliers data
    const transformedSuppliers = suppliers.map(supplier => ({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      rating: supplier.rating,
      status: supplier.status,
      leadTime: supplier.leadTime,
      minOrderAmount: supplier.minOrderAmount
    }))

    return NextResponse.json(transformedSuppliers)

  } catch (error) {
    console.error('Error fetching suppliers:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authHandler(request)
    if (auth.error) {
      return auth.error
    }

    const body = await request.json()
    const { name, contact, email, phone, address, rating, leadTime, minOrderAmount } = body

    // Validate required fields
    if (!name || !contact || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, contact, email, and phone are required' },
        { status: 400 }
      )
    }

    // Create new supplier
    const supplier = await db.supplier.create({
      data: {
        name,
        contact,
        email,
        phone,
        address,
        rating: rating || 0,
        status: 'active',
        leadTime: leadTime || 7,
        minOrderAmount: minOrderAmount || 0
      }
    })

    return NextResponse.json({
      id: supplier.id,
      name: supplier.name,
      contact: supplier.contact,
      email: supplier.email,
      phone: supplier.phone,
      address: supplier.address,
      rating: supplier.rating,
      status: supplier.status,
      leadTime: supplier.leadTime,
      minOrderAmount: supplier.minOrderAmount
    })

  } catch (error) {
    console.error('Error creating supplier:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}