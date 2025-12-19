import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

const arabicCategoryOrder: Record<string, number> = {
  ENGINE: 0,
  PERFORMANCE: 1,
  SAFETY: 2,
  INTERIOR: 3,
  EXTERIOR: 4,
  INFOTAINMENT: 5,
  DIMENSIONS: 6,
  COMFORT: 7
}

async function findVehicle(identifier: string) {
  const include = {
    images: {
      orderBy: { order: 'asc' }
    },
    specifications: {
      orderBy: [
        {
          category: 'asc'
        },
        {
          createdAt: 'asc'
        }
      ]
    },
    pricing: true
  } as const

  // Try by direct id first
  const byId = await db.vehicle.findUnique({
    where: { id: identifier },
    include
  })

  if (byId) {
    return byId
  }

  // Try by stock number
  const byStockNumber = await db.vehicle.findUnique({
    where: { stockNumber: identifier },
    include
  })

  if (byStockNumber) {
    return byStockNumber
  }

  // Fall back to model slug matching (e.g. "tiago" -> "Tata Tiago")
  const normalized = identifier.replace(/[-_]+/g, ' ').trim()

  if (!normalized) {
    return null
  }

  const byModel = await db.vehicle.findFirst({
    where: {
      OR: [
        { model: { equals: normalized, mode: 'insensitive' } },
        { model: { contains: normalized, mode: 'insensitive' } },
        { make: { contains: normalized, mode: 'insensitive' } }
      ],
      status: 'AVAILABLE'
    },
    orderBy: { createdAt: 'desc' },
    include
  })

  return byModel
}

function normaliseVehicle(vehicle: Awaited<ReturnType<typeof findVehicle>>) {
  if (!vehicle) {
    return null
  }

  const specifications = vehicle.specifications
    .map((spec) => ({
      id: spec.id,
      key: spec.key,
      label: spec.label,
      value: spec.value,
      category: spec.category,
      createdAt: spec.createdAt
    }))
    .sort((a, b) => {
      const categoryOrderA = arabicCategoryOrder[a.category] ?? 99
      const categoryOrderB = arabicCategoryOrder[b.category] ?? 99

      if (categoryOrderA !== categoryOrderB) {
        return categoryOrderA - categoryOrderB
      }

      return a.createdAt.getTime() - b.createdAt.getTime()
    })
    .map(({ createdAt, ...rest }) => rest)

  const pricing = vehicle.pricing
    ? {
      basePrice: Number(vehicle.pricing.basePrice),
      totalPrice: Number(vehicle.pricing.totalPrice),
      discountPrice:
        vehicle.pricing.discountPrice !== null && vehicle.pricing.discountPrice !== undefined
          ? Number(vehicle.pricing.discountPrice)
          : null,
      discountPercentage:
        vehicle.pricing.discountPercentage !== null && vehicle.pricing.discountPercentage !== undefined
          ? Number(vehicle.pricing.discountPercentage)
          : null,
      taxes: Number(vehicle.pricing.taxes ?? 0),
      fees: Number(vehicle.pricing.fees ?? 0),
      currency: vehicle.pricing.currency,
      hasDiscount: vehicle.pricing.hasDiscount,
      discountExpires: vehicle.pricing.discountExpires?.toISOString() ?? null
    }
    : null

  return {
    id: vehicle.id,
    make: vehicle.make,
    model: vehicle.model,
    year: vehicle.year,
    price: Number(vehicle.price),
    stockNumber: vehicle.stockNumber,
    vin: vehicle.vin,
    category: vehicle.category,
    fuelType: vehicle.fuelType,
    transmission: vehicle.transmission,
    mileage: vehicle.mileage ?? null,
    color: vehicle.color ?? null,
    description: vehicle.description ?? '',
    status: vehicle.status,
    featured: vehicle.featured,
    images:
      vehicle.images.length > 0
        ? vehicle.images.map((image) => ({
          id: image.id,
          imageUrl: image.imageUrl,
          altText: image.altText,
          isPrimary: image.isPrimary,
          order: image.order
        }))
        : [
          {
            id: 'placeholder',
            imageUrl: '/placeholder-car.jpg',
            altText: `${vehicle.make} ${vehicle.model}`,
            isPrimary: true,
            order: 0
          }
        ],
    specifications,
    pricing
  }
}

export async function GET(request: NextRequest, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const identifier = decodeURIComponent(params.id)

  if (!identifier) {
    return NextResponse.json({ error: 'Vehicle identifier is required' }, { status: 400 })
  }

  try {
    const vehicle = await findVehicle(identifier)

    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const normalised = normaliseVehicle(vehicle)

    return NextResponse.json({ vehicle: normalised })
  } catch (error) {
    console.error('Error fetching public vehicle details:', error)
    return NextResponse.json({ error: 'فشل في جلب تفاصيل المركبة' }, { status: 500 })
  }
}
