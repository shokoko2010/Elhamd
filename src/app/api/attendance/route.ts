import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const date = searchParams.get('date')
    const employeeId = searchParams.get('employeeId')

    const where: any = {}
    
    if (date) {
      where.date = new Date(date)
    }
    
    if (employeeId) {
      where.employeeId = employeeId
    }

    // For now, generate attendance records based on employees
    // In a real implementation, this would query a dedicated attendance table
    const employees = await db.employee.findMany({
      where: employeeId ? { userId: employeeId } : {},
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        },
        position: {
          select: {
            id: true,
            title: true
          }
        }
      }
    })

    // Generate attendance records
    const attendanceRecords = employees.map((emp) => {
      const random = Math.random()
      let status: 'PRESENT' | 'LATE' | 'ABSENT' | 'ON_LEAVE'
      let checkIn: string | undefined
      let checkOut: string | undefined
      
      if (random < 0.85) {
        status = 'PRESENT'
        checkIn = '07:' + String(Math.floor(Math.random() * 30) + 30).padStart(2, '0')
        checkOut = '16:' + String(Math.floor(Math.random() * 30)).padStart(2, '0')
      } else if (random < 0.92) {
        status = 'LATE'
        checkIn = '08:' + String(Math.floor(Math.random() * 30) + 1).padStart(2, '0')
        checkOut = '16:' + String(Math.floor(Math.random() * 30)).padStart(2, '0')
      } else if (random < 0.96) {
        status = 'ON_LEAVE'
      } else {
        status = 'ABSENT'
      }
      
      return {
        id: emp.id,
        employeeId: emp.id,
        employee: {
          user: {
            name: emp.user.name
          },
          department: emp.department?.name || 'غير محدد'
        },
        checkIn,
        checkOut,
        date: date || new Date().toISOString().split('T')[0],
        status,
        notes: status === 'LATE' ? 'تأخير بسبب الازدحام' : undefined
      }
    })

    return NextResponse.json(attendanceRecords)
  } catch (error) {
    console.error('Error fetching attendance records:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب سجلات الحضور والانصراف' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, checkIn, checkOut, date, status, notes } = body

    // Validate required fields
    if (!employeeId || !date || !status) {
      return NextResponse.json(
        { error: 'البيانات المطلوبة غير مكتملة' },
        { status: 400 }
      )
    }

    // Check if employee exists
    const employee = await db.employee.findUnique({
      where: { id: employeeId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!employee) {
      return NextResponse.json(
        { error: 'الموظف غير موجود' },
        { status: 404 }
      )
    }

    // Create attendance record (this would be saved to a database table in a real implementation)
    const attendanceRecord = {
      id: `att_${Date.now()}`,
      employeeId,
      employee: {
        user: {
          name: employee.user.name
        },
        department: employee.department?.name || 'غير محدد'
      },
      checkIn,
      checkOut,
      date,
      status,
      notes
    }

    return NextResponse.json(attendanceRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating attendance record:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء سجل الحضور والانصراف' },
      { status: 500 }
    )
  }
}