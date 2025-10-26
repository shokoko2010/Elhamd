import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
import { existsSync } from 'fs'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Public Upload API Called ===')
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const folder = formData.get('folder') as string || 'general'

    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    console.log('File details:', { name: file.name, size: file.size, type: file.type })

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Check if we're in production with read-only filesystem
    const isProduction = process.env.NODE_ENV === 'production'
    const isReadOnly = isProduction || process.env.VERCEL || process.env.AWS_LAMBDA_FUNCTION_NAME

    if (isReadOnly) {
      console.log('Read-only filesystem detected, using base64 fallback')
      
      // Convert file to base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      
      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${folder}_${timestamp}_${randomId}.${extension}`

      // Create data URL
      const mimeType = file.type
      const dataUrl = `data:${mimeType};base64,${base64}`

      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename,
        size: buffer.length,
        type: file.type,
        isBase64: true
      })
    }

    // Try to save to filesystem (development mode)
    try {
      // Create upload directory
      const uploadDir = join(process.cwd(), 'public', 'uploads', folder)
      if (!existsSync(uploadDir)) {
        await mkdir(uploadDir, { recursive: true })
      }

      // Generate unique filename
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${timestamp}_${randomId}.${extension}`
      const filepath = join(uploadDir, filename)

      // Save file
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      await writeFile(filepath, buffer)

      const url = `/uploads/${folder}/${filename}`

      console.log('File saved successfully:', url)

      return NextResponse.json({
        success: true,
        url,
        filename,
        size: buffer.length,
        type: file.type,
        isBase64: false
      })

    } catch (fsError) {
      console.log('Filesystem write failed, falling back to base64:', fsError)
      
      // Fallback to base64
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      
      const timestamp = Date.now()
      const randomId = Math.random().toString(36).substring(2, 15)
      const extension = file.name.split('.').pop()
      const filename = `${folder}_${timestamp}_${randomId}.${extension}`

      const mimeType = file.type
      const dataUrl = `data:${mimeType};base64,${base64}`

      return NextResponse.json({
        success: true,
        url: dataUrl,
        filename,
        size: buffer.length,
        type: file.type,
        isBase64: true
      })
    }

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}