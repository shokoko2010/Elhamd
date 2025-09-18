import { NextRequest, NextResponse } from 'next/server'
import { ImageOptimizationService } from '@/lib/image-optimization'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to upload images
    if (!['ADMIN', 'STAFF', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const vehicleId = formData.get('vehicleId') as string
    const isPrimary = formData.get('isPrimary') === 'true'
    const order = parseInt(formData.get('order') as string) || 0
    const type = formData.get('type') as 'vehicle' | 'service' || 'vehicle'
    const entityId = formData.get('entityId') as string

    if (!file || !entityId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Initialize image optimization service
    const imageService = ImageOptimizationService.getInstance()

    let result
    if (type === 'vehicle') {
      result = await imageService.saveVehicleImage(file, entityId, isPrimary, order)
    } else if (type === 'service') {
      result = await imageService.saveServiceImage(file, entityId)
    } else {
      return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      url: type === 'vehicle' ? result.optimizedUrl : result.url,
      originalUrl: type === 'vehicle' ? result.originalUrl : undefined,
      thumbnails: result.thumbnails,
      filename: result.filename,
      filesize: result.filesize,
      metadata: {
        type,
        entityId,
        isPrimary,
        order
      }
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
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

    // Check if user has permission to delete images
    if (!['ADMIN', 'STAFF', 'MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const imagePath = searchParams.get('path')
    const deleteThumbnails = searchParams.get('deleteThumbnails') === 'true'

    if (!imagePath) {
      return NextResponse.json({ error: 'Missing image path' }, { status: 400 })
    }

    const imageService = ImageOptimizationService.getInstance()
    await imageService.deleteImage(imagePath)

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error deleting image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete image' },
      { status: 500 }
    )
  }
}

// New endpoint for batch image optimization
export async function PUT(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const files = formData.getAll('files') as File[]
    const quality = parseInt(formData.get('quality') as string) || 80
    const maxWidth = parseInt(formData.get('maxWidth') as string) || 1200
    const format = formData.get('format') as 'jpeg' | 'png' | 'webp' || 'webp'

    if (!files || files.length === 0) {
      return NextResponse.json({ error: 'No files provided' }, { status: 400 })
    }

    const imageService = ImageOptimizationService.getInstance()
    const results = await imageService.batchOptimizeImages(files, {
      quality,
      width: maxWidth,
      format
    })

    return NextResponse.json({
      success: true,
      results: results.map(result => ({
        filename: result.filename,
        originalSize: files.find(f => f.name === result.filename)?.size || 0,
        optimizedSize: result.size,
        savings: files.find(f => f.name === result.filename) 
          ? ((files.find(f => f.name === result.filename)!.size - result.size) / 
             files.find(f => f.name === result.filename)!.size * 100).toFixed(2) + '%'
          : '0%'
      }))
    })

  } catch (error) {
    console.error('Error batch optimizing images:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to optimize images' },
      { status: 500 }
    )
  }
}