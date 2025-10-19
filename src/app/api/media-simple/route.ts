import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorize, UserRole } from '@/lib/auth-server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authorize(request, { 
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER, UserRole.STAFF] 
    })
    
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '50') // Increased default limit
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build where clause
    const where: any = {}
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
      take: Math.min(limit, 100) // Max 100 items
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
    
    return NextResponse.json({
      success: true,
      data: {
        files,
        total,
        hasMore: offset + limit < total
      }
    })
    
  } catch (error) {
    console.error('Error fetching media:', error)
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authorize(request, { 
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER] 
    })
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const options = JSON.parse(formData.get('options') as string || '{}')
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: 'Invalid file type. Only images are allowed.' }, { status: 400 })
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'media')
    try {
      await mkdir(uploadsDir, { recursive: true })
    } catch (error) {
      // Directory might already exist
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 8)
    const extension = file.name.split('.').pop()
    const filename = `${timestamp}_${random}.${extension}`
    const filepath = path.join(uploadsDir, filename)
    
    // Convert file to buffer and save
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filepath, buffer)
    
    // Create URL path
    const url = `/uploads/media/${filename}`
    
    // Save to database
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
    
    const createdMedia = await db.media.create({
      data: mediaData
    })
    
    return NextResponse.json({
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
    
  } catch (error) {
    console.error('Error uploading file:', error)
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authorize(request, { 
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.BRANCH_MANAGER] 
    })
    
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')
    
    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 })
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
    
    return NextResponse.json({
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
    
  } catch (error) {
    console.error('Error updating media:', error)
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update media' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Authenticate user
    const user = await authorize(request, { 
      roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] 
    })
    
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')
    
    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 })
    }
    
    // Get media info before deletion
    const media = await db.media.findUnique({
      where: { id: mediaId }
    })
    
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
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
    
    return NextResponse.json({
      success: true,
      message: 'Media deleted successfully'
    })
    
  } catch (error) {
    console.error('Error deleting media:', error)
    if (error instanceof Error && error.message.includes('Authentication')) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete media' },
      { status: 500 }
    )
  }
}