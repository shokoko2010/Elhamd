import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { shouldFallbackToEmptyResult } from '@/lib/prisma-error-helpers'

export async function GET(request: NextRequest) {
  try {
    const departments = await db.department.findMany({
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json(departments)
  } catch (error) {
    console.error('Error fetching departments:', error)
    if (shouldFallbackToEmptyResult(error)) {
      return NextResponse.json([])
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الأقسام' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description } = body

    if (!name || name.trim().length < 2) {
      return NextResponse.json(
        { error: 'اسم القسم مطلوب ويجب أن يكون حرفين على الأقل' },
        { status: 400 }
      )
    }

    // Check if department already exists
    const existingDepartment = await db.department.findFirst({
      where: { name: name.trim() }
    })

    if (existingDepartment) {
      return NextResponse.json(
        { error: 'هذا القسم موجود بالفعل' },
        { status: 400 }
      )
    }

    const department = await db.department.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null
      }
    })

    return NextResponse.json(department, { status: 201 })
  } catch (error) {
    console.error('Error creating department:', error)
    if (shouldFallbackToEmptyResult(error)) {
      return NextResponse.json(
        { error: 'مخزن الأقسام غير مهيأ بعد. يرجى تشغيل آخر تحديثات قاعدة البيانات.' },
        { status: 503 }
      )
    }
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء القسم' },
      { status: 500 }
    )
  }
}