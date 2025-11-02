import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { AttendanceStatus } from '@prisma/client'

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

    const attendanceRecords = await db.attendanceRecord.findMany({
      where,
      include: {
        employee: {
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
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // If no records found for the date, create default records for all employees
    if (attendanceRecords.length === 0 && date) {
      const employees = await db.employee.findMany({
        where: employeeId ? { id: employeeId } : {},
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

      const defaultRecords = employees.map((emp) => ({
        id: `default_${emp.id}`,
        employeeId: emp.id,
        employee: {
          user: {
            name: emp.user.name
          },
          department: emp.department?.name || 'غير محدد',
          position: emp.position?.title || 'غير محدد'
        },
        checkIn: undefined,
        checkOut: undefined,
        date: date,
        status: 'ABSENT' as AttendanceStatus,
        notes: 'لم يتم تسجيل الحضور'
      }))

      return NextResponse.json(defaultRecords)
    }

    const formattedRecords = attendanceRecords.map((record) => ({
      id: record.id,
      employeeId: record.employeeId,
      employee: {
        user: {
          name: record.employee.user.name
        },
        department: record.employee.department?.name || 'غير محدد',
        position: record.employee.position?.title || 'غير محدد'
      },
      checkIn: record.checkIn ? record.checkIn.toTimeString().slice(0, 5) : undefined,
      checkOut: record.checkOut ? record.checkOut.toTimeString().slice(0, 5) : undefined,
      date: record.date.toISOString().split('T')[0],
      status: record.status,
      notes: record.notes
    }))

    return NextResponse.json(formattedRecords)
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

    // Create or update attendance record
    const attendanceRecord = await db.attendanceRecord.upsert({
      where: {
        employeeId_date: {
          employeeId,
          date: new Date(date)
        }
      },
      update: {
        checkIn: checkIn ? new Date(`${date}T${checkIn}`) : undefined,
        checkOut: checkOut ? new Date(`${date}T${checkOut}`) : undefined,
        status: status as AttendanceStatus,
        notes
      },
      create: {
        employeeId,
        date: new Date(date),
        checkIn: checkIn ? new Date(`${date}T${checkIn}`) : undefined,
        checkOut: checkOut ? new Date(`${date}T${checkOut}`) : undefined,
        status: status as AttendanceStatus,
        notes
      },
      include: {
        employee: {
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
        }
      }
    })

    const formattedRecord = {
      id: attendanceRecord.id,
      employeeId: attendanceRecord.employeeId,
      employee: {
        user: {
          name: attendanceRecord.employee.user.name
        },
        department: attendanceRecord.employee.department?.name || 'غير محدد'
      },
      checkIn: attendanceRecord.checkIn ? attendanceRecord.checkIn.toTimeString().slice(0, 5) : undefined,
      checkOut: attendanceRecord.checkOut ? attendanceRecord.checkOut.toTimeString().slice(0, 5) : undefined,
      date: attendanceRecord.date.toISOString().split('T')[0],
      status: attendanceRecord.status,
      notes: attendanceRecord.notes
    }

    return NextResponse.json(formattedRecord, { status: 201 })
  } catch (error) {
    console.error('Error creating attendance record:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء سجل الحضور والانصراف' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'معرف السجل مطلوب' },
        { status: 400 }
      )
    }

    await db.attendanceRecord.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting attendance record:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء حذف سجل الحضور والانصراف' },
      { status: 500 }
    )
  }
}