import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get company features from database
    const companyFeatures = await db.companyFeature.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    
    if (companyFeatures.length === 0) {
      // Return default company features if none exist
      return NextResponse.json([
        {
          id: '1',
          title: 'تشكيلة واسعة',
          description: 'أحدث موديلات تاتا 2024 بمواصفات عالمية وأسعار تنافسية',
          icon: 'Car',
          color: 'blue',
          features: ['نيكسون • بانش • تياجو', 'تيغور • ألتروز • هارير'],
          order: 0,
          isActive: true
        },
        {
          id: '2',
          title: 'خدمة مميزة',
          description: 'فريق محترف من الفنيين المعتمدين وخدمة عملاء على مدار الساعة',
          icon: 'Wrench',
          color: 'orange',
          features: ['صيانة معتمدة', 'قطع غيار أصلية'],
          order: 1,
          isActive: true
        },
        {
          id: '3',
          title: 'تمويل سهل',
          description: 'خيارات تمويل مرنة وبنود سداد مريحة تناسب جميع الميزانيات',
          icon: 'Star',
          color: 'green',
          features: ['فوائد تنافسية', 'موافقات سريعة'],
          order: 2,
          isActive: true
        }
      ])
    }

    return NextResponse.json(companyFeatures)
  } catch (error) {
    console.error('Error fetching company features:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company features' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const user = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Delete all existing company features
    await db.companyFeature.deleteMany()

    // Create new company features
    const newFeatures = await db.companyFeature.createMany({
      data: data.map((feature: any) => ({
        title: feature.title,
        description: feature.description,
        icon: feature.icon,
        color: feature.color,
        features: feature.features,
        order: feature.order,
        isActive: feature.isActive
      }))
    })

    // Return the created features
    const createdFeatures = await db.companyFeature.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(createdFeatures)
  } catch (error) {
    console.error('Error updating company features:', error)
    return NextResponse.json(
      { error: 'Failed to update company features' },
      { status: 500 }
    )
  }
}