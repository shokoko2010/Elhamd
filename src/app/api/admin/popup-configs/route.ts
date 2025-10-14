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
  if (!val || val.trim() === '') return true;
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
    if (!val || val.trim() === '') return true;
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

// GET /api/admin/popup-configs - Get all popup configurations
export async function GET(request: NextRequest) {
  try {
    const user = await requireSimpleAuth(request)
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BRANCH_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const offset = (page - 1) * limit

    const [popups, total] = await Promise.all([
      db.popupConfig.findMany({
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        take: limit,
        skip: offset,
      }),
      db.popupConfig.count()
    ])

    return NextResponse.json({
      popups,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching popup configs:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}

// POST /api/admin/popup-configs - Create new popup configuration
export async function POST(request: NextRequest) {
  try {
    const user = await requireSimpleAuth(request)
    if (!['SUPER_ADMIN', 'ADMIN', 'MANAGER', 'BRANCH_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = popupConfigSchema.parse(body)

    // Convert date strings to Date objects
    const data = {
      ...validatedData,
      startDate: validatedData.startDate ? new Date(validatedData.startDate) : null,
      endDate: validatedData.endDate ? new Date(validatedData.endDate) : null,
    }

    const popup = await db.popupConfig.create({
      data
    })

    return NextResponse.json(popup, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Validation Error', details: error.errors }, { status: 400 })
    }
    console.error('Error creating popup config:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}