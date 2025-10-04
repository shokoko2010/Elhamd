interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { requireSimpleAuth } from '@/lib/simple-auth'
import { z } from 'zod'

const popupConfigSchema = z.object({
  title: z.string().optional(),
  content: z.string().optional(),
  imageUrl: z.string().optional().refine(val => {
  if (!val || val.trim() === '' || val === '#') return true;
  // Allow both full URLs and relative paths
  try {
    // Try as full URL first
    new URL(val);
    return true;
  } catch {
    // If not a full URL, check if it's a valid relative path
    // Allow paths starting with / and containing only valid path characters
    return /^\/[a-zA-Z0-9\-._~!$&'()*+,;=:@%\/]*$/.test(val);
  }
}, {
    message: "Invalid URL or relative path"
  }),
  linkUrl: z.string().optional().refine(val => {
    if (!val || val.trim() === '' || val === '#') return true;
    // Allow both full URLs and relative paths
    try {
      // Try as full URL first
      new URL(val);
      return true;
    } catch {
      // If not a full URL, check if it's a valid relative path
      // Allow paths starting with / and containing only valid path characters
      return /^\/[a-zA-Z0-9\-._~!$&'()*+,;=:@%\/]*$/.test(val);
    }
  }, {
    message: "Invalid URL or relative path"
  }),
  buttonText: z.string().optional(),
  buttonColor: z.string().default('#3b82f6'),
  textColor: z.string().default('#ffffff'),
  backgroundColor: z.string().default('#1f2937'),
  position: z.enum(['TOP_LEFT', 'TOP_CENTER', 'TOP_RIGHT', 'CENTER', 'BOTTOM_LEFT', 'BOTTOM_CENTER', 'BOTTOM_RIGHT']).default('BOTTOM_RIGHT'),
  showDelay: z.number().int().min(0).max(60000).default(3000),
  autoHide: z.boolean().default(true),
  hideDelay: z.number().int().min(1000).max(60000).default(10000),
  isActive: z.boolean().default(true),
  showOnPages: z.string().default('["homepage"]'),
  targetAudience: z.enum(['all', 'new', 'returning', 'guests']).default('all'),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
  priority: z.number().int().min(0).max(100).default(0),
})

// GET /api/admin/popup-configs/[id] - Get specific popup configuration
export async function GET(request: NextRequest, context: RouteParams) {
  try {
    const user = await requireSimpleAuth(request)
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BRANCH_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    const popup = await db.popupConfig.findUnique({
      where: { id }
    })

    if (!popup) {
      return NextResponse.json({ error: 'Popup configuration not found' }, { status: 404 })
    }

    return NextResponse.json(popup)
  } catch (error) {
    console.error('Error fetching popup config:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// PUT /api/admin/popup-configs/[id] - Update popup configuration
export async function PUT(request: NextRequest, context: RouteParams) {
  try {
    const user = await requireSimpleAuth(request)
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BRANCH_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params
    const body = await request.json()
    console.log('PUT API - Received body:', JSON.stringify(body, null, 2))
    
    const validatedData = popupConfigSchema.parse(body)
    console.log('PUT API - Validated data:', JSON.stringify(validatedData, null, 2))
    
    // Check if popup exists
    const existingPopup = await db.popupConfig.findUnique({
      where: { id }
    })

    console.log('PUT API - Existing popup:', existingPopup ? 'Found' : 'Not found')

    if (!existingPopup) {
      return NextResponse.json({ error: 'Popup configuration not found' }, { status: 404 })
    }

    // Convert date strings to Date objects
    const data = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
    }

    console.log('PUT API - Data to update:', JSON.stringify(data, null, 2))

    const popup = await db.popupConfig.update({
      where: { id },
      data
    })
    
    console.log('PUT API - Updated popup:', JSON.stringify(popup, null, 2))
    
    return NextResponse.json(popup)
  } catch (error) {
    console.error('Error updating popup config:', error)
    console.error('Error stack:', error.stack)
    return NextResponse.json({ 
      error: 'Internal Server Error', 
      details: error.message,
      stack: error.stack 
    }, { status: 500 })
  }
}

// DELETE /api/admin/popup-configs/[id] - Delete popup configuration
export async function DELETE(request: NextRequest, context: RouteParams) {
  try {
    const user = await requireSimpleAuth(request)
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BRANCH_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await context.params

    // Check if popup exists
    const existingPopup = await db.popupConfig.findUnique({
      where: { id }
    })

    if (!existingPopup) {
      return NextResponse.json({ error: 'Popup configuration not found' }, { status: 404 })
    }

    await db.popupConfig.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Popup configuration deleted successfully' })
  } catch (error) {
    console.error('Error deleting popup config:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}