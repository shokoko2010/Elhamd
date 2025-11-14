import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser, UserRole } from '@/lib/auth-server'
import { PartCategory, PartStatus } from '@/types/maintenance'

interface RouteParams {
  params: Promise<{ id: string }>
}

const ensureAccess = async () => {
  const user = await getAuthUser()
  if (!user) {
    return { error: NextResponse.json({ error: 'Unauthorized' }, { status: 401 }) }
  }

  const hasAccess = [
    UserRole.ADMIN,
    UserRole.SUPER_ADMIN,
    UserRole.STAFF,
    UserRole.BRANCH_MANAGER
  ].includes(user.role)

  if (!hasAccess) {
    return { error: NextResponse.json({ error: 'Forbidden' }, { status: 403 }) }
  }

  return { user }
}

const parseNumber = (value: unknown) => {
  if (value === undefined || value === null) return undefined
  const parsed = typeof value === 'string' ? Number(value) : typeof value === 'number' ? value : Number.NaN
  return Number.isNaN(parsed) ? undefined : parsed
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const access = await ensureAccess()
    if ('error' in access) return access.error

    const existing = await prisma.maintenancePart.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 })
    }

    const payload = await request.json()
    const updateData: any = {}

    if (payload.partNumber && payload.partNumber !== existing.partNumber) {
      const duplicate = await prisma.maintenancePart.findUnique({ where: { partNumber: payload.partNumber } })
      if (duplicate) {
        return NextResponse.json({ error: 'Part number already exists' }, { status: 400 })
      }
      updateData.partNumber = payload.partNumber
    }

    if (payload.name !== undefined) updateData.name = payload.name
    if (payload.category && Object.values(PartCategory).includes(payload.category)) {
      updateData.category = payload.category as PartCategory
    }
    if (payload.description !== undefined) updateData.description = payload.description

    const cost = parseNumber(payload.cost)
    if (cost !== undefined) updateData.cost = cost

    const price = parseNumber(payload.price)
    if (price !== undefined) updateData.price = price

    const quantity = parseNumber(payload.quantity)
    if (quantity !== undefined) updateData.quantity = quantity

    const minStock = parseNumber(payload.minStock)
    if (minStock !== undefined) updateData.minStock = minStock

    const maxStock = parseNumber(payload.maxStock)
    if (maxStock !== undefined) updateData.maxStock = maxStock

    if (payload.location !== undefined) updateData.location = payload.location
    if (payload.supplier !== undefined) updateData.supplier = payload.supplier

    if (payload.status && Object.values(PartStatus).includes(payload.status)) {
      updateData.status = payload.status as PartStatus
    }

    if (payload.barcode !== undefined) updateData.barcode = payload.barcode
    if (payload.imageUrl !== undefined) updateData.imageUrl = payload.imageUrl

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(existing)
    }

    const part = await prisma.maintenancePart.update({
      where: { id },
      data: updateData
    })

    return NextResponse.json(part)
  } catch (error) {
    console.error('Error updating maintenance part:', error)
    return NextResponse.json({ error: 'Failed to update maintenance part' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const access = await ensureAccess()
    if ('error' in access) return access.error

    const existing = await prisma.maintenancePart.findUnique({ where: { id } })
    if (!existing) {
      return NextResponse.json({ error: 'Part not found' }, { status: 404 })
    }

    await prisma.maintenancePart.delete({ where: { id } })
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting maintenance part:', error)
    return NextResponse.json({ error: 'Failed to delete maintenance part' }, { status: 500 })
  }
}
