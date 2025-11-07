import { NextRequest, NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

const ensureManager = async (request: NextRequest) => {
  const user = await getApiUser(request)

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER)) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { user }
}

const serializeWarehouse = (warehouse: any) => ({
  id: warehouse.id,
  name: warehouse.name,
  location: warehouse.location,
  capacity: warehouse.capacity,
  currentItems: warehouse._count?.inventoryItems ?? 0,
  isActive: warehouse.status === 'active',
  manager: warehouse.manager,
  contact: warehouse.contact,
  branch: warehouse.branch
})

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await ensureManager(request)
    if ('error' in auth) {
      return auth.error
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Warehouse ID is required' }, { status: 400 })
    }

    const body = await request.json()
    const {
      name,
      location,
      capacity,
      manager,
      contact,
      branchId,
      status,
      isActive
    } = body

    const payload: Record<string, any> = {}

    if (typeof name === 'string') payload.name = name
    if (typeof location === 'string') payload.location = location
    if (typeof capacity !== 'undefined') payload.capacity = Number(capacity) || 0
    if (typeof manager !== 'undefined') payload.manager = manager || null
    if (typeof contact !== 'undefined') payload.contact = contact || null
    if (typeof branchId !== 'undefined') payload.branchId = branchId || null

    if (typeof status === 'string') {
      payload.status = status
    } else if (typeof isActive !== 'undefined') {
      payload.status = isActive ? 'active' : 'inactive'
    }

    if (Object.keys(payload).length === 0) {
      return NextResponse.json({ error: 'No changes provided' }, { status: 400 })
    }

    const updated = await db.warehouse.update({
      where: { id },
      data: payload,
      include: {
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        },
        _count: {
          select: {
            inventoryItems: true
          }
        }
      }
    })

    return NextResponse.json(serializeWarehouse(updated))
  } catch (error) {
    console.error('Error updating warehouse:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const auth = await ensureManager(request)
    if ('error' in auth) {
      return auth.error
    }

    const { id } = params
    if (!id) {
      return NextResponse.json({ error: 'Warehouse ID is required' }, { status: 400 })
    }

    await db.warehouse.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting warehouse:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
