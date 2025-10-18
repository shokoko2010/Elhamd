import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getSimpleUser } from '@/lib/simple-auth'

export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getSimpleUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const fileId = formData.get('fileId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!fileId) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Decode the original file path from base64
    const originalFilePath = Buffer.from(fileId, 'base64').toString('utf-8')
    const originalFullPath = path.join(process.cwd(), 'public', originalFilePath)

    // Check if original file exists
    try {
      await fs.access(originalFullPath)
    } catch {
      return NextResponse.json(
        { error: 'Original file not found' },
        { status: 404 }
      )
    }

    // Get the directory and filename
    const parsedPath = path.parse(originalFilePath)
    const directory = parsedPath.dir
    const fileExtension = path.extname(file.name)
    const baseName = parsedPath.name

    // Create a backup of the original file
    const backupPath = path.join(
      path.dirname(originalFullPath), 
      `${baseName}_backup_${Date.now()}${parsedPath.ext}`
    )
    await fs.copyFile(originalFullPath, backupPath)

    // Read the new file
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Replace the original file
    await fs.writeFile(originalFullPath, buffer)

    // Update metadata if it exists
    const metadataPath = originalFullPath + '.meta.json'
    try {
      const metadataContent = await fs.readFile(metadataPath, 'utf-8')
      const metadata = JSON.parse(metadataContent)
      
      metadata.updatedAt = new Date().toISOString()
      metadata.updatedBy = user.email
      metadata.originalName = file.name
      metadata.size = buffer.length
      
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
    } catch {
      // Create new metadata if it doesn't exist
      const metadata = {
        title: baseName,
        altText: '',
        description: '',
        tags: [],
        category: directory.split('/').pop() || 'other',
        originalName: file.name,
        size: buffer.length,
        updatedAt: new Date().toISOString(),
        updatedBy: user.email
      }
      
      await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))
    }

    // Get file stats
    const stats = await fs.stat(originalFullPath)

    return NextResponse.json({
      success: true,
      data: {
        id: fileId,
        name: file.name,
        originalName: file.name,
        url: `/${originalFilePath}`,
        size: stats.size,
        updatedAt: stats.mtime.toISOString(),
        message: 'File replaced successfully'
      }
    })

  } catch (error) {
    console.error('Error replacing file:', error)
    return NextResponse.json(
      { 
        error: 'Failed to replace file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}