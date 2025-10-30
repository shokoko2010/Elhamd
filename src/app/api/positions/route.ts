import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const departmentId = searchParams.get('departmentId')

    const where: any = {}
    if (departmentId && departmentId !== 'all') {
      where.departmentId = departmentId
    }

    const positions = await db.position.findMany({
      where,
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      },
      orderBy: {
        title: 'asc'
      }
    })

    return NextResponse.json(positions)
  } catch (error) {
    console.error('Error fetching positions:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات المناصب' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { title, departmentId, level, description } = body

    if (!title || title.trim().length < 2) {
      return NextResponse.json(
        { error: 'عنوان المنصب مطلوب ويجب أن يكون حرفين على الأقل' },
        { status: 400 }
      )
    }

    if (!departmentId) {
      return NextResponse.json(
        { error: 'القسم مطلوب' },
        { status: 400 }
      )
    }

    // Check if department exists
    const department = await db.department.findUnique({
      where: { id: departmentId }
    })

    if (!department) {
      return NextResponse.json(
        { error: 'القسم المحدد غير موجود' },
        { status: 404 }
      )
    }

    // Check if position already exists in this department
    const existingPosition = await db.position.findFirst({
      where: {
        title: title.trim(),
        departmentId
      }
    })

    if (existingPosition) {
      return NextResponse.json(
        { error: 'هذا المنصب موجود بالفعل في هذا القسم' },
        { status: 400 }
      )
    }

    const position = await db.position.create({
      data: {
        title: title.trim(),
        departmentId,
        level: level?.trim() || 'JUNIOR',
        description: description?.trim() || null
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(position, { status: 201 })
  } catch (error) {
    console.error('Error creating position:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء المنصب' },
      { status: 500 }
    )
  }
}