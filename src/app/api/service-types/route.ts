import { NextRequest, NextResponse } from 'next/server'
import { ServiceCategory, UserRole } from '@prisma/client'
import { db } from '@/lib/db'
import { authorize } from '@/lib/auth-server'
import { PERMISSIONS } from '@/lib/permissions'

const READ_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER]
const MANAGE_ROLES = [UserRole.ADMIN, UserRole.SUPER_ADMIN]

const isValidCategory = (value: unknown): value is ServiceCategory =>
  typeof value === 'string' && (Object.values(ServiceCategory) as string[]).includes(value)

const parsePositiveInteger = (value: unknown) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null
  }

  return Math.round(parsed)
}

const parseNonNegativeNumber = (value: unknown) => {
  const parsed = Number(value)
  if (!Number.isFinite(parsed) || parsed < 0) {
    return null
  }

  return Number(parsed.toFixed(2))
}

const normalizeService = (service: { [key: string]: any }) => ({
  id: service.id,
  name: service.name,
  description: service.description ?? '',
  duration: service.duration,
  price: service.price ?? 0,
  category: service.category,
  isActive: service.isActive
})

export async function GET(request: NextRequest) {
  const auth = await authorize(request, {
    roles: READ_ROLES,
    permissions: [PERMISSIONS.VIEW_SERVICES]
  })

  if ('error' in auth) {
    return auth.error
  }

  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''
    const active = searchParams.get('active') !== 'false'

    const where: Record<string, unknown> = {
      isActive: active
    }

    if (category && category !== 'all' && isValidCategory(category)) {
      where.category = category
    }

    const serviceTypes = await db.serviceType.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(serviceTypes.map(normalizeService))
  } catch (error) {
    console.error('Error fetching service types:', error)
    return NextResponse.json(
      { error: 'فشل في جلب أنواع الخدمات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await authorize(request, {
    roles: MANAGE_ROLES,
    permissions: [PERMISSIONS.CREATE_SERVICES]
  })

  if ('error' in auth) {
    return auth.error
  }

  try {
    const body = await request.json().catch(() => null)
    if (!body || typeof body !== 'object') {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const name = typeof (body as any).name === 'string' ? (body as any).name.trim() : ''
    const description = typeof (body as any).description === 'string' ? (body as any).description.trim() : ''
    const duration = parsePositiveInteger((body as any).duration)
    const price = parseNonNegativeNumber((body as any).price ?? 0)
    const category = (body as any).category
    const isActive = typeof (body as any).isActive === 'boolean' ? (body as any).isActive : true

    if (!name) {
      return NextResponse.json({ error: 'اسم الخدمة مطلوب' }, { status: 400 })
    }

    if (!duration) {
      return NextResponse.json({ error: 'مدة الخدمة يجب أن تكون رقمًا أكبر من صفر' }, { status: 400 })
    }

    if (price === null) {
      return NextResponse.json({ error: 'سعر الخدمة يجب أن يكون رقمًا صالحًا' }, { status: 400 })
    }

    if (!isValidCategory(category)) {
      return NextResponse.json({ error: 'فئة الخدمة غير صالحة' }, { status: 400 })
    }

    const service = await db.serviceType.create({
      data: {
        name,
        description,
        duration,
        price,
        category,
        isActive
      }
    })

    return NextResponse.json(normalizeService(service))
  } catch (error) {
    console.error('Error creating service type:', error)
    return NextResponse.json({ error: 'حدث خطأ أثناء إنشاء الخدمة' }, { status: 500 })
  }
}
