interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { createAuthHandler, UserRole } from '@/lib/unified-auth'

const authHandler = async (request: NextRequest) => {
  try {
    return await authorize(request, { roles: [UserRole.ADMIN,UserRole.SUPER_ADMIN,UserRole.BRANCH_MANAGER,] })
  } catch (error) {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authHandler(request)
    if (auth.error) {
      return auth.error
    }

    // Fetch all vehicles from the database
    const vehicles = await db.vehicle.findMany({
      include: {
        branch: true
      }
    })

    let syncedCount = 0
    let skippedCount = 0

    // Process each vehicle
    for (const vehicle of vehicles) {
      // Check if vehicle already exists in inventory
      const existingInventoryItem = await db.inventoryItem.findFirst({
        where: {
          partNumber: `VEH-${vehicle.stockNumber}`
        }
      })

      if (existingInventoryItem) {
        skippedCount++
        continue
      }

      // Create inventory item for vehicle
      await db.inventoryItem.create({
        data: {
          partNumber: `VEH-${vehicle.stockNumber}`,
          name: `${vehicle.make} ${vehicle.model} ${vehicle.year}`,
          description: vehicle.description || `${vehicle.make} ${vehicle.model} - ${vehicle.year}`,
          category: 'vehicles',
          quantity: 1,
          minStockLevel: 0,
          maxStockLevel: 1,
          unitPrice: vehicle.price,
          supplier: 'Showroom',
          location: vehicle.branch ? vehicle.branch.name : 'Main Showroom',
          warehouse: vehicle.branch ? `Branch - ${vehicle.branch.name}` : 'Main Showroom',
          branchId: vehicle.branchId,
          status: vehicle.status === 'AVAILABLE' ? 'IN_STOCK' : 'OUT_OF_STOCK',
          lastRestockDate: new Date(),
          leadTime: 0,
          notes: `Vehicle: ${vehicle.make} ${vehicle.model} ${vehicle.year} - Stock#: ${vehicle.stockNumber} - VIN: ${vehicle.vin || 'N/A'}`
        }
      })

      syncedCount++
    }

    return NextResponse.json({
      message: 'Vehicles synced successfully',
      syncedCount,
      skippedCount,
      totalVehicles: vehicles.length
    })

  } catch (error) {
    console.error('Error syncing vehicles to inventory:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}