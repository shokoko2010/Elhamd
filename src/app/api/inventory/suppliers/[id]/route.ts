import { NextRequest, NextResponse } from 'next/server'
import { authorize, UserRole } from '@/lib/auth-server'
import { db } from '@/lib/db'

const authHandler = (request: NextRequest) =>
  authorize(request, {
    roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER]
  })

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authHandler(request)
    if ('error' in auth) {
      return auth.error
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      contact,
      email,
      phone,
      address,
      rating,
      leadTime,
      minOrderAmount,
      status
    } = body

    const payload: Record<string, any> = {}

    if (typeof name === 'string') payload.name = name
    if (typeof contact === 'string') payload.contact = contact
    if (typeof email === 'string') payload.email = email
    if (typeof phone === 'string') payload.phone = phone
    if (typeof address === 'string') payload.address = address
    if (typeof rating !== 'undefined') payload.rating = Number(rating) || 0
    if (typeof leadTime !== 'undefined') payload.leadTime = Number(leadTime) || 0
    if (typeof minOrderAmount !== 'undefined') payload.minOrderAmount = Number(minOrderAmount) || 0
    if (typeof status === 'string') payload.status = status

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const supplier = await db.supplier.update({
      where: { id },
      data: payload
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
    console.error('Error updating supplier:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await authHandler(request)
    if ('error' in auth) {
      return auth.error
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Supplier ID is required' }, { status: 400 })
    }

    await db.supplier.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting supplier:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
