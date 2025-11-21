interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
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
    console.log('🔍 Fetching navigation data...')
    
    // Get navigation from site settings first (for public access)
    const settings = await db.siteSettings.findFirst()
    console.log('✅ Settings found:', !!settings)
    
    if (settings?.headerSettings?.navigation) {
      console.log('✅ Returning navigation from site settings')
      return NextResponse.json(settings.headerSettings.navigation)
    }

    // Fallback to HeaderNavigation table
    console.log('🔄 Falling back to headerNavigation table...')
    const navigationItems = await db.headerNavigation.findMany({
      orderBy: { order: 'asc' }
    })
    
    console.log(`✅ Found ${navigationItems.length} items in headerNavigation table`)
    
    if (navigationItems.length > 0) {
      return NextResponse.json(navigationItems)
    }
    
    // Return default navigation as last resort
    console.log('🔄 Returning default navigation...')
    return NextResponse.json([
      { id: '1', label: 'الرئيسية', href: '/', order: 1, isVisible: true },
      { id: '2', label: 'السيارات', href: '/vehicles', order: 2, isVisible: true },
      { id: '3', label: 'قيادة تجريبية', href: '/test-drive', order: 3, isVisible: true },
      { id: '4', label: 'حجز خدمة', href: '/service-booking', order: 4, isVisible: true },
      { id: '5', label: 'استشارة', href: '/consultation', order: 5, isVisible: true },
      { id: '6', label: 'اتصل بنا', href: '/contact', order: 6, isVisible: true }
    ])
  } catch (error) {
    console.error('❌ Error fetching navigation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch navigation' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN

    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
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
        primaryColor: '#0A1A3F',
        secondaryColor: '#C1272D',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        contactEmail: 'info@elhamdimport.com',
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