interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get company info from database
    const companyInfo = await db.companyInfo.findFirst({
      where: { isActive: true }
    })
    
    if (!companyInfo) {
      // Return default company info if none exists
      return NextResponse.json({
        id: 'default',
        title: 'مرحباً بك في الحمد للسيارات',
        subtitle: 'الوكيل الرسمي المعتمد لسيارات تاتا في مصر',
        description: 'نحن فخورون بتمثيل علامة تاتا التجارية في مصر، حيث نقدم لكم أحدث الموديلات مع ضمان الجودة الأصلي وخدمة ما بعد البيع المتميزة.',
        imageUrl: '/uploads/showroom-luxury.jpg',
        features: [
          'أحدث موديلات تاتا 2024',
          'ضمان المصنع لمدة 3 سنوات',
          'خدمة صيانة على مدار الساعة',
          'تمويل سيارات بأفضل الأسعار'
        ],
        ctaButtons: [
          { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
          { text: 'قيادة تجريبية', link: '/test-drive', variant: 'secondary' }
        ],
        isActive: true
      })
    }

    return NextResponse.json(companyInfo)
  } catch (error) {
    console.error('Error fetching company info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company info' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const adminUser = await db.session.user.findUnique({
      where: { id: session.session.user.id }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Update or create company info
    const existingInfo = await db.companyInfo.findFirst()
    
    if (existingInfo) {
      const updatedInfo = await db.companyInfo.update({
        where: { id: existingInfo.id },
        data
      })
      return NextResponse.json(updatedInfo)
    } else {
      const newInfo = await db.companyInfo.create({
        data
      })
      return NextResponse.json(newInfo)
    }
  } catch (error) {
    console.error('Error updating company info:', error)
    return NextResponse.json(
      { error: 'Failed to update company info' },
      { status: 500 }
    )
  }
}