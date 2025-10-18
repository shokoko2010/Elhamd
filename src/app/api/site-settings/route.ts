import { NextRequest, NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import { getSimpleUser } from '@/lib/simple-auth'

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: 'file:db/custom.db'
    }
  }
})

export async function GET(request: NextRequest) {
  try {
    console.log('GET /api/site-settings - Fetching site settings...')
    
    // Verify authentication
    const user = await getSimpleUser(request)
    if (!user) {
      console.log('Authentication failed: No user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('User authenticated:', user.email)
    
    // Get the first site settings record
    const settings = await prisma.siteSettings.findFirst()
    
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

export async function POST(request: NextRequest) {
  try {
    console.log('POST /api/site-settings - Saving site settings...')
    
    // Verify authentication
    const user = await getSimpleUser(request)
    if (!user) {
      console.log('Authentication failed: No user found')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    console.log('User authenticated:', user.email)
    
    const body = await request.json()
    console.log('Received settings data:', JSON.stringify(body, null, 2))
    
    // Validate required fields
    if (!body.siteTitle || !body.contactEmail) {
      console.log('Validation failed: Missing required fields')
      return NextResponse.json(
        { error: 'Site title and contact email are required' },
        { status: 400 }
      )
    }

    // Check if settings already exist
    const existingSettings = await prisma.siteSettings.findFirst()
    console.log('Existing settings found:', existingSettings ? 'Yes' : 'No')
    
    let settings
    if (existingSettings) {
      // Update existing settings
      console.log('Updating existing settings...')
      settings = await prisma.siteSettings.update({
        where: { id: existingSettings.id },
        data: {
          ...body,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new settings
      console.log('Creating new settings...')
      settings = await prisma.siteSettings.create({
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