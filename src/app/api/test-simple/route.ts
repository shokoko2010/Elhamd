import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test database connection
    const userCount = await db.user.count()
    const employeeCount = await db.employee.count()
    const departmentCount = await db.department.count()
    
    console.log('✅ Database connection successful')
    console.log(`📊 Users: ${userCount}, Employees: ${employeeCount}, Departments: ${departmentCount}`)
    
    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      data: {
        userCount,
        employeeCount,
        departmentCount
      }
    })
  } catch (error) {
    console.error('❌ Database connection error:', error)
    return NextResponse.json(
      { 
        error: 'Database connection failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  try {
    console.log('🚀 Starting data initialization...')
    
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
          title_departmentId: {
            title: 'مدير مبيعات',
            departmentId: departments[0].id 
          }
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
          title_departmentId: {
            title: 'مندوب مبيعات',
            departmentId: departments[0].id 
          }
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
          title_departmentId: {
            title: 'مدير موارد بشرية',
            departmentId: departments[1].id 
          }
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
          title_departmentId: {
            title: 'محاسب',
            departmentId: departments[2].id 
          }
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
          title_departmentId: {
            title: 'مدير خدمة عملاء',
            departmentId: departments[3].id 
          }
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
        const user = await db.user.upsert({
          where: { email: emp.email },
          update: {},
          create: {
            name: emp.name,
            email: emp.email,
            phone: emp.phone,
            password: 'password123', // Plain text for development
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
    return NextResponse.json(
      { 
        error: 'حدث خطأ أثناء تهيئة البيانات',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}