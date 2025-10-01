interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { EnhancedMediaService, MediaUploadOptions, MediaFilterOptions } from '@/lib/enhanced-media-service'
import { z } from 'zod'

// Initialize media service
const mediaService = EnhancedMediaService.getInstance()

// Validation schemas
const uploadSchema = z.object({
  category: z.enum(['vehicle', 'service', 'blog', 'testimonial', 'banner', 'gallery', 'other']),
  entityId: z.string().optional(),
  isPublic: z.boolean().default(true),
  isFeatured: z.boolean().default(false),
  altText: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).default([]),
  generateThumbnails: z.boolean().default(true),
  optimizeFormats: z.array(z.enum(['webp', 'avif', 'jpeg', 'png'])).default(['webp']),
  watermark: z.boolean().default(false),
  aiTags: z.boolean().default(false)
})

const filterSchema = z.object({
  category: z.enum(['vehicle', 'service', 'blog', 'testimonial', 'banner', 'gallery', 'other']).optional(),
  entityId: z.string().optional(),
  tags: z.array(z.string()).optional(),
  mimeType: z.string().optional(),
  isPublic: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  createdBy: z.string().optional(),
  dateFrom: z.string().optional(),
  dateTo: z.string().optional(),
  search: z.string().optional(),
  limit: z.number().min(1).max(1000).optional(),
  offset: z.number().min(0).default(0),
  sortBy: z.enum(['createdAt', 'updatedAt', 'size', 'title']).default('createdAt'),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
})

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view media
    if (!['ADMIN', 'SUPER_ADMIN', 'STAFF', 'BRANCH_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    
    // Parse filter parameters
    const filterParams: Record<string, any> = {}
    const limit = searchParams.get('limit')
    const offset = searchParams.get('offset')
    const category = searchParams.get('category')
    const tags = searchParams.get('tags')
    const mimeType = searchParams.get('mimeType')
    const isPublic = searchParams.get('isPublic')
    const isFeatured = searchParams.get('isFeatured')
    const createdBy = searchParams.get('createdBy')
    const dateFrom = searchParams.get('dateFrom')
    const dateTo = searchParams.get('dateTo')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy')
    const sortOrder = searchParams.get('sortOrder')
    
    if (limit) filterParams.limit = parseInt(limit)
    if (offset) filterParams.offset = parseInt(offset)
    if (category) filterParams.category = category
    if (tags) filterParams.tags = tags.split(',').map(tag => tag.trim())
    if (mimeType) filterParams.mimeType = mimeType
    if (isPublic) filterParams.isPublic = isPublic === 'true'
    if (isFeatured) filterParams.isFeatured = isFeatured === 'true'
    if (createdBy) filterParams.createdBy = createdBy
    if (dateFrom) filterParams.dateFrom = dateFrom
    if (dateTo) filterParams.dateTo = dateTo
    if (search) filterParams.search = search
    if (sortBy) filterParams.sortBy = sortBy
    if (sortOrder) filterParams.sortOrder = sortOrder

    const validatedFilter = filterSchema.parse(filterParams)
    
    // Get media files
    const result = await mediaService.getMedia(validatedFilter as MediaFilterOptions)
    
    return NextResponse.json({
      success: true,
      data: result
    })

  } catch (error) {
    console.error('Error fetching media:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid parameters', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to upload media
    if (!['ADMIN', 'SUPER_ADMIN', 'STAFF', 'BRANCH_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const optionsJson = formData.get('options') as string

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    // Parse and validate upload options
    let uploadOptions: MediaUploadOptions = {
      category: 'other',
      generateThumbnails: true,
      optimizeFormats: ['webp']
    }

    if (optionsJson) {
      try {
        const parsedOptions = JSON.parse(optionsJson)
        const validatedOptions = uploadSchema.parse(parsedOptions)
        uploadOptions = { ...uploadOptions, ...validatedOptions }
      } catch (error) {
        console.error('Error parsing upload options:', error)
      }
    }

    // Upload media
    const mediaFile = await mediaService.uploadMedia(file, uploadOptions)
    
    return NextResponse.json({
      success: true,
      data: mediaFile
    })

  } catch (error) {
    console.error('Error uploading media:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid upload options', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload media' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update media
    if (!['ADMIN', 'SUPER_ADMIN', 'STAFF', 'BRANCH_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')
    const action = searchParams.get('action')

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 })
    }

    if (action === 'optimize') {
      // Optimize existing media
      const optimizedMedia = await mediaService.optimizeExistingMedia(mediaId)
      return NextResponse.json({
        success: true,
        data: optimizedMedia
      })
    } else if (action === 'bulk-optimize') {
      // Bulk optimize media
      const category = searchParams.get('category') || undefined
      const result = await mediaService.bulkOptimizeMedia(category)
      return NextResponse.json({
        success: true,
        data: result
      })
    } else {
      // Update media metadata
      const body = await request.json()
      const updates = uploadSchema.partial().parse(body)
      
      const updatedMedia = await mediaService.updateMedia(mediaId, updates)
      
      return NextResponse.json({
        success: true,
        data: updatedMedia
      })
    }

  } catch (error) {
    console.error('Error updating media:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid update data', details: error.issues },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update media' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete media
    if (!['ADMIN', 'SUPER_ADMIN', 'STAFF', 'BRANCH_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')

    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 })
    }

    await mediaService.deleteMedia(mediaId)
    
    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting media:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete media' },
      { status: 500 }
    )
  }
}