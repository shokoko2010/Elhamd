import { NextRequest, NextResponse } from 'next/server'

// Simple base64 upload handler for production environments
export async function POST(request: NextRequest) {
  try {
    console.log('=== Base64 Upload API Called ===')
    
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

    console.log('File converted to base64 successfully:', filename)

    return NextResponse.json({
      success: true,
      url: dataUrl,
      filename,
      size: buffer.length,
      type: file.type,
      isBase64: true
    })

  } catch (error) {
    console.error('Error uploading file:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload file' },
      { status: 500 }
    )
  }
}