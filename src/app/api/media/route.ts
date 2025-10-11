import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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