import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

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

    const payrollRecords = await db.payrollRecord.findMany({
      where: { employeeId: user.employee.id },
      orderBy: { period: 'desc' },
      take: 12 // Last 12 months
    })

    return NextResponse.json(payrollRecords)
  } catch (error) {
    console.error('Error fetching payroll records:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب سجلات الرواتب' },
      { status: 500 }
    )
  }
}