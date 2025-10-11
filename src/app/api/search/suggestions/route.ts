interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q') || ''

    if (!query.trim() || query.length < 2) {
      return NextResponse.json([])
    }

    const suggestions: any[] = []

    // Get vehicle suggestions
    const vehicles = await db.vehicle.findMany({
      where: {
        OR: [
          { make: { contains: query, mode: 'insensitive' } },
          { model: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        make: true,
        model: true,
        category: true
      },
      take: 5
    })

    suggestions.push(...vehicles.map(vehicle => ({
      id: `vehicle-${vehicle.id}`,
      text: `${vehicle.make} ${vehicle.model}`,
      type: 'vehicle',
      category: vehicle.category,
      frequency: Math.floor(Math.random() * 100) + 1 // Mock frequency
    })))

    // Get customer suggestions
    const customers = await db.user.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        email: true
      },
      take: 5
    })

    suggestions.push(...customers.map(customer => ({
      id: `customer-${customer.id}`,
      text: customer.name || customer.email,
      type: 'customer',
      category: 'customer',
      frequency: Math.floor(Math.random() * 50) + 1 // Mock frequency
    })))

    // Get inventory item suggestions
    const inventoryItems = await db.inventoryItem.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { partNumber: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        partNumber: true,
        category: true
      },
      take: 5
    })

    suggestions.push(...inventoryItems.map(item => ({
      id: `inventory-${item.id}`,
      text: `${item.name} (${item.partNumber})`,
      type: 'inventory_item',
      category: item.category,
      frequency: Math.floor(Math.random() * 30) + 1 // Mock frequency
    })))

    // Get supplier suggestions
    const suppliers = await db.supplier.findMany({
      where: {
        OR: [
          { name: { contains: query, mode: 'insensitive' } },
          { contact: { contains: query, mode: 'insensitive' } }
        ]
      },
      select: {
        id: true,
        name: true,
        contact: true
      },
      take: 5
    })

    suggestions.push(...suppliers.map(supplier => ({
      id: `supplier-${supplier.id}`,
      text: supplier.name,
      type: 'supplier',
      category: 'supplier',
      frequency: Math.floor(Math.random() * 20) + 1 // Mock frequency
    })))

    // Sort by frequency and limit results
    suggestions.sort((a, b) => b.frequency - a.frequency)

    return NextResponse.json(suggestions.slice(0, 10))

  } catch (error) {
    console.error('Error fetching search suggestions:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}