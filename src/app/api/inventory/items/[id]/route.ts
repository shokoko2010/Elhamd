interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { InventoryStatus, UserRole } from '@prisma/client'

const resolveStatus = (quantity: number, minStockLevel: number, status?: string) => {
  const normalizedStatus = status?.toUpperCase() as keyof typeof InventoryStatus | undefined

  if (normalizedStatus && InventoryStatus[normalizedStatus]) {
    return InventoryStatus[normalizedStatus]
  }

  if (quantity <= 0) {
    return InventoryStatus.OUT_OF_STOCK
  }

  if (quantity <= Math.max(minStockLevel, 0)) {
    return InventoryStatus.LOW_STOCK
  }

  return InventoryStatus.IN_STOCK
}

const transformItem = (item: any) => ({
  id: item.id,
  partNumber: item.partNumber,
  name: item.name,
  description: item.description,
  category: item.category,
  quantity: item.quantity,
  minStockLevel: item.minStockLevel,
  maxStockLevel: item.maxStockLevel,
  unitPrice: item.unitPrice,
  supplier: item.supplier,
  location: item.location,
  warehouse: item.warehouse,
  status: item.status,
  lastRestockDate: item.lastRestockDate?.toISOString(),
  nextRestockDate: item.nextRestockDate?.toISOString(),
  leadTime: item.leadTime,
  notes: item.notes
})

const ensureAuthorized = async (request: NextRequest) => {
  const user = await getApiUser(request)

  if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER && user.role !== UserRole.STAFF)) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  return { user }
}

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const auth = await ensureAuthorized(request)
    if ('error' in auth) {
      return auth.error
    }

    const { id } = await context.params

    const item = await db.inventoryItem.findUnique({
      where: { id }
    })

    if (!item) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    return NextResponse.json(transformItem(item))
  } catch (error) {
    console.error('Error fetching inventory item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const auth = await ensureAuthorized(request)
    if ('error' in auth) {
      return auth.error
    }

    const { id } = await context.params
    const existing = await db.inventoryItem.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    const body = await request.json()
    const {
      partNumber,
      name,
      description,
      category,
      quantity,
      minStockLevel,
      maxStockLevel,
      unitPrice,
      supplier,
      location,
      warehouse,
      status,
      leadTime,
      notes,
      nextRestockDate,
      lastRestockDate
    } = body

    if (!partNumber || !name || !category || unitPrice === undefined || unitPrice === null || !supplier || !warehouse) {
      return NextResponse.json(
        { error: 'Part number, name, category, unit price, supplier, and warehouse are required' },
        { status: 400 }
      )
    }

    const computedStatus = resolveStatus(quantity ?? existing.quantity, minStockLevel ?? existing.minStockLevel, status)

    const updated = await db.inventoryItem.update({
      where: { id },
      data: {
        partNumber,
        name,
        description,
        category,
        quantity,
        minStockLevel,
        maxStockLevel,
        unitPrice,
        supplier,
        location,
        warehouse,
        status: computedStatus,
        leadTime,
        notes,
        nextRestockDate:
          nextRestockDate === undefined
            ? existing.nextRestockDate
            : nextRestockDate
              ? new Date(nextRestockDate)
              : null,
        lastRestockDate:
          lastRestockDate === undefined
            ? existing.lastRestockDate
            : lastRestockDate
              ? new Date(lastRestockDate)
              : existing.lastRestockDate
      }
    })

    return NextResponse.json(transformItem(updated))
  } catch (error) {
    console.error('Error updating inventory item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const auth = await ensureAuthorized(request)
    if ('error' in auth) {
      return auth.error
    }

    const { id } = await context.params

    const existing = await db.inventoryItem.findUnique({ where: { id } })

    if (!existing) {
      return NextResponse.json({ error: 'Inventory item not found' }, { status: 404 })
    }

    await db.inventoryItem.delete({ where: { id } })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting inventory item:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

