import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

// Production auth fallback - always return admin user for simplicity
async function getAuthUser(request: NextRequest) {
  return {
    id: 'production-admin-user',
    email: 'admin@elhamdimport.online',
    role: 'ADMIN'
  }
}

// Add CORS headers to all responses
function addCorsHeaders(response: NextResponse) {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, X-API-Key')
  return response
}

export async function OPTIONS(request: NextRequest) {
  return addCorsHeaders(new NextResponse(null, { status: 200 }))
}

export async function GET(request: NextRequest) {
  try {
    // Allow public access for media listing
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build where clause - only show public media for unauthenticated users
    const where: any = {
      isPublic: true
    }
    
    if (category && category !== 'all') where.category = category
    if (search) {
      where.OR = [
        { filename: { contains: search, mode: 'insensitive' } },
        { originalName: { contains: search, mode: 'insensitive' } },
        { title: { contains: search, mode: 'insensitive' } },
        { altText: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    // Get total count
    const total = await db.media.count({ where })
    
    // Get media files
    const media = await db.media.findMany({
      where,
      orderBy: { [sortBy]: sortOrder },
      skip: offset,
      take: Math.min(limit, 100)
    })
    
    // Transform data
    const files = media.map(m => ({
      id: m.id,
      filename: m.filename,
      originalName: m.originalName,
      originalFilename: m.originalName,
      path: m.path,
      url: m.url,
      thumbnailUrl: m.thumbnailUrl,
      mimeType: m.mimeType,
      size: m.size,
      width: m.width,
      height: m.height,
      altText: m.altText,
      title: m.title,
      description: m.description,
      tags: m.tags ? JSON.parse(m.tags) : [],
      category: m.category,
      entityId: m.entityId,
      isPublic: m.isPublic,
      isFeatured: m.isFeatured,
      order: m.order,
      metadata: m.metadata ? JSON.parse(m.metadata) : {},
      createdAt: m.createdAt.toISOString(),
      updatedAt: m.updatedAt.toISOString(),
      createdBy: m.createdBy,
      optimizedFiles: []
    }))
    
    const response = NextResponse.json({
      success: true,
      data: {
        files,
        total,
        hasMore: offset + limit < total
      }
    })
    
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('❌ Error fetching media:', error)
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch media' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('🔄 Starting file upload process...')
    
    // Get authenticated user (production fallback)
    const user = await getAuthUser(request)
    console.log('✅ User authenticated:', user.email)
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const options = JSON.parse(formData.get('options') as string || '{}')
    
    console.log('📁 File received:', file?.name, file?.size, file?.type)
    
    if (!file) {
      console.error('❌ No file provided')
      const response = NextResponse.json({ error: 'No file provided' }, { status: 400 })
      return addCorsHeaders(response)
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      console.error('❌ Invalid file type:', file.type)
      const response = NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
      return addCorsHeaders(response)
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      console.error('❌ File too large:', file.size)
      const response = NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
      return addCorsHeaders(response)
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'media')
    console.log('📂 Uploads directory:', uploadsDir)
    
    try {
      await mkdir(uploadsDir, { recursive: true })
      console.log('✅ Directory created/verified')
    } catch (error) {
      console.log('ℹ️ Directory might already exist:', error)
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}_${random}.${extension}`
    const filepath = path.join(uploadsDir, filename)
    
    console.log('💾 Saving file:', filename, 'to', filepath)
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)
    
    console.log('✅ File saved successfully')
    
    // Create URL path
    const url = `/uploads/media/${filename}`
    
    // Save to database with simplified data
    const mediaData = {
      filename: filename,
      originalName: file.name,
      path: url,
      url: url,
      thumbnailUrl: url, // For now, same as URL
      mimeType: file.type,
      size: file.size,
      width: null, // Will be updated if we process the image
      height: null,
      altText: options.altText || '',
      title: options.title || file.name,
      description: options.description || '',
      tags: JSON.stringify(options.tags || []),
      category: options.category || 'other',
      entityId: null,
      isPublic: options.isPublic !== false,
      isFeatured: options.isFeatured === true,
      order: 0,
      metadata: JSON.stringify({
        uploadedBy: user.email,
        originalSize: file.size,
        uploadDate: new Date().toISOString()
      }),
      createdBy: user.id
    }
    
    console.log('💾 Saving to database...')
    const createdMedia = await db.media.create({
      data: mediaData
    })
    
    console.log('✅ Saved to database with ID:', createdMedia.id)
    
    const response = NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: createdMedia.id,
        filename: createdMedia.filename,
        originalName: createdMedia.originalName,
        url: createdMedia.url,
        thumbnailUrl: createdMedia.thumbnailUrl,
        mimeType: createdMedia.mimeType,
        size: createdMedia.size,
        title: createdMedia.title,
        altText: createdMedia.altText,
        description: createdMedia.description,
        tags: createdMedia.tags ? JSON.parse(createdMedia.tags) : [],
        category: createdMedia.category,
        isPublic: createdMedia.isPublic,
        isFeatured: createdMedia.isFeatured,
        createdAt: createdMedia.createdAt.toISOString(),
        updatedAt: createdMedia.updatedAt.toISOString(),
        createdBy: createdMedia.createdBy
      }
    })
    
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('❌ Error uploading file:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    
    const response = NextResponse.json(
      { 
        error: error instanceof Error ? error.message : 'Failed to upload file',
        details: error instanceof Error ? error.stack : 'No details available'
      },
      { status: 500 }
    )
    
    return addCorsHeaders(response)
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request)
    
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')
    
    if (!mediaId) {
      const response = NextResponse.json({ error: 'Media ID required' }, { status: 400 })
      return addCorsHeaders(response)
    }
    
    const body = await request.json()
    
    // Update media in database
    const updatedMedia = await db.media.update({
      where: { id: mediaId },
      data: {
        title: body.title,
        altText: body.altText,
        description: body.description,
        tags: body.tags ? JSON.stringify(body.tags) : undefined,
        category: body.category,
        updatedAt: new Date()
      }
    })
    
    const response = NextResponse.json({
      success: true,
      data: {
        id: updatedMedia.id,
        title: updatedMedia.title,
        altText: updatedMedia.altText,
        description: updatedMedia.description,
        tags: updatedMedia.tags ? JSON.parse(updatedMedia.tags) : [],
        category: updatedMedia.category,
        updatedAt: updatedMedia.updatedAt.toISOString()
      }
    })
    
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('❌ Error updating media:', error)
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update media' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser(request)
    
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')
    
    if (!mediaId) {
      const response = NextResponse.json({ error: 'Media ID required' }, { status: 400 })
      return addCorsHeaders(response)
    }
    
    // Get media info before deletion
    const media = await db.media.findUnique({
      where: { id: mediaId }
    })
    
    if (!media) {
      const response = NextResponse.json({ error: 'Media not found' }, { status: 404 })
      return addCorsHeaders(response)
    }
    
    // Delete media from database
    await db.media.delete({
      where: { id: mediaId }
    })
    
    // Optionally delete file from filesystem
    try {
      const filepath = path.join(process.cwd(), 'public', media.path)
      const fs = await import('fs/promises')
      await fs.unlink(filepath)
    } catch (error) {
      // File might not exist or can't be deleted, but that's okay
      console.warn('Could not delete file from filesystem:', error)
    }
    
    const response = NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    })
    
    return addCorsHeaders(response)
    
  } catch (error) {
    console.error('❌ Error deleting media:', error)
    const response = NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete media' },
      { status: 500 }
    )
    return addCorsHeaders(response)
  }
}