import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, UserRole } from '@/lib/auth-server'

export async function PUT(request: NextRequest) {
  try {
    console.log('=== DEBUG SITE SETTINGS PUT ===')
    
    // Get the raw body first
    const body = await request.json()
    console.log('Raw request body:', JSON.stringify(body, null, 2))
    
    // Check authentication
    const user = await getAuthUser()
    console.log('Auth user:', user ? { id: user.id, email: user.email, role: user.role } : null)
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden - Admin only' }, { status: 403 })
    }
    
    // Validate each field individually
    const validationResults = {
      siteTitle: !!body.siteTitle,
      title: !!body.title,
      contactEmail: !!body.contactEmail,
      email: !!body.email,
      hasSiteTitle: !!(body.siteTitle || body.title),
      hasContactEmail: !!(body.contactEmail || body.email)
    }
    
    console.log('Validation results:', validationResults)
    
    if (!validationResults.hasSiteTitle) {
      return NextResponse.json({ 
        error: 'Site title is required',
        validation: validationResults,
        receivedFields: Object.keys(body)
      }, { status: 400 })
    }
    
    if (!validationResults.hasContactEmail) {
      return NextResponse.json({ 
        error: 'Contact email is required',
        validation: validationResults,
        receivedFields: Object.keys(body)
      }, { status: 400 })
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Debug validation passed',
      validation: validationResults,
      receivedFields: Object.keys(body),
      bodyKeys: Object.keys(body),
      bodySample: {
        siteTitle: body.siteTitle,
        title: body.title,
        contactEmail: body.contactEmail,
        email: body.email
      }
    })
    
  } catch (error) {
    console.error('Debug site settings error:', error)
    return NextResponse.json({ 
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 })
  }
}