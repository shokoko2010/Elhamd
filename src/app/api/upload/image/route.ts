interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { ImageOptimizationService } from '@/lib/image-optimization'
import { getAuthUser, UserRole } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Image Upload API Called ===')
    
    // Check authentication
    const user = await getAuthUser()
    console.log('Auth user:', user ? { id: user.id, email: user.email, role: user.role } : 'No user')
    
    if (!user) {
      console.log('Authentication failed - no user')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to upload images
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role)) {
      console.log('User role:', user.role, 'Not authorized for image upload');
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    console.log('User authenticated, processing form data...')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const vehicleId = formData.get('vehicleId') as string
    const isPrimary = formData.get('isPrimary') === 'true'
    const order = parseInt(formData.get('order') as string) || 0
    const type = formData.get('type') as 'vehicle' | 'service' | 'general' || 'vehicle'
    const entityId = formData.get('entityId') as string || formData.get('vehicleId') as string || 'general'

    console.log('Form data:', { file: !!file, type, entityId, vehicleId, isPrimary, order })

    if (!file) {
      console.log('No file provided in form data')
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File details:', { name: file.name, size: file.size, type: file.type })

    // Check if we're in production with read-only filesystem
    const isProduction = process.env.NODE_ENV === 'production'
    const isReadOnly = isProduction || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

    if (isReadOnly) {
      console.log('Read-only filesystem detected, using base64 fallback')
      
      // For production, fall back to base64 encoding
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      
      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${type}_${entityId}_${timestamp}_${randomId}.${extension}`

      // Create data URL
      const mimeType = file.type
      const dataUrl = `data:${mimeType};base64,${base64}`

      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename,
        filesize: buffer.length,
        metadata: {
          type,
          entityId,
          isPrimary,
          order,
          isBase64: true
        }
      })
    }

    // Try to use ImageOptimizationService (development mode)
    try {
      const imageService = ImageOptimizationService.getInstance()

      let result
      if (type === 'vehicle') {
        result = await imageService.saveVehicleImage(file, entityId, isPrimary, order)
      } else if (type === 'service') {
        result = await imageService.saveServiceImage(file, entityId)
      } else if (type === 'general') {
        // For general uploads, just save to a general folder
        result = await imageService.saveGeneralImage(file, entityId)
      } else {
        console.log('Invalid upload type:', type)
        return NextResponse.json({ error: 'Invalid upload type' }, { status: 400 })
      }

      console.log('Image saved successfully:', result)

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
          order,
          isBase64: false
        }
      })

    } catch (imageServiceError) {
      console.log('ImageOptimizationService failed, falling back to base64:', imageServiceError)
      
      // Fallback to base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${type}_${entityId}_${timestamp}_${randomId}.${extension}`

      const mimeType = file.type
      const dataUrl = `data:${mimeType};base64,${base64}`

      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename,
        filesize: buffer.length,
        metadata: {
          type,
          entityId,
          isPrimary,
          order,
          isBase64: true
        }
      })
    }

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
    if (![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role)) {
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