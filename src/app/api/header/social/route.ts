interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF] })

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
    const auth = await authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })

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
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        contactEmail: 'info@alhamdcars.com',
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