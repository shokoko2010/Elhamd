import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || new Date().toISOString().slice(0, 7)
    
    const performanceMetrics = await db.performanceMetric.findMany({
      where: {
        period: period
      },
      include: {
        employee: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
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
        overallScore: 'desc'
      }
    })

    return NextResponse.json({
      success: true,
      data: performanceMetrics,
      period: period,
      count: performanceMetrics.length
    })
  } catch (error) {
    console.error('Error fetching performance data:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات تقييم الأداء' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const employees = await db.employee.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
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

    // Create sample performance metrics for each employee
    const currentPeriod = new Date().toISOString().slice(0, 7) // YYYY-MM
    
    for (const employee of employees) {
      await db.performanceMetric.upsert({
        where: {
          employeeId_period: {
            employeeId: employee.id,
            period: currentPeriod
          }
        },
        update: {
          bookingsHandled: Math.floor(Math.random() * 50) + 10,
          averageHandlingTime: Math.random() * 30 + 15,
          customerRating: 3 + Math.random() * 2,
          conversionRate: Math.random() * 40 + 10,
          revenueGenerated: Math.random() * 50000 + 10000,
          tasksCompleted: Math.floor(Math.random() * 30) + 20,
          customerSatisfaction: 80 + Math.random() * 20,
          responseTime: Math.random() * 60 + 5,
          followUpRate: Math.random() * 30 + 60,
          upsellSuccess: Math.random() * 25 + 5,
          overallScore: 70 + Math.random() * 30,
          notes: 'تقييم أداء تلقائي'
        },
        create: {
          employeeId: employee.id,
          period: currentPeriod,
          bookingsHandled: Math.floor(Math.random() * 50) + 10,
          averageHandlingTime: Math.random() * 30 + 15,
          customerRating: 3 + Math.random() * 2,
          conversionRate: Math.random() * 40 + 10,
          revenueGenerated: Math.random() * 50000 + 10000,
          tasksCompleted: Math.floor(Math.random() * 30) + 20,
          customerSatisfaction: 80 + Math.random() * 20,
          responseTime: Math.random() * 60 + 5,
          followUpRate: Math.random() * 30 + 60,
          upsellSuccess: Math.random() * 25 + 5,
          overallScore: 70 + Math.random() * 30,
          notes: 'تقييم أداء تلقائي'
        }
      })
    }

    return NextResponse.json({
      success: true,
      message: 'تم إنشاء بيانات تقييم الأداء بنجاح',
      metricsCount: employees.length
    })
  } catch (error) {
    console.error('Error creating performance data:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء إنشاء بيانات تقييم الأداء' },
      { status: 500 }
    )
  }
}