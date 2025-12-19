interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'

export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const authenticatedUser = await getAuthUser()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: authenticatedUser.id },
    })

    if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const quotation = await db.quotation.findUnique({
      where: { id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    // Check branch permissions
    if (user.role === UserRole.BRANCH_MANAGER && user.branchId && quotation.customer.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Attempt to enrich with vehicle data if present in metadata or items
    let quotationWithVehicle: any = { ...quotation }
    let vehicleId = (quotation.metadata as any)?.vehicleId

    // Fallback: Check if any item is linked to a vehicle
    if (!vehicleId && quotation.items && quotation.items.length > 0) {
      const vehicleItem = quotation.items.find((item: any) =>
        (item.metadata as any)?.type === 'vehicle' && (item.metadata as any)?.vehicleId
      )
      if (vehicleItem) {
        vehicleId = (vehicleItem.metadata as any).vehicleId
      }
    }

    if (vehicleId) {
      const vehicle = await db.vehicle.findUnique({
        where: { id: vehicleId },
        include: {
          images: true,
          specifications: true
        }
      })
      if (vehicle) {
        quotationWithVehicle.vehicle = vehicle

        // Inject root fields as specifications if they don't exist
        if (!quotationWithVehicle.vehicle.specifications) {
          quotationWithVehicle.vehicle.specifications = []
        }

        const standardSpecs = [
          { key: 'root_year', label: 'الموديل (Year)', value: vehicle.year?.toString(), category: 'CHASSIS' },
          { key: 'root_fuel', label: 'نوع الوقود (Fuel Type)', value: vehicle.fuelType, category: 'ENGINE' },
          { key: 'root_transmission', label: 'ناقل الحركة (Transmission)', value: vehicle.transmission, category: 'TRANSMISSION' },
          { key: 'root_color', label: 'اللون (Color)', value: vehicle.color, category: 'EXTERIOR' },
          { key: 'root_mileage', label: 'المسافة (Mileage)', value: vehicle.mileage ? `${vehicle.mileage} KM` : 'New', category: 'PERFORMANCE' },
          { key: 'root_vin', label: 'رقم الشاسيه (VIN)', value: vehicle.vin, category: 'CHASSIS' },
          { key: 'root_stock', label: 'رقم المخزون (Stock No)', value: vehicle.stockNumber, category: 'CHASSIS' }
        ]

        standardSpecs.forEach(stdSpec => {
          if (stdSpec.value) {
            quotationWithVehicle.vehicle.specifications.push({
              key: stdSpec.key,
              label: stdSpec.label,
              value: stdSpec.value,
              category: stdSpec.category
            })
          }
        })
      }
    }

    return NextResponse.json(quotationWithVehicle)
  } catch (error: any) {
    console.error('Error fetching quotation:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const authenticatedUser = await getAuthUser()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: authenticatedUser.id },
    })

    if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { status, notes, terms, items } = body

    // Check if quotation exists and user has access
    const existingQuotation = await db.quotation.findUnique({
      where: { id },
      include: {
        customer: true
      }
    })

    if (!existingQuotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    // Check branch permissions
    if (user.role === UserRole.BRANCH_MANAGER && user.branchId && existingQuotation.customer.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Calculate new totals if items are updated
    let subtotal = existingQuotation.subtotal
    let taxAmount = existingQuotation.taxAmount
    let totalAmount = existingQuotation.totalAmount

    if (items && items.length > 0) {
      subtotal = items.reduce((sum: number, item: any) => sum + item.totalPrice, 0)
      taxAmount = items.reduce((sum: number, item: any) => sum + item.taxAmount, 0)
      totalAmount = subtotal + taxAmount
    }

    // Update quotation
    const updatedQuotation = await db.quotation.update({
      where: { id },
      data: {
        status: status || existingQuotation.status,
        notes: notes !== undefined ? notes : existingQuotation.notes,
        terms: terms !== undefined ? terms : existingQuotation.terms,
        subtotal,
        taxAmount,
        totalAmount,
        items: items ? {
          deleteMany: {},
          create: items.map((item: any) => ({
            description: item.description,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            totalPrice: item.totalPrice,
            taxRate: item.taxRate,
            taxAmount: item.taxAmount,
            metadata: item.metadata || {}
          }))
        } : undefined
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true
          }
        },
      }
    })

    // Manual vehicle fetch for update response if needed (omitted for brevity, update usually doesn't need full heavy object)
    // But to match GET, we just return what we have.
    // Use GET logic if full data is needed.

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'UPDATE_QUOTATION',
        entityType: 'QUOTATION',
        entityId: updatedQuotation.id,
        userId: user.id,
        details: {
          quotationNumber: updatedQuotation.quotationNumber,
          status: updatedQuotation.status,
          totalAmount: updatedQuotation.totalAmount
        }
      }
    })

    return NextResponse.json(updatedQuotation)
  } catch (error: any) {
    console.error('Error updating quotation:', error)
    return NextResponse.json(
      { error: `Internal server error: ${error.message}` },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const { id } = await context.params
    const authenticatedUser = await getAuthUser()

    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: authenticatedUser.id },
    })

    if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if quotation exists
    const quotation = await db.quotation.findUnique({
      where: { id },
      include: {
        customer: true
      }
    })

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    // Check if quotation can be deleted (only draft or expired quotations)
    if (!['DRAFT', 'EXPIRED', 'REJECTED'].includes(quotation.status)) {
      return NextResponse.json({
        error: 'Cannot delete quotation in current status'
      }, { status: 400 })
    }

    // Delete quotation items first
    await db.quotationItem.deleteMany({
      where: { quotationId: id }
    })

    // Delete quotation
    await db.quotation.delete({
      where: { id }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'DELETE_QUOTATION',
        entityType: 'QUOTATION',
        entityId: id,
        userId: user.id,
        details: {
          quotationNumber: quotation.quotationNumber,
          status: quotation.status
        }
      }
    })

    return NextResponse.json({ message: 'Quotation deleted successfully' })
  } catch (error) {
    console.error('Error deleting quotation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}