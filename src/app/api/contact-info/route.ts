import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Get contact info from database
    const contactInfo = await db.contactInfo.findFirst({
      where: { isActive: true }
    })
    
    if (!contactInfo) {
      // Return default contact info if none exists
      return NextResponse.json({
        id: 'default',
        primaryPhone: '+20 2 1234 5678',
        secondaryPhone: '+20 1 2345 6789',
        primaryEmail: 'info@alhamdcars.com',
        secondaryEmail: 'sales@alhamdcars.com',
        address: 'القاهرة، مصر',
        mapLat: 30.0444,
        mapLng: 31.2357,
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
        isActive: true
      })
    }

    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error('Error fetching contact info:', error)
    return NextResponse.json(
      { error: 'Failed to fetch contact info' },
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

    // Update or create contact info
    const existingInfo = await db.contactInfo.findFirst()
    
    if (existingInfo) {
      const updatedInfo = await db.contactInfo.update({
        where: { id: existingInfo.id },
        data
      })
      return NextResponse.json(updatedInfo)
    } else {
      const newInfo = await db.contactInfo.create({
        data
      })
      return NextResponse.json(newInfo)
    }
  } catch (error) {
    console.error('Error updating contact info:', error)
    return NextResponse.json(
      { error: 'Failed to update contact info' },
      { status: 500 }
    )
  }
}