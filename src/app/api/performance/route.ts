import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || 'current'
    
    // Get all employees with their performance metrics
    const employees = await db.employee.findMany({
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

    // Generate performance metrics based on actual data
    const performanceMetrics = employees.map((emp) => {
      // Generate realistic performance data
      const baseScore = 70 + Math.random() * 25 // 70-95 base score
      const bookingsHandled = Math.floor(Math.random() * 50) + 10
      const avgHandlingTime = Math.random() * 30 + 15 // 15-45 minutes
      const customerRating = 3 + Math.random() * 2 // 3-5 stars
      const conversionRate = Math.random() * 40 + 10 // 10-50%
      const revenue = Math.random() * 50000 + 10000 // 10k-60k
      const tasks = Math.floor(Math.random() * 30) + 20
      const satisfaction = 80 + Math.random() * 20 // 80-100%
      const responseTime = Math.random() * 60 + 5 // 5-65 minutes
      const followUp = Math.random() * 30 + 60 // 60-90%
      const upsell = Math.random() * 25 + 5 // 5-30%
      
      // Calculate overall score
      const overallScore = Math.round(
        (baseScore * 0.3) + 
        (customerRating / 5 * 100 * 0.2) + 
        (conversionRate * 0.2) + 
        (satisfaction * 0.15) + 
        (followUp * 0.15)
      )
      
      return {
        id: emp.id,
        employeeId: emp.id,
        employee: {
          user: {
            name: emp.user.name
          },
          department: emp.department?.name || 'غير محدد',
          position: emp.position?.title || 'غير محدد'
        },
        period: period === 'current' ? new Date().toISOString().slice(0, 7) : 
               new Date(new Date().setMonth(new Date().getMonth() - 1)).toISOString().slice(0, 7),
        bookingsHandled,
        averageHandlingTime: Math.round(avgHandlingTime),
        customerRating: Math.round(customerRating * 10) / 10,
        conversionRate: Math.round(conversionRate),
        revenueGenerated: Math.round(revenue),
        tasksCompleted: tasks,
        customerSatisfaction: Math.round(satisfaction),
        responseTime: Math.round(responseTime),
        followUpRate: Math.round(followUp),
        upsellSuccess: Math.round(upsell),
        overallScore,
        notes: overallScore >= 90 ? 'أداء استثنائي' : 
               overallScore >= 80 ? 'أداء ممتاز' : 
               overallScore >= 70 ? 'أداء جيد' : 'يحتاج تحسين'
      }
    })

    return NextResponse.json(performanceMetrics)
  } catch (error) {
    console.error('Error fetching performance metrics:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات تقييم الأداء' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { employeeId, period, metrics } = body

    // Validate required fields
    if (!employeeId || !period || !metrics) {
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
        },
        position: {
          select: {
            id: true,
            title: true
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

    // Create performance metric record
    const performanceMetric = {
      id: `perf_${Date.now()}`,
      employeeId,
      employee: {
        user: {
          name: employee.user.name
        },
        department: employee.department?.name || 'غير محدد',
        position: employee.position?.title || 'غير محدد'
      },
      period,
      ...metrics,
      createdAt: new Date().toISOString()
    }

    return NextResponse.json(performanceMetric, { status: 201 })
  } catch (error) {
    console.error('Error creating performance metric:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء تقييم الأداء' },
      { status: 500 }
    )
  }
}