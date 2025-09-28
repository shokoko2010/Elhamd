import { NextRequest, NextResponse } from 'next/server'

interface Alert {
  id: string
  type: 'warning' | 'error' | 'info' | 'success'
  title: string
  description: string
  timestamp: string
  severity: 'low' | 'medium' | 'high'
}

export async function GET(request: NextRequest) {
  try {
    // Mock alerts data - in a real system, this would be generated based on actual business rules
    const alerts: Alert[] = [
      {
        id: '1',
        type: 'warning',
        title: 'انخفاض في الإيرادات',
        description: 'انخفضت الإيرادات بنسبة 15% هذا الأسبوع مقارنة بالأسبوع الماضي',
        timestamp: new Date().toISOString(),
        severity: 'medium'
      },
      {
        id: '2',
        type: 'error',
        title: 'زيادة في المصروفات',
        description: 'زادت مصروفات التسويق بنسبة 30% عن الميزانية المحددة',
        timestamp: new Date(Date.now() - 86400000).toISOString(),
        severity: 'high'
      },
      {
        id: '3',
        type: 'info',
        title: 'تحديث في أسعار الخدمات',
        description: 'تم تحديث أسعار بعض الخدمات بناءً على التكاليف الجديدة',
        timestamp: new Date(Date.now() - 172800000).toISOString(),
        severity: 'low'
      },
      {
        id: '4',
        type: 'success',
        title: 'تحقيق الأهداف',
        description: 'تم تحقيق هدف الإيرادات الشهرية بنسبة 105%',
        timestamp: new Date(Date.now() - 259200000).toISOString(),
        severity: 'low'
      },
      {
        id: '5',
        type: 'warning',
        title: 'انخفاض في عدد العملاء',
        description: 'انخفض عدد العملاء الجدد هذا الشهر بنسبة 8%',
        timestamp: new Date(Date.now() - 345600000).toISOString(),
        severity: 'medium'
      }
    ]

    return NextResponse.json({ alerts })
  } catch (error) {
    console.error('Error fetching alerts:', error)
    return NextResponse.json(
      { error: 'Failed to fetch alerts' },
      { status: 500 }
    )
  }
}