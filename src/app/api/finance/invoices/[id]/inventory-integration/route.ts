import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoiceId = params.id
    const body = await request.json()
    const { inventoryItems } = body

    if (!inventoryItems || !Array.isArray(inventoryItems)) {
      return NextResponse.json(
        { error: 'Inventory items array is required' },
        { status: 400 }
      )
    }

    // Get invoice details
    const invoice = await db.invoice.findUnique({
      where: { id: invoiceId },
      include: {
        items: true,
        customer: true
      }
    })

    if (!invoice) {
      return NextResponse.json(
        { error: 'Invoice not found' },
        { status: 404 }
      )
    }

    // Process each inventory item
    const processedItems = []
    const stockUpdates = []

    for (const item of inventoryItems) {
      const { inventoryItemId, quantity, unitPrice } = item

      if (!inventoryItemId || !quantity || !unitPrice) {
        return NextResponse.json(
          { error: 'Each inventory item must have inventoryItemId, quantity, and unitPrice' },
          { status: 400 }
        )
      }

      // Get inventory item
      const inventoryItem = await db.inventoryItem.findUnique({
        where: { id: inventoryItemId }
      })

      if (!inventoryItem) {
        return NextResponse.json(
          { error: `Inventory item ${inventoryItemId} not found` },
          { status: 404 }
        )
      }

      // Check if enough stock is available
      if (inventoryItem.quantity < quantity) {
        return NextResponse.json(
          { error: `Insufficient stock for item ${inventoryItem.name}. Available: ${inventoryItem.quantity}, Requested: ${quantity}` },
          { status: 400 }
        )
      }

      // Calculate new quantity
      const newQuantity = inventoryItem.quantity - quantity

      // Determine new status
      let newStatus = inventoryItem.status
      if (newQuantity === 0) {
        newStatus = 'out_of_stock'
      } else if (newQuantity <= (inventoryItem.minStockLevel || 0)) {
        newStatus = 'low_stock'
      } else {
        newStatus = 'in_stock'
      }

      // Prepare stock update
      stockUpdates.push({
        id: inventoryItemId,
        quantity: newQuantity,
        status: newStatus
      })

      // Prepare invoice item
      processedItems.push({
        invoiceId,
        description: `${inventoryItem.name} (${inventoryItem.partNumber})`,
        quantity,
        unitPrice,
        totalPrice: quantity * unitPrice,
        taxRate: 0, // Can be configured based on tax rules
        taxAmount: 0,
        metadata: {
          inventoryItemId,
          partNumber: inventoryItem.partNumber,
          originalStock: inventoryItem.quantity,
          quantityUsed: quantity,
          remainingStock: newQuantity,
          category: inventoryItem.category
        }
      })
    }

    // Update inventory stock
    await Promise.all(
      stockUpdates.map(update =>
        db.inventoryItem.update({
          where: { id: update.id },
          data: {
            quantity: update.quantity,
            status: update.status,
            updatedAt: new Date()
          }
        })
      )
    )

    // Add items to invoice
    const createdItems = await Promise.all(
      processedItems.map(item =>
        db.invoiceItem.create({
          data: item,
          include: {
            invoice: {
              select: {
                id: true,
                invoiceNumber: true
              }
            }
          }
        })
      )
    )

    // Update invoice totals with proper tax calculation
    const allItems = [...invoice.items, ...createdItems]
    const newSubtotal = allItems.reduce((sum, item) => sum + item.totalPrice, 0)
    
    // Get tax rates from database
    let taxRates = await db.taxRate.findMany({
      where: { isActive: true }
    })

    // Create default VAT rate if none exists
    if (taxRates.length === 0) {
      const defaultVAT = await db.taxRate.create({
        data: {
          name: 'ضريبة القيمة المضافة',
          type: 'STANDARD',
          rate: 14.0, // 14% VAT in Egypt
          description: 'ضريبة القيمة المضافة القياسية في مصر',
          isActive: true,
          effectiveFrom: new Date('2020-01-01')
        }
      })
      taxRates = [defaultVAT]
    }
    
    // Calculate total tax amount from all applicable tax rates
    const newTaxAmount = taxRates.reduce((sum, taxRate) => {
      return sum + (newSubtotal * taxRate.rate / 100)
    }, 0)
    
    const newTotalAmount = newSubtotal + newTaxAmount

    await db.invoice.update({
      where: { id: invoiceId },
      data: {
        subtotal: newSubtotal,
        taxAmount: newTaxAmount,
        totalAmount: newTotalAmount,
        updatedAt: new Date()
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'INTEGRATED_INVENTORY_WITH_INVOICE',
        entityType: 'INVOICE',
        entityId: invoiceId,
        userId: user.id,
        details: {
          invoiceNumber: invoice.invoiceNumber,
          itemsProcessed: processedItems.length,
          totalStockReduction: processedItems.reduce((sum, item) => sum + item.quantity, 0)
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Inventory items integrated successfully',
      items: createdItems,
      updatedInvoice: {
        subtotal: newSubtotal,
        taxAmount: newTaxAmount,
        totalAmount: newTotalAmount
      }
    })

  } catch (error) {
    console.error('Error integrating inventory with invoice:', error)
    return NextResponse.json(
      { error: 'Failed to integrate inventory with invoice' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const invoiceId = params.id

    // Get invoice items that have inventory integration
    const invoiceItems = await db.invoiceItem.findMany({
      where: {
        invoiceId,
        metadata: {
          path: ['inventoryItemId'],
          not: null
        }
      },
      include: {
        invoice: {
          select: {
            id: true,
            invoiceNumber: true,
            status: true
          }
        }
      }
    })

    // Get inventory details for each item
    const itemsWithInventory = await Promise.all(
      invoiceItems.map(async (item) => {
        const inventoryItemId = item.metadata?.inventoryItemId
        if (!inventoryItemId) return item

        const inventoryItem = await db.inventoryItem.findUnique({
          where: { id: inventoryItemId }
        })

        return {
          ...item,
          inventoryItem
        }
      })
    )

    return NextResponse.json({
      items: itemsWithInventory,
      total: itemsWithInventory.length
    })

  } catch (error) {
    console.error('Error fetching invoice inventory integration:', error)
    return NextResponse.json(
      { error: 'Failed to fetch invoice inventory integration' },
      { status: 500 }
    )
  }
}