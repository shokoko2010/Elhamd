import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/server-auth'
import { UserRole } from '@prisma/client'

/**
 * GET /api/admin/permissions
 * Retrieve permissions list. Only SUPER_ADMIN or users with the `manage_roles_templates` permission are allowed.
 */
export async function GET(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hasPermission = user.role === UserRole.SUPER_ADMIN || user.permissions?.includes('manage_roles_templates')
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const searchParams = new URL(request.url).searchParams
  const category = searchParams.get('category') || ''
  const where: any = {}
  if (category && category !== 'all') {
    where.category = category as any
  }
  const permissions = await db.permission.findMany({
    where,
    orderBy: {
      category: 'asc',
      name: 'asc',
    },
  })
  return NextResponse.json(permissions)
}

/**
 * POST /api/admin/permissions
 * Create a new permission. Only SUPER_ADMIN or users with the `manage_roles_templates` permission are allowed.
 */
export async function POST(request: NextRequest) {
  const user = await getAuthUser(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const hasPermission = user.role === UserRole.SUPER_ADMIN || user.permissions?.includes('manage_roles_templates')
  if (!hasPermission) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { name, description, category } = await request.json()
  // Avoid duplicates
  const existing = await db.permission.findUnique({ where: { name } })
  if (existing) {
    return NextResponse.json(existing)
  }
  const permission = await db.permission.create({
    data: {
      name,
      description,
      category,
    },
  })
  return NextResponse.json(permission)
}
