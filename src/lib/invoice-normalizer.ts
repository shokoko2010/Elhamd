import { TaxType } from '@prisma/client'

const roundCurrency = (value: number) => {
  if (!Number.isFinite(value)) {
    return 0
  }
  return Math.round(value * 100) / 100
}

const sanitizeNumber = (value: unknown): number => {
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : 0
  }

  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9.-]+/g, '')
    if (!normalized) {
      return 0
    }

    const parsed = Number.parseFloat(normalized)
    return Number.isFinite(parsed) ? parsed : 0
  }

  if (typeof value === 'bigint') {
    return Number(value)
  }

  return 0
}

export interface InvoiceItemInput {
  id?: string
  description?: string
  quantity?: number | string
  unitPrice?: number | string
  totalPrice?: number | string
  taxRate?: number | string
  taxAmount?: number | string
  metadata?: Record<string, unknown> | null
}

export interface NormalizedInvoiceItem {
  id?: string
  description: string
  quantity: number
  unitPrice: number
  totalPrice: number
  taxRate: number
  taxAmount: number
  metadata: Record<string, unknown> | null
}

export interface NormalizedInvoiceTax {
  id?: string
  taxType: TaxType
  rate: number
  taxAmount: number
  description: string
}

export interface NormalizedInvoiceTotals {
  subtotal: number
  taxAmount: number
  totalAmount: number
  breakdown: NormalizedInvoiceTax[]
}

export const normalizeInvoiceItemsFromInput = (
  items: InvoiceItemInput[] | undefined | null
): { items: NormalizedInvoiceItem[]; totals: NormalizedInvoiceTotals } => {
  const safeItems = Array.isArray(items) ? items : []

  const normalizedItems: NormalizedInvoiceItem[] = safeItems.map(item => {
    const quantity = sanitizeNumber(item.quantity) || 0
    const unitPrice = sanitizeNumber(item.unitPrice) || 0
    const explicitTotalPrice = sanitizeNumber(item.totalPrice)
    const totalPrice = explicitTotalPrice > 0 ? explicitTotalPrice : quantity * unitPrice

    const taxRate = sanitizeNumber(item.taxRate)
    const explicitTaxAmount = sanitizeNumber(item.taxAmount)
    const taxAmount = explicitTaxAmount > 0 ? explicitTaxAmount : totalPrice * (taxRate / 100)

    return {
      id: item.id,
      description: item.description ?? '',
      quantity: roundCurrency(quantity),
      unitPrice: roundCurrency(unitPrice),
      totalPrice: roundCurrency(totalPrice),
      taxRate: roundCurrency(taxRate),
      taxAmount: roundCurrency(taxAmount),
      metadata: item.metadata ?? null,
    }
  })

  const subtotal = roundCurrency(
    normalizedItems.reduce((sum, item) => sum + item.totalPrice, 0)
  )
  const taxAmount = roundCurrency(
    normalizedItems.reduce((sum, item) => sum + item.taxAmount, 0)
  )
  const totalAmount = roundCurrency(subtotal + taxAmount)

  const breakdownMap = new Map<string, NormalizedInvoiceTax>()
  normalizedItems.forEach(item => {
    if (item.taxRate <= 0 || item.taxAmount <= 0) {
      return
    }

    const key = item.taxRate.toFixed(4)
    const existing = breakdownMap.get(key)

    if (existing) {
      existing.taxAmount = roundCurrency(existing.taxAmount + item.taxAmount)
    } else {
      breakdownMap.set(key, {
        taxType: TaxType.VAT,
        rate: item.taxRate,
        taxAmount: roundCurrency(item.taxAmount),
        description: `ضريبة بنسبة ${item.taxRate}%`,
      })
    }
  })

  const breakdown = Array.from(breakdownMap.values())

  return {
    items: normalizedItems,
    totals: {
      subtotal,
      taxAmount,
      totalAmount,
      breakdown,
    },
  }
}

interface InvoiceRecordLike {
  subtotal?: number | string | null
  taxAmount?: number | string | null
  totalAmount?: number | string | null
  paidAmount?: number | string | null
  items?: InvoiceItemInput[]
  taxes?: Array<{
    id?: string
    taxType?: TaxType | null
    rate?: number | string | null
    taxAmount?: number | string | null
    description?: string | null
  }>
}

export interface NormalizedInvoiceRecord {
  subtotal: number
  taxAmount: number
  totalAmount: number
  paidAmount: number
  outstanding: number
  items: NormalizedInvoiceItem[]
  taxes: NormalizedInvoiceTax[]
  needsNormalization: boolean
}

export const normalizeInvoiceRecord = (
  invoice: InvoiceRecordLike
): NormalizedInvoiceRecord => {
  const { items, totals } = normalizeInvoiceItemsFromInput(invoice.items)

  const subtotalFromRecord = roundCurrency(sanitizeNumber(invoice.subtotal))
  const taxAmountFromRecord = roundCurrency(sanitizeNumber(invoice.taxAmount))
  const totalAmountFromRecord = roundCurrency(sanitizeNumber(invoice.totalAmount))
  const paidAmount = roundCurrency(sanitizeNumber(invoice.paidAmount))

  let subtotal = totals.subtotal > 0 ? totals.subtotal : subtotalFromRecord
  if (subtotal === 0 && subtotalFromRecord > 0) {
    subtotal = subtotalFromRecord
  }

  const existingTaxes = Array.isArray(invoice.taxes)
    ? invoice.taxes.map(tax => ({
        id: tax.id,
        taxType: tax.taxType ?? TaxType.VAT,
        rate: roundCurrency(sanitizeNumber(tax.rate)),
        taxAmount: roundCurrency(sanitizeNumber(tax.taxAmount)),
        description: tax.description ?? '',
      }))
    : []

  const existingTaxesTotal = roundCurrency(
    existingTaxes.reduce((sum, tax) => sum + tax.taxAmount, 0)
  )

  let taxes: NormalizedInvoiceTax[] = existingTaxes
  let taxAmount = totals.taxAmount

  if (taxAmount <= 0) {
    if (existingTaxesTotal > 0) {
      taxAmount = existingTaxesTotal
    } else if (taxAmountFromRecord > 0) {
      taxAmount = taxAmountFromRecord
    }
  }

  if (
    totals.breakdown.length > 0 &&
    Math.abs(taxAmount - totals.taxAmount) > 0.01
  ) {
    taxes = totals.breakdown.map(entry => {
      const match = existingTaxes.find(
        tax => Math.abs(tax.rate - entry.rate) < 0.0001
      )

      return {
        id: match?.id,
        taxType: match?.taxType ?? entry.taxType,
        rate: entry.rate,
        taxAmount: roundCurrency(entry.taxAmount),
        description: match?.description || entry.description,
      }
    })
    taxAmount = roundCurrency(
      taxes.reduce((sum, tax) => sum + tax.taxAmount, 0)
    )
  }

  if (taxAmount <= 0) {
    taxAmount = roundCurrency(existingTaxesTotal || taxAmountFromRecord)
  }

  const computedTotal = roundCurrency(subtotal + taxAmount)
  let totalAmount = computedTotal
  if (totalAmountFromRecord > 0) {
    totalAmount = Math.abs(totalAmountFromRecord - computedTotal) > 0.01
      ? computedTotal
      : totalAmountFromRecord
  }

  const outstanding = roundCurrency(Math.max(totalAmount - paidAmount, 0))

  const needsNormalization =
    Math.abs(subtotalFromRecord - subtotal) > 0.01 ||
    Math.abs(taxAmountFromRecord - taxAmount) > 0.01 ||
    Math.abs(totalAmountFromRecord - totalAmount) > 0.01 ||
    Math.abs(existingTaxesTotal - taxAmount) > 0.01

  return {
    subtotal,
    taxAmount,
    totalAmount,
    paidAmount,
    outstanding,
    items,
    taxes,
    needsNormalization,
  }
}

export const applyInvoiceNormalization = <T extends InvoiceRecordLike>(
  invoice: T
) => {
  const normalized = normalizeInvoiceRecord(invoice)

  return {
    normalized,
    updatePayload: normalized.needsNormalization
      ? {
          subtotal: normalized.subtotal,
          taxAmount: normalized.taxAmount,
          totalAmount: normalized.totalAmount,
        }
      : null,
  }
}

export const sumInvoices = <T extends InvoiceRecordLike>(
  invoices: T[]
): { totalAmount: number; totalPaid: number; outstanding: number } => {
  return invoices.reduce(
    (acc, invoice) => {
      const normalized = normalizeInvoiceRecord(invoice)
      acc.totalAmount = roundCurrency(acc.totalAmount + normalized.totalAmount)
      acc.totalPaid = roundCurrency(
        acc.totalPaid + normalized.totalAmount - normalized.outstanding
      )
      acc.outstanding = roundCurrency(
        acc.outstanding + normalized.outstanding
      )
      return acc
    },
    { totalAmount: 0, totalPaid: 0, outstanding: 0 }
  )
}

