import { NextRequest, NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER && user.role !== UserRole.STAFF)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get vehicles that are available
    const availableVehicles = await db.vehicle.count({
      where: {
        status: 'AVAILABLE'
      }
    })

    // Get vehicles already in inventory
    const vehiclesInInventory = await db.inventoryItem.count({
      where: {
        category: 'VEHICLES'
      }
    })

    // Get vehicles that can be synced (available but not in inventory)
    const vehiclesToSync = await db.vehicle.count({
      where: {
        status: 'AVAILABLE',
        NOT: {
          OR: [
            {
              inventoryItems: {
                some: {}
              }
            }
          ]
        }
      }
    })

    return NextResponse.json({
      availableVehicles,
      vehiclesInInventory,
      vehiclesToSync,
      canSync: vehiclesToSync > 0
    })

  } catch (error) {
    console.error('Error getting sync stats:', error)
    return NextResponse.json(
      { error: 'Failed to get sync statistics' },
      { status: 500 }
    )
  }
}