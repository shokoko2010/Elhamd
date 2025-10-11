interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      make,
      model,
      year,
      price,
      type,
      status,
      mileage,
      fuelType,
      transmission,
      description,
      features
    } = body

    // Update vehicle
    const vehicle = await db.vehicle.update({
      where: { id },
      data: {
        make,
        model,
        year,
        price,
        description,
        category: type === 'used' ? 'USED' : 'NEW',
        fuelType,
        transmission,
        mileage: type === 'used' ? mileage || null : null,
        status: status.toUpperCase() as any
      }
    })

    // Update pricing
    await db.vehiclePricing.upsert({
      where: { vehicleId: id },
      update: {
        basePrice: price,
        totalPrice: price
      },
      create: {
        vehicleId: id,
        basePrice: price,
        totalPrice: price
      }
    })

    // Update specifications
    if (features && features.length > 0) {
      // Delete existing specifications
      await db.vehicleSpecification.deleteMany({
        where: { vehicleId: id }
      })

      // Create new specifications
      await db.vehicleSpecification.createMany({
        data: features.map((feature: string, index: number) => ({
          vehicleId: id,
          key: `feature_${index}`,
          label: 'Feature',
          value: feature,
          category: 'TECHNOLOGY'
        }))
      })
    }

    return NextResponse.json({
      id: vehicle.id,
      make: vehicle.make,
      model: vehicle.model,
      year: vehicle.year,
      price: vehicle.price,
      type: type,
      status: vehicle.status.toLowerCase(),
      mileage: vehicle.mileage,
      fuelType: vehicle.fuelType,
      transmission: vehicle.transmission,
      description: vehicle.description || '',
      images: [],
      features: features || [],
      stockNumber: vehicle.stockNumber
    })
  } catch (error) {
    console.error('Error updating vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to update vehicle' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    
    if (!user || (user.role !== 'STAFF' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Delete vehicle and related records
    await db.vehicle.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting vehicle:', error)
    return NextResponse.json(
      { error: 'Failed to delete vehicle' },
      { status: 500 }
    )
  }
}