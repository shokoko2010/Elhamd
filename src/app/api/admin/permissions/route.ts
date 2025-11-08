interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PermissionCategory } from '@prisma/client'
import { getAuthUser } from '@/lib/auth-server'
import { PermissionService } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (user.role !== 'SUPER_ADMIN') {
      const hasPermission = await PermissionService.hasPermission(user.id, 'manage_system_settings')
      if (!hasPermission) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category') || ''

    const where: any = {}
    if (category && category !== 'all') {
      where.category = category as PermissionCategory
    }

    const permissions = await db.permission.findMany({
      where,
      orderBy: [
        { category: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json({ permissions })
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'فشل في جلب الصلاحيات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    if (user.role !== 'SUPER_ADMIN') {
      const hasPermission = await PermissionService.hasPermission(user.id, 'manage_system_settings')
      if (!hasPermission) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const body = await request.json()
    const { name, description, category } = body

    if (!name || typeof name !== 'string') {
      return NextResponse.json(
        { error: 'اسم الصلاحية مطلوب' },
        { status: 400 }
      )
    }

    if (!category || typeof category !== 'string') {
      return NextResponse.json(
        { error: 'فئة الصلاحية مطلوبة' },
        { status: 400 }
      )
    }

    // Check if permission already exists
    const existingPermission = await db.permission.findUnique({
      where: { name }
    })

    if (existingPermission) {
      return NextResponse.json(
        { error: 'الصلاحية موجودة بالفعل' },
        { status: 400 }
      )
    }

    // Create permission
    const permission = await db.permission.create({
      data: {
        name,
        description,
        category: category as PermissionCategory
      }
    })

    return NextResponse.json({ permission }, { status: 201 })
  } catch (error) {
    console.error('Error creating permission:', error)
    return NextResponse.json(
      { error: 'فشل في إنشاء الصلاحية' },
      { status: 500 }
    )
  }
}