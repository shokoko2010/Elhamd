interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { UserRole } from '@prisma/client'
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

    // Get social links from site settings
    const settings = await db.siteSettings.findFirst()
    
    if (!settings) {
      return NextResponse.json({})
    }

    return NextResponse.json(settings.socialLinks || {})
  } catch (error) {
    console.error('Error fetching social links:', error)
    return NextResponse.json(
      { error: 'Failed to fetch social links' },
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
      facebook,
      twitter,
      instagram,
      linkedin,
      youtube,
      tiktok
    } = body

    // Update site settings with social links
    const settings = await db.siteSettings.upsert({
      where: { id: 'default' },
      update: {
        socialLinks: {
          facebook,
          twitter,
          instagram,
          linkedin,
          youtube,
          tiktok
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
        fontFamily: 'Cairo',
        contactEmail: 'info@elhamdimport.com',
        headerSettings: {},
        footerSettings: {},
        seoSettings: {},
        socialLinks: {
          facebook,
          twitter,
          instagram,
          linkedin,
          youtube,
          tiktok
        }
      }
    })

    return NextResponse.json(settings.socialLinks || {})
  } catch (error) {
    console.error('Error updating social links:', error)
    return NextResponse.json(
      { error: 'Failed to update social links' },
      { status: 500 }
    )
  }
}