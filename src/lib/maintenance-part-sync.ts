import { db } from '@/lib/db'
import {
  InventoryStatus,
  PartCategory,
  PartStatus,
  Prisma
} from '@prisma/client'

const VEHICLE_CATEGORY_MARKERS = new Set([
  'VEHICLE',
  'VEHICLES',
  'CAR',
  'CARS',
  'TRUCK',
  'TRUCKS',
  'SUV',
  'SUVS',
  'BUS',
  'BUSES'
])

const isVehicleCategory = (category?: string | null): boolean => {
  if (!category) {
    return false
  }

  const normalized = category.trim().toUpperCase()
  return VEHICLE_CATEGORY_MARKERS.has(normalized)
}

const isVehiclePartNumber = (partNumber?: string | null): boolean => {
  if (!partNumber) {
    return false
  }

  return partNumber.trim().toUpperCase().startsWith('VEH-')
}

export const isVehicleInventoryItem = (
  partNumber?: string | null,
  category?: string | null
) => isVehiclePartNumber(partNumber) || isVehicleCategory(category)

const PART_CATEGORY_VALUES = new Set<string>(Object.values(PartCategory))

const normalizePartCategory = (category?: string | null): PartCategory => {
  if (!category) {
    return PartCategory.OTHER
  }

  const normalized = category.replace(/[-\s]+/g, '_').toUpperCase()
  if (PART_CATEGORY_VALUES.has(normalized)) {
    return normalized as PartCategory
  }

  return PartCategory.OTHER
}

const mapInventoryStatusToPartStatus = (
  status?: InventoryStatus | null
): PartStatus => {
  switch (status) {
    case InventoryStatus.LOW_STOCK:
      return PartStatus.LOW_STOCK
    case InventoryStatus.OUT_OF_STOCK:
      return PartStatus.OUT_OF_STOCK
    case InventoryStatus.DISCONTINUED:
      return PartStatus.RESERVED
    default:
      return PartStatus.AVAILABLE
  }
}

export interface InventorySnapshot {
  partNumber: string
  name: string
  description?: string | null
  category?: string | null
  quantity?: number | null
  minStockLevel?: number | null
  maxStockLevel?: number | null
  unitPrice?: number | null
  supplier?: string | null
  location?: string | null
  status?: InventoryStatus | null
}

export const syncMaintenancePartFromInventory = async (
  snapshot: InventorySnapshot,
  userId: string
) => {
  if (!snapshot.partNumber) {
    return
  }

  if (isVehicleInventoryItem(snapshot.partNumber, snapshot.category)) {
    await db.maintenancePart.deleteMany({
      where: { partNumber: snapshot.partNumber }
    })
    return
  }

  const existing = await db.maintenancePart.findUnique({
    where: { partNumber: snapshot.partNumber }
  })

  const unitPrice = typeof snapshot.unitPrice === 'number' ? snapshot.unitPrice : 0
  const quantity = typeof snapshot.quantity === 'number' ? snapshot.quantity : 0
  const minStock =
    typeof snapshot.minStockLevel === 'number' ? snapshot.minStockLevel : 0

  const baseData: Prisma.MaintenancePartUpdateInput = {
    name: snapshot.name || snapshot.partNumber,
    description: snapshot.description ?? undefined,
    category: normalizePartCategory(snapshot.category),
    quantity,
    minStock,
    maxStock: snapshot.maxStockLevel ?? undefined,
    location: snapshot.location ?? undefined,
    supplier: snapshot.supplier ?? undefined,
    status: mapInventoryStatusToPartStatus(snapshot.status)
  }

  if (existing) {
    const updateData: Prisma.MaintenancePartUpdateInput = {
      ...baseData
    }

    if (unitPrice > 0) {
      if (!existing.cost || existing.cost === 0) {
        updateData.cost = unitPrice
      }
      if (!existing.price || existing.price === 0) {
        updateData.price = unitPrice
      }
    }

    await db.maintenancePart.update({
      where: { id: existing.id },
      data: updateData
    })
    return existing.id
  }

  const createData: Prisma.MaintenancePartCreateInput = {
    partNumber: snapshot.partNumber,
    name: snapshot.name || snapshot.partNumber,
    description: snapshot.description ?? undefined,
    category: normalizePartCategory(snapshot.category),
    cost: unitPrice,
    price: unitPrice,
    quantity,
    minStock,
    maxStock: snapshot.maxStockLevel ?? undefined,
    location: snapshot.location ?? undefined,
    supplier: snapshot.supplier ?? undefined,
    status: mapInventoryStatusToPartStatus(snapshot.status),
    createdBy: userId
  }

  const created = await db.maintenancePart.create({ data: createData })
  return created.id
}

export const backfillMaintenancePartsFromInventory = async (userId: string) => {
  try {
    await db.maintenancePart.deleteMany({
      where: {
        partNumber: { startsWith: 'VEH-' }
      }
    })

    const [inventoryItems, existingParts] = await Promise.all([
      db.inventoryItem.findMany({
        select: {
          partNumber: true,
          name: true,
          description: true,
          category: true,
          quantity: true,
          minStockLevel: true,
          maxStockLevel: true,
          unitPrice: true,
          supplier: true,
          location: true,
          status: true
        }
      }),
      db.maintenancePart.findMany({
        select: { partNumber: true }
      })
    ])

    const existingPartNumbers = new Set(
      existingParts.map(part => part.partNumber)
    )

    const missingItems = inventoryItems.filter(
      item =>
        item.partNumber &&
        !existingPartNumbers.has(item.partNumber) &&
        !isVehicleInventoryItem(item.partNumber, item.category)
    )

    if (!missingItems.length) {
      return
    }

    await db.$transaction(
      missingItems.map(item =>
        db.maintenancePart.create({
          data: {
            partNumber: item.partNumber,
            name: item.name || item.partNumber,
            description: item.description ?? undefined,
            category: normalizePartCategory(item.category),
            cost:
              typeof item.unitPrice === 'number' && !Number.isNaN(item.unitPrice)
                ? item.unitPrice
                : 0,
            price:
              typeof item.unitPrice === 'number' && !Number.isNaN(item.unitPrice)
                ? item.unitPrice
                : 0,
            quantity:
              typeof item.quantity === 'number' && !Number.isNaN(item.quantity)
                ? item.quantity
                : 0,
            minStock:
              typeof item.minStockLevel === 'number' &&
              !Number.isNaN(item.minStockLevel)
                ? item.minStockLevel
                : 0,
            maxStock:
              typeof item.maxStockLevel === 'number' &&
              !Number.isNaN(item.maxStockLevel)
                ? item.maxStockLevel
                : undefined,
            location: item.location ?? undefined,
            supplier: item.supplier ?? undefined,
            status: mapInventoryStatusToPartStatus(item.status),
            createdBy: userId
          }
        })
      )
    )
  } catch (error) {
    console.error('Failed to backfill maintenance parts from inventory', error)
  }
}
