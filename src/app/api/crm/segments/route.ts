import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get customer segments with statistics
    const segments = [
      {
        id: 'vip',
        name: 'عملاء VIP',
        description: 'العملاء المميزون الذين لديهم إنفاق عالي وتفاعل مستمر',
        criteria: [
          'إجمالي الإنفاق > 50,000 جنيه',
          'عدد الحجوزات > 5',
          'نشط خلال آخر 3 أشهر'
        ]
      },
      {
        id: 'customer',
        name: 'عملاء حاليون',
        description: 'العملاء النشطون الذين لديهم حجوزات منتظمة',
        criteria: [
          'إجمالي الإنفاق بين 5,000 و 50,000 جنيه',
          'عدد الحجوزات بين 1 و 5',
          'نشط خلال آخر شهر'
        ]
      },
      {
        id: 'prospect',
        name: 'عملاء محتملون',
        description: 'العملاء الذين أبدوا اهتماماً ولكن لم يكملوا الشراء',
        criteria: [
          'تواصل مع الشركة',
          'لم يكتمل أي شراء',
          'نشط خلال آخر 30 يوماً'
        ]
      },
      {
        id: 'lead',
        name: 'عملاء محتملون جدد',
        description: 'العملاء الجدد الذين أبدوا اهتماماً للمرة الأولى',
        criteria: [
          'سجل جديد في النظام',
          'لم يكمل أي عملية',
          'انضم خلال آخر 7 أيام'
        ]
      },
      {
        id: 'inactive',
        name: 'عملاء غير نشطين',
        description: 'العملاء الذين لم يتفاعلوا خلال آخر 6 أشهر',
        criteria: [
          'لم يكن نشطاً خلال آخر 6 أشهر',
          'لا توجد حجوزات حديثة',
          'قد يحتاج إلى إعادة تفعيل'
        ]
      },
      {
        id: 'lost',
        name: 'عملاء فقدوا',
        description: 'العملاء الذين لم يتفاعلوا خلال آخر سنة',
        criteria: [
          'لم يكن نشطاً خلال آخر سنة',
          'لا توجد حجوزات منذ فترة طويلة',
          'قد يحتاج إلى حملة إعادة تفعيل'
        ]
      }
    ]

    // Calculate statistics for each segment
    const segmentsWithStats = await Promise.all(
      segments.map(async (segment) => {
        let whereClause: any = {}

        switch (segment.id) {
          case 'vip':
            whereClause = {
              AND: [
                { status: 'active' },
                { segment: 'VIP' },
                {
                  OR: [
                    {
                      bookings: {
                        some: {
                          totalPrice: { gte: 50000 }
                        }
                      }
                    },
                    {
                      bookings: {
                        some: {
                          date: { gte: new Date(Date.now() - 3 * 30 * 24 * 60 * 60 * 1000) }
                        }
                      }
                    }
                  ]
                }
              ]
            }
            break
          case 'customer':
            whereClause = {
              AND: [
                { status: 'active' },
                { segment: 'CUSTOMER' },
                {
                  bookings: {
                    some: {
                      date: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
                    }
                  }
                }
              ]
            }
            break
          case 'prospect':
            whereClause = {
              AND: [
                { status: 'prospect' },
                { segment: 'PROSPECT' },
                {
                  bookings: {
                    none: {
                      status: 'COMPLETED'
                    }
                  }
                }
              ]
            }
            break
          case 'lead':
            whereClause = {
              AND: [
                { status: 'prospect' },
                { segment: 'LEAD' },
                { createdAt: { gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } },
                {
                  bookings: {
                    none: {}
                  }
                }
              ]
            }
            break
          case 'inactive':
            whereClause = {
              AND: [
                { status: 'inactive' },
                { segment: 'INACTIVE' },
                {
                  bookings: {
                    none: {
                      date: { gte: new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000) }
                    }
                  }
                }
              ]
            }
            break
          case 'lost':
            whereClause = {
              AND: [
                { status: 'inactive' },
                { segment: 'LOST' },
                {
                  bookings: {
                    none: {
                      date: { gte: new Date(Date.now() - 12 * 30 * 24 * 60 * 60 * 1000) }
                    }
                  }
                }
              ]
            }
            break
        }

        const customers = await db.user.findMany({
          where: whereClause,
          include: {
            bookings: {
              select: {
                totalPrice: true
              }
            }
          }
        })

        const customerCount = customers.length
        const avgSpent = customerCount > 0 
          ? customers.reduce((sum, customer) => {
              const totalSpent = customer.bookings.reduce((bookingSum, booking) => 
                bookingSum + (booking.totalPrice || 0), 0
              )
              return sum + totalSpent
            }, 0) / customerCount
          : 0

        return {
          ...segment,
          customerCount,
          avgSpent
        }
      })
    )

    return NextResponse.json(segmentsWithStats)

  } catch (error) {
    console.error('Error fetching CRM segments:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}