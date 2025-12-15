interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    const contactInfo = await db.contactInfo.findFirst({
      where: { isActive: true },
      select: {
        id: true,
        primaryPhone: true,
        secondaryPhone: true,
        primaryEmail: true,
        secondaryEmail: true,
        address: true,
        mapLat: true,
        mapLng: true,
        mapUrl: true,
        isActive: true
        // Excluded JSON fields (workingHours, departments) to debug 500 error
      }
    })

    // Get active branches
    // Get active branches (Commented out for debugging 500 error)
    // const branches = await db.branch.findMany({
    //   where: { isActive: true },
    //   select: {
    //     id: true,
    //     name: true,
    //     code: true,
    //     address: true,
    //     phone: true,
    //     email: true,
    //     mapLat: true,
    //     mapLng: true,
    //     workingHours: true
    //   }
    // })
    const branches: any[] = []

    if (!contactInfo) {
      // Return default contact info if none exists
      return NextResponse.json({
        id: 'default',
        primaryPhone: '+20 2 1234 5678',
        secondaryPhone: '+20 1 2345 6789',
        primaryEmail: 'info@elhamdimport.com',
        secondaryEmail: 'sales@alhamdcars.com',
        address: 'القاهرة، مصر',
        mapLat: 30.0444,
        mapLng: 31.2357,
        mapUrl: 'https://maps.app.goo.gl/default',
        workingHours: [
          { day: 'السبت - الخميس', hours: '9:00 ص - 8:00 م' },
          { day: 'الجمعة', hours: '2:00 م - 8:00 م' }
        ],
        departments: [
          {
            value: 'sales',
            label: 'قسم المبيعات',
            icon: 'Car',
            description: 'للاستفسارات عن السيارات الجديدة والأسعار'
          },
          {
            value: 'service',
            label: 'قسم الخدمة',
            icon: 'Wrench',
            description: 'لحجز مواعيد الصيانة والاستفسارات الفنية'
          },
          {
            value: 'support',
            label: 'قسم الدعم',
            icon: 'Users',
            description: 'للمساعدة العامة والدعم الفني'
          }
        ],
        isActive: true,
        branches: []
      })
    }

    return NextResponse.json({ ...contactInfo, branches })
  } catch (error) {
    console.error('Error fetching contact info (Detailed):', error)
    // Log specifics if available
    if (error instanceof Error) {
      console.error('Stack:', error.stack)
      console.error('Message:', error.message)
    }
    return NextResponse.json(
      { error: 'Failed to fetch contact info', details: error instanceof Error ? error.message : 'Unknown Error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { id: user.id }
    })

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    // Helper to extract coordinates from Google Maps URL
    let calculatedLat = body.mapLat
    let calculatedLng = body.mapLng

    if (body.mapUrl && typeof body.mapUrl === 'string') {
      // Regex for @lat,lng
      const regex = /@(-?\d+\.\d+),(-?\d+\.\d+)/
      const match = body.mapUrl.match(regex)
      if (match) {
        calculatedLat = parseFloat(match[1])
        calculatedLng = parseFloat(match[2])
      }
    }

    // Construct safe update object
    const updateData: any = {
      primaryPhone: body.primaryPhone,
      secondaryPhone: body.secondaryPhone,
      primaryEmail: body.primaryEmail,
      secondaryEmail: body.secondaryEmail,
      address: body.address,
      mapUrl: body.mapUrl,
      mapLat: calculatedLat,
      mapLng: calculatedLng,
      isActive: true
    }

    // Handle JSON fields safely
    if (Array.isArray(body.workingHours)) {
      updateData.workingHours = body.workingHours
    }
    if (Array.isArray(body.departments)) {
      updateData.departments = body.departments
    }

    // Update or create contact info
    const existingInfo = await db.contactInfo.findFirst()

    let result
    if (existingInfo) {
      result = await db.contactInfo.update({
        where: { id: existingInfo.id },
        data: updateData
      })
    } else {
      result = await db.contactInfo.create({
        data: updateData
      })
    }

    // Revalidate the homepage using imported function
    try {
      const { revalidatePath } = await import('next/cache')
      revalidatePath('/', 'page')
    } catch (e) {
      console.error('Error revalidating path:', e)
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Error updating contact info:', error)
    return NextResponse.json(
      { error: 'Failed to update contact info', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}