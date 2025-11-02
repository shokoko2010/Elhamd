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
        create: { 
          name: 'المبيعات', 
          description: 'قسم المبيعات',
          isActive: true
        }
      }),
      db.department.upsert({
        where: { name: 'التسويق' },
        update: {},
        create: { 
          name: 'التسويق', 
          description: 'قسم التسويق',
          isActive: true
        }
      }),
      db.department.upsert({
        where: { name: 'المالية' },
        update: {},
        create: { 
          name: 'المالية', 
          description: 'قسم المحاسبة والمالية',
          isActive: true
        }
      }),
      db.department.upsert({
        where: { name: 'الموارد البشرية' },
        update: {},
        create: { 
          name: 'الموارد البشرية', 
          description: 'قسم الموارد البشرية',
          isActive: true
        }
      }),
      db.department.upsert({
        where: { name: 'خدمة العملاء' },
        update: {},
        create: { 
          name: 'خدمة العملاء', 
          description: 'قسم خدمة العملاء',
          isActive: true
        }
      })
    ])

    // Create sample positions
    const positions = await Promise.all([
      // المبيعات
      db.position.upsert({
        where: { 
          title: 'مدير مبيعات',
          departmentId: departments[0].id 
        },
        update: {},
        create: { 
          title: 'مدير مبيعات',
          departmentId: departments[0].id,
          level: 'SENIOR',
          description: 'مدير قسم المبيعات',
          isActive: true
        }
      }),
      db.position.upsert({
        where: { 
          title: 'مندوب مبيعات',
          departmentId: departments[0].id 
        },
        update: {},
        create: { 
          title: 'مندوب مبيعات',
          departmentId: departments[0].id,
          level: 'MID',
          description: 'مندوب مبيعات',
          isActive: true
        }
      }),
      // التسويق
      db.position.upsert({
        where: { 
          title: 'مندوب مبيعات',
          departmentId: departments[1].id 
        },
        update: {},
        create: { 
          title: 'مندوب مبيعات',
          departmentId: departments[1].id,
          level: 'MID',
          description: 'مندوب تسويق',
          isActive: true
        }
      }),
      // المالية
      db.position.upsert({
        where: { 
          title: 'محاسب',
          departmentId: departments[2].id 
        },
        update: {},
        create: { 
          title: 'محاسب',
          departmentId: departments[2].id,
          level: 'MID',
          description: 'محاسب',
          isActive: true
        }
      }),
      // الموارد البشرية
      db.position.upsert({
        where: { 
          title: 'موظف موارد بشرية',
          departmentId: departments[3].id 
        },
        update: {},
        create: { 
          title: 'موظف موارد بشرية',
          departmentId: departments[3].id,
          level: 'MID',
          description: 'موظف موارد بشرية',
          isActive: true
        }
      }),
      // خدمة العملاء
      db.position.upsert({
        where: { 
          title: 'مدير خدمة عملاء',
          departmentId: departments[4].id 
        },
        update: {},
        create: { 
          title: 'مدير خدمة عملاء',
          departmentId: departments[4].id,
          level: 'SENIOR',
          description: 'مدير خدمة عملاء',
          isActive: true
        }
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
          role: 'STAFF',
          isActive: true
        }
      })

      // Create employee
      const employeeCount = await db.employee.count()
      const employeeNumber = `EMP${String(employeeCount + createdEmployees.length + 1).padStart(4, '0')}`
      
      const employee = await db.employee.upsert({
        where: { userId: user.id },
        update: {
          departmentId: departments[emp.departmentIndex].id,
          positionId: positions[emp.positionIndex].id,
          salary: emp.salary,
          hireDate: new Date(),
          status: 'ACTIVE'
        },
        create: {
          userId: user.id,
          employeeNumber,
          departmentId: departments[emp.departmentIndex].id,
          positionId: positions[emp.positionIndex].id,
          salary: emp.salary,
          hireDate: new Date(),
          status: 'ACTIVE'
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