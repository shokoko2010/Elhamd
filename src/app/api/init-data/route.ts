import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Starting data initialization...')
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET'
    })

    // 1. Create departments if they don't exist
    console.log('📁 Creating departments...')
    const departments = await Promise.all([
      db.department.upsert({
        where: { name: 'المبيعات' },
        update: {},
        create: { 
          name: 'المبيعات', 
          description: 'قسم المبيعات والتسويق',
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
        where: { name: 'المالية' },
        update: {},
        create: { 
          name: 'المالية', 
          description: 'قسم المحاسبة والمالية',
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

    console.log(`✅ Departments created: ${departments.length}`)

    // 2. Create positions if they don't exist
    console.log('💼 Creating positions...')
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
      // الموارد البشرية
      db.position.upsert({
        where: { 
          title: 'مدير موارد بشرية',
          departmentId: departments[1].id 
        },
        update: {},
        create: { 
          title: 'مدير موارد بشرية',
          departmentId: departments[1].id,
          level: 'SENIOR',
          description: 'مدير قسم الموارد البشرية',
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
      // خدمة العملاء
      db.position.upsert({
        where: { 
          title: 'مدير خدمة عملاء',
          departmentId: departments[3].id 
        },
        update: {},
        create: { 
          title: 'مدير خدمة عملاء',
          departmentId: departments[3].id,
          level: 'SENIOR',
          description: 'مدير قسم خدمة العملاء',
          isActive: true
        }
      })
    ])

    console.log(`✅ Positions created: ${positions.length}`)

    // 3. Create sample employees
    console.log('👥 Creating sample employees...')
    const sampleEmployees = [
      {
        name: 'أحمد محمد',
        email: 'ahmed.sales@elhamd.com',
        phone: '01234567890',
        departmentIndex: 0,
        positionIndex: 0,
        salary: 15000
      },
      {
        name: 'محمد علي',
        email: 'mohammed.sales@elhamd.com',
        phone: '01234567891',
        departmentIndex: 0,
        positionIndex: 1,
        salary: 8000
      },
      {
        name: 'فاطمة أحمد',
        email: 'fatima.hr@elhamd.com',
        phone: '01234567892',
        departmentIndex: 1,
        positionIndex: 2,
        salary: 12000
      },
      {
        name: 'عبدالله خالد',
        email: 'abdullah.finance@elhamd.com',
        phone: '01234567893',
        departmentIndex: 2,
        positionIndex: 3,
        salary: 10000
      },
      {
        name: 'مريم سالم',
        email: 'mariam.service@elhamd.com',
        phone: '01234567894',
        departmentIndex: 3,
        positionIndex: 4,
        salary: 9000
      }
    ]

    const createdEmployees = []

    for (let i = 0; i < sampleEmployees.length; i++) {
      const emp = sampleEmployees[i]
      
      try {
        console.log(`👤 Creating employee ${i + 1}/${sampleEmployees.length}: ${emp.name}`)
        
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
            isActive: true,
            emailVerified: true
          }
        })

        // Create employee
        const employeeCount = await db.employee.count()
        const employeeNumber = `EMP${String(employeeCount + i + 1).padStart(4, '0')}`
        
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
        console.log(`✅ Created employee: ${emp.name}`)
      } catch (error) {
        console.error(`❌ Error creating employee ${emp.name}:`, error)
      }
    }

    // 4. Create sample leave requests
    if (createdEmployees.length > 0) {
      console.log('📅 Creating sample leave requests...')
      const currentPeriod = new Date().toISOString().slice(0, 7)
      
      for (let i = 0; i < Math.min(3, createdEmployees.length); i++) {
        try {
          const startDate = new Date()
          startDate.setDate(startDate.getDate() + (i * 5))
          const endDate = new Date(startDate)
          endDate.setDate(endDate.getDate() + 3)
          
          await db.leaveRequest.create({
            data: {
              employeeId: createdEmployees[i].id,
              leaveType: 'ANNUAL',
              startDate,
              endDate,
              totalDays: 3,
              reason: 'إجازة اعتيادية مخططة',
              status: 'PENDING'
            }
          })
          console.log(`✅ Created leave request for employee ${i + 1}`)
        } catch (error) {
          console.error('❌ Error creating leave request:', error)
        }
      }
    }

    console.log('🎉 Data initialization completed successfully!')
    return NextResponse.json({
      success: true,
      message: 'تم تهيئة البيانات الأولية بنجاح',
      departments: departments.length,
      positions: positions.length,
      employees: createdEmployees.length
    })
  } catch (error) {
    console.error('❌ Error initializing data:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء تهيئة البيانات',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}