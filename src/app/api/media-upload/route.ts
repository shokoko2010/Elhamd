import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'
import { authenticateProductionUser } from '@/lib/production-auth-vercel'
import { UserRole } from '@prisma/client'

export async function POST(request: NextRequest) {
  let isConnected = false
  
  try {
    // Verify authentication using production method
    const user = await authenticateProductionUser(request)
    if (!user || !([UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role))) {
      return NextResponse.json(
        { error: 'Unauthorized - Staff access required' },
        { status: 401 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    
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
    
    return NextResponse.json({
      success: true,
      message: 'File uploaded successfully',
      data: {
        filename: filename,
        originalName: file.name,
        url: url,
        size: file.size,
        mimeType: file.type
      }
    })
    
  } catch (error) {
    console.error('=== MEDIA UPLOAD ERROR ===')
    console.error('Error type:', typeof error)
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    
    // Check for specific file system errors
    if (error instanceof Error) {
      if (error.message.includes('ENOENT') || error.message.includes('no such file')) {
        return NextResponse.json({ 
          error: 'Upload directory not found. Please contact administrator.',
          code: 'DIRECTORY_NOT_FOUND'
        }, { status: 500 })
      }
      
      if (error.message.includes('EACCES') || error.message.includes('permission')) {
        return NextResponse.json({ 
          error: 'Permission denied. Please contact administrator.',
          code: 'PERMISSION_DENIED'
        }, { status: 500 })
      }
      
      if (error.message.includes('ENOSPC') || error.message.includes('disk full')) {
        return NextResponse.json({ 
          error: 'Disk full. Please contact administrator.',
          code: 'DISK_FULL'
        }, { status: 500 })
      }
    }
    
    return NextResponse.json(
      { 
        error: 'Failed to upload file',
        details: error instanceof Error ? error.message : 'Unknown error',
        code: 'UPLOAD_ERROR'
      },
      { status: 500 }
    )
  }
}