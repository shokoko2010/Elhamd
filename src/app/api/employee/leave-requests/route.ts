import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { LeaveStatus, LeaveType } from '@prisma/client'
import { z } from 'zod'

const createLeaveRequestSchema = z.object({
  leaveType: z.enum(['ANNUAL', 'SICK', 'MATERNITY', 'PATERNITY', 'UNPAID', 'EMERGENCY', 'STUDY']),
  startDate: z.string().transform((val) => new Date(val)),
  endDate: z.string().transform((val) => new Date(val)),
  reason: z.string().optional()
})

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true }
    })

    if (!user || !user.employee) {
      return NextResponse.json(
        { error: 'بيانات الموظف غير موجودة' },
        { status: 404 }
      )
    }

    const leaveRequests = await db.leaveRequest.findMany({
      where: { employeeId: user.employee.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(leaveRequests)
  } catch (error) {
    console.error('Error fetching leave requests:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب طلبات الإجازات' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'غير مصرح بالوصول' },
        { status: 401 }
      )
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { employee: true }
    })

    if (!user || !user.employee) {
      return NextResponse.json(
        { error: 'بيانات الموظف غير موجودة' },
        { status: 404 }
      )
    }

    const body = await request.json()
    const validatedData = createLeaveRequestSchema.parse(body)

    // Calculate total days
    const timeDiff = validatedData.endDate.getTime() - validatedData.startDate.getTime()
    const totalDays = Math.ceil(timeDiff / (1000 * 3600 * 24)) + 1

    if (totalDays <= 0) {
      return NextResponse.json(
        { error: 'تاريخ الانتهاء يجب أن يكون بعد تاريخ البدء' },
        { status: 400 }
      )
    }

    const leaveRequest = await db.leaveRequest.create({
      data: {
        employeeId: user.employee.id,
        leaveType: validatedData.leaveType as LeaveType,
        startDate: validatedData.startDate,
        endDate: validatedData.endDate,
        totalDays,
        reason: validatedData.reason,
        status: LeaveStatus.PENDING
      }
    })

    return NextResponse.json(leaveRequest, { status: 201 })
  } catch (error) {
    console.error('Error creating leave request:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء طلب الإجازة' },
      { status: 500 }
    )
  }
}