import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { PermissionService } from '@/lib/permissions'
import { db } from '@/lib/db'
import { PermissionCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      )
    }

    // Check if user has permission to view permissions
    const hasPermission = await PermissionService.hasPermission(
      session.user.id,
      'view_permissions'
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية لعرض الصلاحيات' },
        { status: 403 }
      )
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
    // Remove sensitive information from logs
    return NextResponse.json(
      { error: 'فشل في جلب الصلاحيات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      )
    }

    // Check if user has permission to manage permissions
    const hasPermission = await PermissionService.hasPermission(
      session.user.id,
      'manage_permissions'
    )

    if (!hasPermission) {
      return NextResponse.json(
        { error: 'ليس لديك صلاحية لإدارة الصلاحيات' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, description, category } = body

    // Validate input
    if (!name || !category) {
      return NextResponse.json(
        { error: 'الاسم والفئة مطلوبان' },
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
    // Remove sensitive information from logs
    return NextResponse.json(
      { error: 'فشل في إنشاء الصلاحية' },
      { status: 500 }
    )
  }
}