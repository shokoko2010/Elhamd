import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { Prisma } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!['STAFF', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = Number.parseInt(searchParams.get('page') ?? '1', 10)
    const limit = Number.parseInt(searchParams.get('limit') ?? '50', 10)
    const search = searchParams.get('search')?.trim() ?? ''
    const category = searchParams.get('category')?.trim() ?? ''
    const stockFilter = searchParams.get('stock')?.trim() ?? ''

    const skip = Math.max(page - 1, 0) * Math.max(limit, 1)

    const where: Prisma.InventoryItemWhereInput = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { partNumber: { contains: search, mode: 'insensitive' } },
        { category: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (category && category.toLowerCase() !== 'all') {
      where.category = category
    }

    if (stockFilter) {
      const normalizedStock = stockFilter.toLowerCase()
      if (normalizedStock === 'low') {
        where.status = 'LOW_STOCK'
      } else if (normalizedStock === 'out') {
        where.status = 'OUT_OF_STOCK'
      } else if (normalizedStock === 'in') {
        where.status = 'IN_STOCK'
      }
    }

    const take = Math.max(Math.min(limit, 200), 1)

    const [items, total] = await Promise.all([
      db.inventoryItem.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take
      }),
      db.inventoryItem.count({ where })
    ])

    const transformed = items.map((item) => ({
      id: item.id,
      name: item.name,
      partNumber: item.partNumber,
      category: item.category,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      status: item.status.toLowerCase(),
      supplier: item.supplier,
      location: item.location,
      warehouse: item.warehouse,
      minStockLevel: item.minStockLevel,
      maxStockLevel: item.maxStockLevel,
      leadTime: item.leadTime,
      updatedAt: item.updatedAt.toISOString()
    }))

    return NextResponse.json({
      items: transformed,
      total,
      page,
      pageSize: take
    })
  } catch (error) {
    console.error('Error fetching employee inventory parts:', error)
    return NextResponse.json({ error: 'Failed to fetch inventory items' }, { status: 500 })
  }
}
