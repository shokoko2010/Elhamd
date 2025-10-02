import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

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
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    
    // For now, just return a success message
    // In production, you would save the file and create a database record
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        id: `temp_${Date.now()}`,
        filename: file.name,
        originalName: file.name,
        url: `/uploads/${file.name}`,
        thumbnailUrl: `/uploads/${file.name}`,
        mimeType: file.type,
        size: file.size,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: 'admin'
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