import { NextRequest, NextResponse } from 'next/server'
import { getApiUser } from '@/lib/api-auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser(request)
    
    if (!user || (user.role !== UserRole.ADMIN && user.role !== UserRole.SUPER_ADMIN && user.role !== UserRole.BRANCH_MANAGER)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get all vehicles from the database
    const vehicles = await db.vehicle.findMany({
      where: {
        status: 'AVAILABLE'
      },
      include: {
        images: {
          where: {
            isPrimary: true
          },
          take: 1
        }
      }
    })

    if (vehicles.length === 0) {
      return NextResponse.json({
        success: true,
        syncedCount: 0,
        skippedCount: 0,
        totalVehicles: 0,
        message: 'لا توجد سيارات متاحة للمزامنة'
      })
    }

    // Get existing vehicle IDs in inventory
    const existingVehicleItems = await db.inventoryItem.findMany({
      where: {
        category: 'VEHICLES'
      },
      select: {
        partNumber: true
      }
    })
    
    const existingVehicleIds = existingVehicleItems
      .filter(item => item.partNumber.startsWith('VEH-'))
      .map(item => item.partNumber.replace('VEH-', ''))

    let syncedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const vehicle of vehicles) {
      try {
        // Check if vehicle already exists in inventory
        if (existingVehicleIds.includes(vehicle.id)) {
          // Update existing item
          await db.inventoryItem.updateMany({
            where: {
              partNumber: `VEH-${vehicle.id}`
            },
            data: {
              quantity: 1,
              unitPrice: vehicle.price,
              status: 'IN_STOCK',
              statusOverride: false,
              lastRestockDate: new Date(),
              updatedAt: new Date()
            }
          })
          skippedCount++
        } else {
          // Create new inventory item for vehicle
          await db.inventoryItem.create({
            data: {
              partNumber: `VEH-${vehicle.id}`,
              name: `${vehicle.make} ${vehicle.model}`,
              description: `${vehicle.year} - ${vehicle.description || 'سيارة متاحة للبيع'}`,
              category: 'VEHICLES',
              quantity: 1,
              minStockLevel: 0,
              maxStockLevel: 1,
              unitPrice: vehicle.price,
              supplier: 'المعرض الرئيسي',
              location: 'المعرض',
              warehouse: 'المعرض الرئيسي',
              status: 'IN_STOCK',
              statusOverride: false,
              lastRestockDate: new Date(),
              notes: `رقم المخزون: ${vehicle.stockNumber} | VIN: ${vehicle.vin || 'N/A'} | اللون: ${vehicle.color || 'N/A'}`
            }
          })
          syncedCount++
        }
      } catch (error) {
        console.error(`Error syncing vehicle ${vehicle.id}:`, error)
        errorCount++
        continue
      }
    }

    const successMessage = errorCount > 0 
      ? `تمت مزامنة ${syncedCount} سيارة جديدة، وتحديث ${skippedCount} سيارة موجودة (${errorCount} أخطاء)`
      : `تمت مزامنة ${syncedCount} سيارة جديدة، وتحديث ${skippedCount} سيارة موجودة`

    return NextResponse.json({
      success: true,
      syncedCount,
      skippedCount,
      errorCount,
      totalVehicles: vehicles.length,
      message: successMessage
    })

  } catch (error) {
    console.error('Error syncing vehicles to inventory:', error)
    return NextResponse.json(
      { error: 'Failed to sync vehicles to inventory: ' + (error instanceof Error ? error.message : 'Unknown error') },
      { status: 500 }
    )
  }
}