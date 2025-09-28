import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

// Validation schemas
const specSchema = z.object({
  key: z.string().min(1, 'المفتاح مطلوب'),
  label: z.string().min(1, 'العلامة مطلوبة'),
  value: z.string().min(1, 'القيمة مطلوبة'),
  category: z.enum(['engine', 'exterior', 'interior', 'safety', 'technology']).default('engine')
})

const specsArraySchema = z.object({
  specifications: z.array(specSchema)
})

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/admin/vehicles/[id]/specs - Get vehicle specifications
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id: params.id }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    // Get specifications
    const specs = await db.vehicleSpecification.findMany({
      where: { vehicleId: params.id },
      orderBy: { category: 'asc' }
    })

    return NextResponse.json(specs)
  } catch (error) {
    console.error('Error fetching vehicle specifications:', error)
    return NextResponse.json(
      { error: 'فشل في جلب مواصفات المركبة' },
      { status: 500 }
    )
  }
}

// POST /api/admin/vehicles/[id]/specs - Add new specification
export async function POST(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id: params.id }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = specSchema.parse(body)

    // Create specification
    const spec = await db.vehicleSpecification.create({
      data: {
        ...validatedData,
        vehicleId: params.id
      }
    })

    return NextResponse.json(spec, { status: 201 })
  } catch (error) {
    console.error('Error creating vehicle specification:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'فشل في إضافة المواصفة' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/vehicles/[id]/specs - Update all specifications
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // Check authentication and authorization
    const user = await getAuthUser()
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json({ error: 'غير مصرح لك' }, { status: 401 })
    }

    // Check if vehicle exists
    const vehicle = await db.vehicle.findUnique({
      where: { id: params.id }
    })

    if (!vehicle) {
      return NextResponse.json(
        { error: 'المركبة غير موجودة' },
        { status: 404 }
      )
    }

    const body = await request.json()
    
    // Validate input
    const validatedData = specsArraySchema.parse(body)

    // Delete existing specifications
    await db.vehicleSpecification.deleteMany({
      where: { vehicleId: params.id }
    })

    // Create new specifications
    const specs = await db.vehicleSpecification.createMany({
      data: validatedData.specifications.map(spec => ({
        ...spec,
        vehicleId: params.id
      }))
    })

    // Get the created specifications
    const createdSpecs = await db.vehicleSpecification.findMany({
      where: { vehicleId: params.id },
      orderBy: { category: 'asc' }
    })

    return NextResponse.json(createdSpecs)
  } catch (error) {
    console.error('Error updating vehicle specifications:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.errors },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'فشل في تحديث المواصفات' },
      { status: 500 }
    )
  }
}