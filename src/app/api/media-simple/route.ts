import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import fs from 'fs'
import path from 'path'
import imageSize from 'image-size'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    // Parse query parameters
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const category = searchParams.get('category')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'
    
    // Build where clause
    const where: any = {}
    if (category) where.category = category
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch media' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const options = formData.get('options') ? JSON.parse(formData.get('options') as string) : {}
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // Create uploads directory if it doesn't exist
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true })
    }
    
    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const fileExtension = path.extname(file.name)
    const uniqueFilename = `${timestamp}_${randomString}${fileExtension}`
    const filePath = path.join(uploadsDir, uniqueFilename)
    
    // Save file to disk
    const buffer = Buffer.from(await file.arrayBuffer())
    fs.writeFileSync(filePath, buffer)
    
    // Get image dimensions if it's an image
    let width = null
    let height = null
    if (file.type.startsWith('image/')) {
      try {
        // Use image-size library to get dimensions
        const dimensions = imageSize(filePath)
        width = dimensions.width
        height = dimensions.height
      } catch (error) {
        console.warn('Could not get image dimensions:', error)
      }
    }
    
    // Create database record
    const mediaRecord = await db.media.create({
      data: {
        filename: uniqueFilename,
        originalName: file.name,
        path: `/uploads/${uniqueFilename}`,
        url: `/uploads/${uniqueFilename}`,
        thumbnailUrl: `/uploads/${uniqueFilename}`,
        mimeType: file.type,
        size: file.size,
        width: width,
        height: height,
        altText: options.altText || '',
        title: options.title || '',
        description: options.description || '',
        tags: options.tags ? JSON.stringify(options.tags) : JSON.stringify([]),
        category: options.category || 'other',
        entityId: options.entityId || null,
        isPublic: options.isPublic !== undefined ? options.isPublic : true,
        isFeatured: options.isFeatured !== undefined ? options.isFeatured : false,
        order: options.order || 0,
        metadata: options.metadata ? JSON.stringify(options.metadata) : JSON.stringify({}),
        createdBy: 'admin'
      }
    })
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: mediaRecord.id,
        filename: mediaRecord.filename,
        originalName: mediaRecord.originalName,
        url: mediaRecord.url,
        thumbnailUrl: mediaRecord.thumbnailUrl,
        mimeType: mediaRecord.mimeType,
        size: mediaRecord.size,
        width: mediaRecord.width,
        height: mediaRecord.height,
        altText: mediaRecord.altText,
        title: mediaRecord.title,
        description: mediaRecord.description,
        tags: mediaRecord.tags ? JSON.parse(mediaRecord.tags) : [],
        category: mediaRecord.category,
        isPublic: mediaRecord.isPublic,
        isFeatured: mediaRecord.isFeatured,
        createdAt: mediaRecord.createdAt.toISOString(),
        updatedAt: mediaRecord.updatedAt.toISOString(),
        createdBy: mediaRecord.createdBy
      }
    })
    
  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
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
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update media' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const mediaId = searchParams.get('id')
    
    if (!mediaId) {
      return NextResponse.json({ error: 'Media ID required' }, { status: 400 })
    }
    
    // Get the media record first
    const media = await db.media.findUnique({
      where: { id: mediaId }
    })
    
    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }
    
    // Delete file from file system if it exists
    if (media.path) {
      try {
        const filePath = path.join(process.cwd(), 'public', media.path)
        
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath)
          console.log('✅ Deleted file from file system:', filePath)
        }
      } catch (fileError) {
        console.warn('⚠️ Could not delete file from file system:', fileError)
        // Continue with database deletion even if file deletion fails
      }
    }
    
    // Delete media from database
    await db.media.delete({
      where: { id: mediaId }
    })
    
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