import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const key = searchParams.get('key')

    const where: any = { isActive: true }
    
    if (key) {
      where.id = key
    }

    const settings = await db.siteSettings.findMany({
      where,
      orderBy: {
        createdAt: 'desc'
      },
      take: key ? 1 : 10
    })

    if (settings.length === 0) {
      // Return default settings if none exist
      const defaultSettings = {
        id: 'default',
        logoUrl: '/logo.svg',
        faviconUrl: '/favicon.ico',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        siteTitle: 'Al-Hamd Cars',
        siteDescription: 'Premium Car Dealership in Egypt',
        contactEmail: 'info@alhamdcars.com',
        contactPhone: '+20 123 456 7890',
        contactAddress: 'Cairo, Egypt',
        socialLinks: {
          facebook: 'https://facebook.com/alhamdcars',
          twitter: 'https://twitter.com/alhamdcars',
          instagram: 'https://instagram.com/alhamdcars',
          linkedin: 'https://linkedin.com/company/alhamdcars'
        },
        seoSettings: {
          metaTitle: 'Al-Hamd Cars - Premium Car Dealership in Egypt',
          metaDescription: 'Discover premium cars at Al-Hamd Cars. Best prices, excellent service, and wide selection of vehicles.',
          keywords: 'cars, dealership, egypt, premium vehicles, car sales',
          ogImage: '/og-image.jpg',
          twitterHandle: '@alhamdcars'
        },
        headerSettings: {
          showLogo: true,
          showNavigation: true,
          showContactInfo: true,
          showSocialLinks: true,
          stickyHeader: true,
          transparentHeader: false
        },
        footerSettings: {
          showLogo: true,
          showNavigation: true,
          showContactInfo: true,
          showSocialLinks: true,
          showNewsletter: true,
          showCopyright: true,
          columns: 4
        },
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date()
      }
      return NextResponse.json([defaultSettings])
    }

    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
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

    const body = await request.json()
    const { headerSettings, footerSettings } = body

    // Get current active settings
    const currentSettings = await db.siteSettings.findFirst({
      where: { isActive: true }
    })

    if (!currentSettings) {
      return NextResponse.json(
        { error: 'No active settings found' },
        { status: 404 }
      )
    }

    // Update settings
    const updatedSettings = await db.siteSettings.update({
      where: { id: currentSettings.id },
      data: {
        headerSettings: headerSettings || currentSettings.headerSettings,
        footerSettings: footerSettings || currentSettings.footerSettings,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedSettings)
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json(
      { error: 'Failed to update site settings' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      logoUrl,
      faviconUrl,
      primaryColor,
      secondaryColor,
      accentColor,
      fontFamily,
      siteTitle,
      siteDescription,
      contactEmail,
      contactPhone,
      contactAddress,
      socialLinks,
      seoSettings,
      headerSettings,
      footerSettings
    } = body

    // Validate required fields
    if (!siteTitle || !contactEmail) {
      return NextResponse.json(
        { error: 'Site title and contact email are required' },
        { status: 400 }
      )
    }

    // Deactivate existing settings
    await db.siteSettings.updateMany({
      where: { isActive: true },
      data: { isActive: false }
    })

    const settings = await db.siteSettings.create({
      data: {
        logoUrl,
        faviconUrl,
        primaryColor,
        secondaryColor,
        accentColor,
        fontFamily,
        siteTitle,
        siteDescription,
        contactEmail,
        contactPhone,
        contactAddress,
        socialLinks: socialLinks || {},
        seoSettings: seoSettings || {},
        headerSettings: headerSettings || {},
        footerSettings: footerSettings || {},
        isActive: true
      }
    })

    return NextResponse.json(settings, { status: 201 })
  } catch (error) {
    console.error('Error creating site settings:', error)
    return NextResponse.json(
      { error: 'Failed to create site settings' },
      { status: 500 }
    )
  }
}