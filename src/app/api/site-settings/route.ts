import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, UserRole } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/site-settings - Fetching site settings...')
    
    // For development, allow access without authentication
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      // Verify authentication
      const user = await getAuthUser()
      if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role))) {
        console.log('Authentication failed: No admin user found')
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 401 }
        )
      }
      
      console.log('User authenticated:', user.email)
    } else {
      console.log('Development mode - skipping authentication')
    }
    
    // Get the first site settings record
    const settings = await db.siteSettings.findFirst()
    
    console.log('Found settings:', settings ? 'Yes' : 'No')
    
    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        id: 'default',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        siteTitle: 'Elhamd Import',
        siteDescription: 'متخصصون في استيراد وبيع أفضل الشاحنات التجارية',
        contactEmail: 'info@elhamdimport.com',
        contactPhone: '+966 50 123 4567',
        contactAddress: 'الرياض، المملكة العربية السعودية',
        socialLinks: {
          facebook: '',
          twitter: '',
          instagram: '',
          linkedin: ''
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
        }
      }
      
      console.log('Returning default settings')
      return NextResponse.json(defaultSettings)
    }

    console.log('Returning existing settings')
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('PUT /api/site-settings - Updating site settings...')
    
    // For development, allow access without authentication
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      // Verify authentication
      const user = await getAuthUser()
      if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role))) {
        console.log('Authentication failed: No admin user found')
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 401 }
        )
      }
      
      console.log('User authenticated:', user.email)
    } else {
      console.log('Development mode - skipping authentication')
    }
    
    const body = await request.json()
    console.log('Received settings data:', JSON.stringify(body, null, 2))
    
    // Validate required fields - be more flexible with validation
    if (!body.siteTitle && !body.title) {
      console.log('Validation failed: Missing site title')
      return NextResponse.json(
        { error: 'Site title is required' },
        { status: 400 }
      )
    }
    
    if (!body.contactEmail && !body.email) {
      console.log('Validation failed: Missing contact email')
      return NextResponse.json(
        { error: 'Contact email is required' },
        { status: 400 }
      )
    }

    // Check if settings already exist
    const existingSettings = await db.siteSettings.findFirst()
    console.log('Existing settings found:', existingSettings ? 'Yes' : 'No')
    
    let settings
    if (existingSettings) {
      // Update existing settings
      console.log('Updating existing settings...')
      settings = await db.siteSettings.update({
        where: { id: existingSettings.id },
        data: {
          ...body,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new settings
      console.log('Creating new settings...')
      settings = await db.siteSettings.create({
        data: {
          ...body,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    console.log('Settings saved successfully:', settings.id)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json(
      { error: 'Failed to update site settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/site-settings - Saving site settings...')
    
    // For development, allow access without authentication
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    if (!isDevelopment) {
      // Verify authentication
      const user = await getAuthUser()
      if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role))) {
        console.log('Authentication failed: No admin user found')
        return NextResponse.json(
          { error: 'Unauthorized - Admin access required' },
          { status: 401 }
        )
      }
      
      console.log('User authenticated:', user.email)
    } else {
      console.log('Development mode - skipping authentication')
    }
    
    const body = await request.json()
    console.log('Received settings data:', JSON.stringify(body, null, 2))
    
    // Validate required fields - be more flexible with validation
    if (!body.siteTitle && !body.title) {
      console.log('Validation failed: Missing site title')
      return NextResponse.json(
        { error: 'Site title is required' },
        { status: 400 }
      )
    }
    
    if (!body.contactEmail && !body.email) {
      console.log('Validation failed: Missing contact email')
      return NextResponse.json(
        { error: 'Contact email is required' },
        { status: 400 }
      )
    }

    // Check if settings already exist
    const existingSettings = await db.siteSettings.findFirst()
    console.log('Existing settings found:', existingSettings ? 'Yes' : 'No')
    
    let settings
    if (existingSettings) {
      // Update existing settings
      console.log('Updating existing settings...')
      settings = await db.siteSettings.update({
        where: { id: existingSettings.id },
        data: {
          ...body,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new settings
      console.log('Creating new settings...')
      settings = await db.siteSettings.create({
        data: {
          ...body,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
    }

    console.log('Settings saved successfully:', settings.id)
    return NextResponse.json(settings)
  } catch (error) {
    console.error('Error saving site settings:', error)
    return NextResponse.json(
      { error: 'Failed to save site settings', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}