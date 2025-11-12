import { db } from '@/lib/db'
import {
  Invoice,
  InvoiceStatus,
  InventoryItem,
  InventoryStatus,
  PaymentMethod,
  Vehicle,
  VehicleStatus,
} from '@prisma/client'
import type {
  NormalizedInvoiceItem,
  NormalizedInvoiceTotals,
} from '@/lib/invoice-normalizer'

export type InvoiceItemLinkType = 'SERVICE' | 'PART' | 'VEHICLE'

export interface InvoiceItemLink {
  normalized: NormalizedInvoiceItem
  type: InvoiceItemLinkType
  inventoryItemId?: string
  vehicleId?: string
}

const parseMetadataString = (value: unknown | undefined | null): string | undefined => {
  if (typeof value === 'string' && value.trim().length > 0) {
    return value
  }

  return undefined
}

const toPlainMetadata = (value: unknown): Record<string, unknown> => {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }

  return {}
}

export const extractInvoiceItemLinks = (
  items: NormalizedInvoiceItem[]
): {
  links: InvoiceItemLink[]
  inventoryIds: string[]
  vehicleIds: string[]
} => {
  const inventoryIds = new Set<string>()
  const vehicleIds = new Set<string>()

  const links = items.map<InvoiceItemLink>((normalized) => {
    const metadata = toPlainMetadata(normalized.metadata)

    const rawType = (metadata.itemType ?? metadata.type ?? metadata.category)
    let type: InvoiceItemLinkType = 'SERVICE'
    if (typeof rawType === 'string') {
      const upper = rawType.toUpperCase()
      if (upper === 'PART' || upper === 'VEHICLE' || upper === 'SERVICE') {
        type = upper
      }
    }

    const inventoryItemId = parseMetadataString(metadata.inventoryItemId)
    const vehicleId = parseMetadataString(metadata.vehicleId)

    if (type !== 'SERVICE') {
      if (type === 'PART' && inventoryItemId) {
        inventoryIds.add(inventoryItemId)
      }

      if (type === 'VEHICLE' && vehicleId) {
        vehicleIds.add(vehicleId)
      }
    } else if (!type && inventoryItemId) {
      // Fallback: if metadata only includes inventory reference treat it as PART
      inventoryIds.add(inventoryItemId)
      type = 'PART'
    } else if (!type && vehicleId) {
      vehicleIds.add(vehicleId)
      type = 'VEHICLE'
    }

    return {
      normalized,
      type,
      inventoryItemId,
      vehicleId,
    }
  })

  return {
    links,
    inventoryIds: Array.from(inventoryIds),
    vehicleIds: Array.from(vehicleIds),
  }
}

const ensureInventoryStatus = (item: InventoryItem, quantity: number): InventoryStatus => {
  if (item.status === InventoryStatus.DISCONTINUED) {
    return InventoryStatus.DISCONTINUED
  }

  if (quantity <= 0) {
    return InventoryStatus.OUT_OF_STOCK
  }

  if (quantity <= item.minStockLevel) {
    return InventoryStatus.LOW_STOCK
  }

  return InventoryStatus.IN_STOCK
}

const mergeInvoiceMetadata = (
  invoice: Invoice,
  updates: Record<string, unknown>
): Record<string, unknown> => {
  const existing = toPlainMetadata(invoice.metadata ?? {})
  return {
    ...existing,
    ...updates,
  }
}

export const applyInvoiceSideEffects = async (
  options: {
    invoice: Invoice
    links: InvoiceItemLink[]
    inventoryMap: Map<string, InventoryItem>
    vehicleMap: Map<string, Vehicle>
    totals: NormalizedInvoiceTotals
    adjustInventory: boolean
  }
) => {
  const { invoice, links, inventoryMap, vehicleMap, totals, adjustInventory } = options

  const nowIso = new Date().toISOString()
  const inventoryUpdates: Array<Promise<unknown>> = []

  for (const link of links) {
    if (link.type === 'PART' && link.inventoryItemId) {
      if (!adjustInventory) {
        continue
      }

      const inventoryItem = inventoryMap.get(link.inventoryItemId)
      if (!inventoryItem) {
        continue
      }

      const quantityToDeduct = Math.max(0, Math.round(link.normalized.quantity))
      if (quantityToDeduct <= 0) {
        continue
      }

      const newQuantity = Math.max(0, inventoryItem.quantity - quantityToDeduct)
      const newStatus = ensureInventoryStatus(inventoryItem, newQuantity)

      inventoryUpdates.push(
        db.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQuantity,
            status: newStatus,
            updatedAt: new Date(),
          },
        })
      )
    }

    if (link.type === 'VEHICLE' && link.vehicleId) {
      const vehicle = vehicleMap.get(link.vehicleId)
      if (!vehicle) {
        continue
      }

      const newStatus = invoice.status === InvoiceStatus.PAID
        ? VehicleStatus.SOLD
        : VehicleStatus.RESERVED

      inventoryUpdates.push(
        db.vehicle.update({
          where: { id: vehicle.id },
          data: {
            status: newStatus,
            updatedAt: new Date(),
          },
        })
      )
    }
  }

  if (inventoryUpdates.length > 0) {
    await Promise.all(inventoryUpdates)
  }

  const saleReferenceId = `SALE-${invoice.id}`
  const saleCategory = invoice.status === InvoiceStatus.PAID ? 'SALES' : 'SALES_PIPELINE'

  await db.transaction.upsert({
    where: { referenceId: saleReferenceId },
    update: {
      amount: totals.totalAmount,
      category: saleCategory,
      currency: invoice.currency,
      description: `عمولة بيع الفاتورة ${invoice.invoiceNumber}`,
      date: invoice.issueDate,
      metadata: {
        source: 'INVOICE',
        invoiceStatus: invoice.status,
        invoiceId: invoice.id,
        updatedAt: nowIso,
      },
    },
    create: {
      referenceId: saleReferenceId,
      branchId: invoice.branchId ?? undefined,
      type: 'INCOME',
      category: saleCategory,
      amount: totals.totalAmount,
      currency: invoice.currency,
      description: `عمولة بيع الفاتورة ${invoice.invoiceNumber}`,
      date: invoice.issueDate,
      paymentMethod: PaymentMethod.CASH,
      customerId: invoice.customerId,
      invoiceId: invoice.id,
      metadata: {
        source: 'INVOICE',
        invoiceStatus: invoice.status,
        createdAt: nowIso,
      },
    },
  })

  const metadataUpdates: Record<string, unknown> = {
    saleStatus: invoice.status,
    saleStatusUpdatedAt: nowIso,
  }

  if (adjustInventory) {
    metadataUpdates.inventoryAdjusted = true
    metadataUpdates.inventoryAdjustedAt = nowIso
    metadataUpdates.inventoryRestored = false
    metadataUpdates.inventoryRestoredAt = null
  }

  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      metadata: mergeInvoiceMetadata(invoice, metadataUpdates),
      updatedAt: new Date(),
    },
  })
}

export const releaseInvoiceSideEffects = async (
  options: {
    invoice: Invoice
    links: InvoiceItemLink[]
    inventoryMap: Map<string, InventoryItem>
    vehicleMap: Map<string, Vehicle>
  }
) => {
  const { invoice, links, inventoryMap, vehicleMap } = options
  const nowIso = new Date().toISOString()
  const updates: Array<Promise<unknown>> = []

  for (const link of links) {
    if (link.type === 'PART' && link.inventoryItemId) {
      const inventoryItem = inventoryMap.get(link.inventoryItemId)
      if (!inventoryItem) {
        continue
      }

      const quantityToRestore = Math.max(0, Math.round(link.normalized.quantity))
      if (quantityToRestore <= 0) {
        continue
      }

      const newQuantity = inventoryItem.quantity + quantityToRestore
      const newStatus = ensureInventoryStatus(inventoryItem, newQuantity)

      updates.push(
        db.inventoryItem.update({
          where: { id: inventoryItem.id },
          data: {
            quantity: newQuantity,
            status: newStatus,
            updatedAt: new Date(),
          },
        })
      )
    }

    if (link.type === 'VEHICLE' && link.vehicleId) {
      const vehicle = vehicleMap.get(link.vehicleId)
      if (!vehicle) {
        continue
      }

      if (vehicle.status !== VehicleStatus.SOLD) {
        updates.push(
          db.vehicle.update({
            where: { id: vehicle.id },
            data: {
              status: VehicleStatus.AVAILABLE,
              updatedAt: new Date(),
            },
          })
        )
      }
    }
  }

  if (updates.length) {
    await Promise.all(updates)
  }

  await db.invoice.update({
    where: { id: invoice.id },
    data: {
      metadata: mergeInvoiceMetadata(invoice, {
        saleStatus: invoice.status,
        saleStatusUpdatedAt: nowIso,
        inventoryAdjusted: false,
        inventoryRestored: true,
        inventoryRestoredAt: nowIso,
      }),
      updatedAt: new Date(),
    },
  })
}
