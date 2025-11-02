import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    // Create sample departments
    const departments = await Promise.all([
      db.department.upsert({
        where: { name: 'المبيعات' },
        update: {},
        create: { name: 'المبيعات' }
      }),
      db.department.upsert({
        where: { name: 'التسويق' },
        update: {},
        create: { name: 'التسويق' }
      }),
      db.department.upsert({
        where: { name: 'المالية' },
        update: {},
        create: { name: 'المالية' }
      }),
      db.department.upsert({
        where: { name: 'الموارد البشرية' },
        update: {},
        create: { name: 'الموارد البشرية' }
      }),
      db.department.upsert({
        where: { name: 'خدمة العملاء' },
        update: {},
        create: { name: 'خدمة العملاء' }
      })
    ])

    // Create sample positions
    const positions = await Promise.all([
      db.position.upsert({
        where: { title: 'مدير مبيعات' },
        update: {},
        create: { title: 'مدير مبيعات' }
      }),
      db.position.upsert({
        where: { title: 'مندوب مبيعات' },
        update: {},
        create: { title: 'مندوب مبيعات' }
      }),
      db.position.upsert({
        where: { title: 'محاسب' },
        update: {},
        create: { title: 'محاسب' }
      }),
      db.position.upsert({
        where: { title: 'موظف موارد بشرية' },
        update: {},
        create: { title: 'موظف موارد بشرية' }
      }),
      db.position.upsert({
        where: { title: 'مدير خدمة عملاء' },
        update: {},
        create: { title: 'مدير خدمة عملاء' }
      })
    ])

    // Create sample users and employees
    const sampleEmployees = [
      {
        name: 'أحمد محمد',
        email: 'ahmed@example.com',
        phone: '01234567890',
        departmentIndex: 0,
        positionIndex: 0,
        salary: 15000
      },
      {
        name: 'محمد علي',
        email: 'mohammed@example.com',
        phone: '01234567891',
        departmentIndex: 0,
        positionIndex: 1,
        salary: 8000
      },
      {
        name: 'فاطمة أحمد',
        email: 'fatima@example.com',
        phone: '01234567892',
        departmentIndex: 1,
        positionIndex: 1,
        salary: 7500
      },
      {
        name: 'عبدالله خالد',
        email: 'abdullah@example.com',
        phone: '01234567893',
        departmentIndex: 2,
        positionIndex: 2,
        salary: 12000
      },
      {
        name: 'مريم سالم',
        email: 'mariam@example.com',
        phone: '01234567894',
        departmentIndex: 3,
        positionIndex: 3,
        salary: 10000
      }
    ]

    const createdEmployees = []

    for (const emp of sampleEmployees) {
      // Create user
      const hashedPassword = await bcrypt.hash('password123', 10)
      const user = await db.user.upsert({
        where: { email: emp.email },
        update: {},
        create: {
          name: emp.name,
          email: emp.email,
          phone: emp.phone,
          password: hashedPassword,
          role: 'EMPLOYEE',
          isActive: true
        }
      })

      // Create employee
      const employee = await db.employee.upsert({
        where: { userId: user.id },
        update: {
          departmentId: departments[emp.departmentIndex].id,
          positionId: positions[emp.positionIndex].id,
          salary: emp.salary,
          hireDate: new Date(),
          isActive: true
        },
        create: {
          userId: user.id,
          departmentId: departments[emp.departmentIndex].id,
          positionId: positions[emp.positionIndex].id,
          salary: emp.salary,
          hireDate: new Date(),
          isActive: true
        }
      })

      createdEmployees.push(employee)
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء بيانات تجريبية للموظفين بنجاح',
      employees: createdEmployees.length
    })
  } catch (error) {
    console.error('Error creating sample data:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء البيانات التجريبية' },
      { status: 500 }
    )
  }
}