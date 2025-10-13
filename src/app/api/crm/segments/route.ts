interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'ADMIN') {
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
        // For now, return placeholder data since the complex queries need proper relations
        const customerCount = Math.floor(Math.random() * 100) + 10
        const avgSpent = Math.floor(Math.random() * 50000) + 5000

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