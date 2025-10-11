interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get company stats from database
    const companyStats = await db.companyStat.findMany({
      where: { isActive: true },
      orderBy: { order: 'asc' }
    })
    
    if (companyStats.length === 0) {
      // Return default company stats if none exist
      return NextResponse.json([
        {
          id: '1',
          number: '25+',
          label: 'سنة خبرة',
          icon: 'Clock',
          order: 0,
          isActive: true
        },
        {
          id: '2',
          number: '50K+',
          label: 'سيارة مباعة',
          icon: 'Car',
          order: 1,
          isActive: true
        },
        {
          id: '3',
          number: '15+',
          label: 'معرض وخدمة',
          icon: 'MapPin',
          order: 2,
          isActive: true
        },
        {
          id: '4',
          number: '100K+',
          label: 'عميل راضٍ',
          icon: 'Users',
          order: 3,
          isActive: true
        }
      ])
    }

    return NextResponse.json(companyStats)
  } catch (error) {
    console.error('Error fetching company stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch company stats' },
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
    const adminUser = await db.user.findUnique({
      where: { id: session.user.id }
    })

    if (!adminUser || adminUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const data = await request.json()

    // Delete all existing company stats
    await db.companyStat.deleteMany()

    // Create new company stats
    const newStats = await db.companyStat.createMany({
      data: data.map((stat: any) => ({
        number: stat.number,
        label: stat.label,
        icon: stat.icon,
        order: stat.order,
        isActive: stat.isActive
      }))
    })

    // Return the created stats
    const createdStats = await db.companyStat.findMany({
      orderBy: { order: 'asc' }
    })

    return NextResponse.json(createdStats)
  } catch (error) {
    console.error('Error updating company stats:', error)
    return NextResponse.json(
      { error: 'Failed to update company stats' },
      { status: 500 }
    )
  }
}