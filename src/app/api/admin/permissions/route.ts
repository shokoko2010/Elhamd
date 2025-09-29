interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { PermissionCategory } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
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
    const body = await request.json()
    const { name, description, category } = body

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