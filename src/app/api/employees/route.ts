import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { EmployeeFinanceService } from '@/lib/employee-finance-service'
import { fetchEmployeeWithDetails } from '@/lib/employee-response'
import { UserRole, EmployeeStatus } from '@prisma/client'
import { z } from 'zod'

const optionalTrimmedString = z
  .string()
  .optional()
  .transform((val) => (val && val.trim().length > 0 ? val.trim() : undefined))

const createEmployeeSchema = z.object({
  name: z.string().min(2, 'الاسم يجب أن يكون حرفين على الأقل'),
  email: z.string().trim().email('البريد الإلكتروني غير صالح'),
  phone: optionalTrimmedString,
  department: z.string().min(1, 'القسم مطلوب'),
  position: z.string().min(1, 'المنصب مطلوب'),
  salary: z.string().transform((val) => parseFloat(val)).refine((val) => val > 0, 'الراتب يجب أن يكون أكبر من صفر'),
  branchId: z.string().optional(),
  emergencyContactName: optionalTrimmedString,
  emergencyContactPhone: optionalTrimmedString,
  emergencyContactRelationship: optionalTrimmedString,
  notes: optionalTrimmedString,
  bankAccount: optionalTrimmedString,
  taxNumber: optionalTrimmedString,
  insuranceNumber: optionalTrimmedString
})

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const branchId = searchParams.get('branchId')

    const where: any = {}

    if (department && department !== 'all') {
      // Search by department name through relation
      where.department = {
        name: department
      }
    }

    if (status && status !== 'all') {
      where.status = status as EmployeeStatus
    }

    if (branchId && branchId !== 'all') {
      where.branchId = branchId
    }

    const employees = await db.employee.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        branch: {
          select: {
            id: true,
            name: true
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
      },
      orderBy: {
        hireDate: 'desc'
      }
    })

    return NextResponse.json(employees)
  } catch (error) {
    console.error('Error fetching employees:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الموظفين' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedData = createEmployeeSchema.parse(body)

    // Check if email already exists
    const existingUser = await db.user.findUnique({
      where: { email: validatedData.email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'البريد الإلكتروني مستخدم بالفعل' },
        { status: 400 }
      )
    }

    // Generate employee number
    const employeeCount = await db.employee.count()
    const employeeNumber = `EMP${String(employeeCount + 1).padStart(4, '0')}`

    // Find or create department and position
    let department = await db.department.findFirst({
      where: { name: validatedData.department }
    })
    
    if (!department) {
      department = await db.department.create({
        data: {
          name: validatedData.department,
          description: `قسم ${validatedData.department}`,
          isActive: true
        }
      })
    }

    let position = await db.position.findFirst({
      where: { 
        title: validatedData.position,
        departmentId: department.id 
      }
    })
    
    if (!position) {
      position = await db.position.create({
        data: {
          title: validatedData.position,
          departmentId: department.id,
          level: 'JUNIOR',
          description: `منصب ${validatedData.position}`,
          isActive: true
        }
      })
    }

    // Create user first
    const user = await db.user.create({
      data: {
        name: validatedData.name,
        email: validatedData.email,
        phone: validatedData.phone,
        role: UserRole.STAFF,
        isActive: true
      }
    })

    // Create employee
    const accounts = await EmployeeFinanceService.setupEmployeeAccounts({
      employeeNumber,
      employeeName: validatedData.name,
      branchId: validatedData.branchId
    })

    const employee = await db.employee.create({
      data: {
        employeeNumber,
        userId: user.id,
        departmentId: department.id,
        positionId: position.id,
        salary: validatedData.salary,
        hireDate: new Date(),
        status: EmployeeStatus.ACTIVE,
        branchId: validatedData.branchId || null,
        emergencyContact: validatedData.emergencyContactName
          ? {
              name: validatedData.emergencyContactName,
              phone: validatedData.emergencyContactPhone || '',
              relationship: validatedData.emergencyContactRelationship || ''
            }
          : undefined,
        notes: validatedData.notes,
        bankAccount: validatedData.bankAccount,
        taxNumber: validatedData.taxNumber,
        insuranceNumber: validatedData.insuranceNumber,
        payrollExpenseAccountId: accounts.payrollExpenseAccountId,
        payrollLiabilityAccountId: accounts.payrollLiabilityAccountId
      }
    })

    const detailedEmployee = await fetchEmployeeWithDetails(employee.id)

    return NextResponse.json(detailedEmployee, { status: 201 })
  } catch (error) {
    console.error('Error creating employee:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء الموظف' },
      { status: 500 }
    )
  }
}