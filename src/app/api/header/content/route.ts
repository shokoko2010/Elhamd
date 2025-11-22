interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, UserRole } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'غير مصرح لك - يرجى تسجيل الدخول' }, { status: 401 })
    }
    
    // Check if user has required role or permissions
    const hasAccess = user.role === UserRole.ADMIN || 
                      user.role === UserRole.SUPER_ADMIN ||
                      user.role === UserRole.BRANCH_MANAGER ||
                      user.role === UserRole.STAFF

    if (!hasAccess) {
      return NextResponse.json({ error: 'غير مصرح لك - صلاحيات غير كافية' }, { status: 403 })
    }

    // Get header content from site settings
    const settings = await db.siteSettings.findFirst()
    
    if (!settings) {
      return NextResponse.json({
        logoText: 'Al-Hamd Cars',
        tagline: 'Your Trusted Car Dealership',
        primaryPhone: '+20 2 1234 5678',
        primaryEmail: 'info@elhamdimport.com',
        address: 'Cairo, Egypt',
        workingHours: 'Sat-Thu: 9AM-8PM, Fri: 2PM-8PM',
        ctaButton: {
          text: 'Book a Test Drive',
          href: '/test-drive',
          isVisible: true,
          style: 'primary'
        }
      })
    }

    return NextResponse.json({
      logoUrl: settings.logoUrl,
      logoText: settings.siteTitle,
      tagline: settings.siteDescription,
      primaryPhone: settings.contactPhone,
      primaryEmail: settings.contactEmail,
      address: settings.contactAddress,
      workingHours: settings.workingHours,
      ctaButton: {
        text: 'Book a Test Drive',
        href: '/test-drive',
        isVisible: true,
        style: 'primary'
      }
    })
  } catch (error) {
    console.error('Error fetching header content:', error)
    return NextResponse.json(
      { error: 'Failed to fetch header content' },
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
    const {
      logoUrl,
      logoText,
      tagline,
      primaryPhone,
      secondaryPhone,
      primaryEmail,
      secondaryEmail,
      address,
      workingHours,
      ctaButton
    } = body

    // Update site settings with header content
    const settings = await db.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        logoUrl,
        siteTitle: logoText,
        siteDescription: tagline,
        contactPhone: primaryPhone,
        contactEmail: primaryEmail,
        contactAddress: address,
        workingHours,
        updatedAt: new Date()
      },
      create: {
        id: 'default',
        logoUrl,
        siteTitle: logoText,
        siteDescription: tagline,
        contactPhone: primaryPhone,
        contactEmail: primaryEmail,
        contactAddress: address,
        workingHours,
        primaryColor: '#0A1A3F',
        secondaryColor: '#C1272D',
        accentColor: '#F59E0B',
        fontFamily: 'Cairo',
        contactEmail: primaryEmail,
        headerSettings: {},
        footerSettings: {},
        seoSettings: {}
      }
    })

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating header content:', error)
    return NextResponse.json(
      { error: 'Failed to update header content' },
      { status: 500 }
    )
  }
}