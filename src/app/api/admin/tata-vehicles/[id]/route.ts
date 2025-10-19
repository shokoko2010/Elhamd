import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'
import { z } from 'zod'

// Schema for vehicle update
const vehicleUpdateSchema = z.object({
  model: z.string().min(1).optional(),
  year: z.number().min(1900).max(2030).optional(),
  price: z.number().min(0).optional(),
  description: z.string().optional(),
  category: z.enum(['SEDAN', 'SUV', 'HATCHBACK', 'TRUCK', 'VAN', 'COMMERCIAL', 'BUS', 'PICKUP', 'HEAVY_COMMERCIAL', 'LIGHT_COMMERCIAL']).optional(),
  fuelType: z.enum(['PETROL', 'DIESEL', 'ELECTRIC', 'HYBRID', 'CNG']).optional(),
  transmission: z.enum(['MANUAL', 'AUTOMATIC', 'CVT']).optional(),
  mileage: z.number().optional(),
  color: z.string().optional(),
  status: z.enum(['AVAILABLE', 'SOLD', 'RESERVED', 'MAINTENANCE']).optional(),
  featured: z.boolean().optional(),
  branchId: z.string().optional(),
  specifications: z.array(z.object({
    key: z.string(),
    label: z.string(),
    value: z.string(),
    category: z.enum(['ENGINE', 'EXTERIOR', 'INTERIOR', 'SAFETY', 'TECHNOLOGY']).default('ENGINE')
  })).optional(),
  images: z.array(z.object({
    id: z.string().optional(),
    imageUrl: z.string().url(),
    altText: z.string().optional(),
    isPrimary: z.boolean().default(false),
    order: z.number().default(0)
  })).optional(),
  pricing: z.object({
    basePrice: z.number().min(0),
    discountPrice: z.number().optional(),
    discountPercentage: z.number().optional(),
    taxes: z.number().default(0),
    fees: z.number().default(0),
    currency: z.string().default('EGP')
  }).optional()
})

// GET /api/admin/tata-vehicles/[id] - Get specific Tata vehicle
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = user.role === 'SUPER_ADMIN' || 
                         user.role === 'ADMIN' || 
                         user.role === 'BRANCH_MANAGER' ||
                         user.customPermissions?.VEHICLE_MANAGEMENT?.['vehicles.read']

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const vehicle = await db.vehicle.findFirst({
      where: {
        id: params.id,
        make: 'Tata Motors'
      },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        specifications: {
          orderBy: { category: 'asc' }
        },
        pricing: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    return NextResponse.json({ vehicle })

  } catch (error) {
    console.error('Error fetching Tata vehicle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PUT /api/admin/tata-vehicles/[id] - Update Tata vehicle
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = user.role === 'SUPER_ADMIN' || 
                         user.role === 'ADMIN' || 
                         user.role === 'BRANCH_MANAGER' ||
                         user.customPermissions?.VEHICLE_MANAGEMENT?.['vehicles.update']

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if vehicle exists and is a Tata vehicle
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        id: params.id,
        make: 'Tata Motors'
      }
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const body = await request.json()
    const validatedData = vehicleUpdateSchema.parse(body)

    // Update vehicle basic info
    const updateData: any = {}
    if (validatedData.model !== undefined) updateData.model = validatedData.model
    if (validatedData.year !== undefined) updateData.year = validatedData.year
    if (validatedData.price !== undefined) updateData.price = validatedData.price
    if (validatedData.description !== undefined) updateData.description = validatedData.description
    if (validatedData.category !== undefined) updateData.category = validatedData.category
    if (validatedData.fuelType !== undefined) updateData.fuelType = validatedData.fuelType
    if (validatedData.transmission !== undefined) updateData.transmission = validatedData.transmission
    if (validatedData.mileage !== undefined) updateData.mileage = validatedData.mileage
    if (validatedData.color !== undefined) updateData.color = validatedData.color
    if (validatedData.status !== undefined) updateData.status = validatedData.status
    if (validatedData.featured !== undefined) updateData.featured = validatedData.featured
    if (validatedData.branchId !== undefined) updateData.branchId = validatedData.branchId

    if (Object.keys(updateData).length > 0) {
      await db.vehicle.update({
        where: { id: params.id },
        data: updateData
      })
    }

    // Update specifications if provided
    if (validatedData.specifications !== undefined) {
      // Delete existing specifications
      await db.vehicleSpecification.deleteMany({
        where: { vehicleId: params.id }
      })

      // Create new specifications
      if (validatedData.specifications.length > 0) {
        await db.vehicleSpecification.createMany({
          data: validatedData.specifications.map(spec => ({
            vehicleId: params.id,
            key: spec.key,
            label: spec.label,
            value: spec.value,
            category: spec.category
          }))
        })
      }
    }

    // Update images if provided
    if (validatedData.images !== undefined) {
      // Delete existing images
      await db.vehicleImage.deleteMany({
        where: { vehicleId: params.id }
      })

      // Create new images
      if (validatedData.images.length > 0) {
        await db.vehicleImage.createMany({
          data: validatedData.images.map((image, index) => ({
            vehicleId: params.id,
            imageUrl: image.imageUrl,
            altText: image.altText || `${existingVehicle.model} - Image ${index + 1}`,
            isPrimary: image.isPrimary || index === 0,
            order: image.order || index
          }))
        })
      }
    }

    // Update pricing if provided
    if (validatedData.pricing !== undefined) {
      await db.vehiclePricing.upsert({
        where: { vehicleId: params.id },
        update: {
          basePrice: validatedData.pricing.basePrice,
          discountPrice: validatedData.pricing.discountPrice,
          discountPercentage: validatedData.pricing.discountPercentage,
          taxes: validatedData.pricing.taxes,
          fees: validatedData.pricing.fees,
          totalPrice: validatedData.pricing.basePrice + validatedData.pricing.taxes + validatedData.pricing.fees - (validatedData.pricing.discountPrice || 0),
          currency: validatedData.pricing.currency
        },
        create: {
          vehicleId: params.id,
          basePrice: validatedData.pricing.basePrice,
          discountPrice: validatedData.pricing.discountPrice,
          discountPercentage: validatedData.pricing.discountPercentage,
          taxes: validatedData.pricing.taxes,
          fees: validatedData.pricing.fees,
          totalPrice: validatedData.pricing.basePrice + validatedData.pricing.taxes + validatedData.pricing.fees - (validatedData.pricing.discountPrice || 0),
          currency: validatedData.pricing.currency
        }
      })
    }

    // Fetch the updated vehicle with all relations
    const updatedVehicle = await db.vehicle.findUnique({
      where: { id: params.id },
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        specifications: {
          orderBy: { category: 'asc' }
        },
        pricing: true,
        branch: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      }
    })

    return NextResponse.json({ vehicle: updatedVehicle })

  } catch (error) {
    console.error('Error updating Tata vehicle:', error)
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid data', details: error.errors }, { status: 400 })
    }
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// DELETE /api/admin/tata-vehicles/[id] - Delete Tata vehicle
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permissions
    const hasPermission = user.role === 'SUPER_ADMIN' || 
                         user.role === 'ADMIN' ||
                         user.customPermissions?.VEHICLE_MANAGEMENT?.['vehicles.delete']

    if (!hasPermission) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if vehicle exists and is a Tata vehicle
    const existingVehicle = await db.vehicle.findFirst({
      where: {
        id: params.id,
        make: 'Tata Motors'
      }
    })

    if (!existingVehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    // Delete vehicle (cascade will handle related records)
    await db.vehicle.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Vehicle deleted successfully' })

  } catch (error) {
    console.error('Error deleting Tata vehicle:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}