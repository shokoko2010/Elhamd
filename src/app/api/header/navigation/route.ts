import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedUser, createAuthHandler, UserRole } from '@/lib/unified-auth'
import { db } from '@/lib/db'

interface NavigationItem {
  id: string
  label: string
  href: string
  order: number
  isVisible: boolean
  children?: NavigationItem[]
}

export async function GET(request: NextRequest) {
  try {
    const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF])
    const auth = await authHandler(request)
    
    if (auth.error) {
      return auth.error
    }

    // Get navigation from site settings
    const settings = await db.siteSettings.findFirst()
    
    if (!settings || !settings.headerSettings) {
      // Return default navigation
      return NextResponse.json([
        { id: '1', label: 'Home', href: '/', order: 1, isVisible: true },
        { id: '2', label: 'Vehicles', href: '/vehicles', order: 2, isVisible: true },
        { id: '3', label: 'Services', href: '/service-booking', order: 3, isVisible: true },
        { id: '4', label: 'Test Drive', href: '/test-drive', order: 4, isVisible: true },
        { id: '5', label: 'About Us', href: '/about', order: 5, isVisible: true },
        { id: '6', label: 'Contact', href: '/contact', order: 6, isVisible: true }
      ])
    }

    return NextResponse.json(settings.headerSettings.navigation || [])
  } catch (error) {
    console.error('Error fetching navigation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch navigation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN])
    const auth = await authHandler(request)
    
    if (auth.error) {
      return auth.error
    }

    const body = await request.json()
    const navigation = body as NavigationItem[]

    // Update site settings with navigation
    const settings = await db.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        headerSettings: {
          ...(await db.siteSettings.findUnique({ where: { id: 'default' } }))?.headerSettings || {},
          navigation
        },
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        siteTitle: 'Al-Hamd Cars',
        siteDescription: 'Your Trusted Car Dealership',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        contactEmail: 'info@alhamdcars.com',
        headerSettings: {
          navigation
        },
        footerSettings: {},
        seoSettings: {}
      }
    })

    return NextResponse.json(navigation)
  } catch (error) {
    console.error('Error updating navigation:', error)
    return NextResponse.json(
      { error: 'Failed to update navigation' },
      { status: 500 }
    )
  }
}