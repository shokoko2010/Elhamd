import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'
import { getSimpleUser } from '@/lib/simple-auth'

export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getSimpleUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const folder = searchParams.get('folder') || ''
    const recursive = searchParams.get('recursive') === 'true'

    // Build the uploads directory path
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    const targetDir = folder ? path.join(uploadsDir, folder) : uploadsDir

    // Check if directory exists
    try {
      await fs.access(targetDir)
    } catch {
      // Directory doesn't exist, return empty list
      return NextResponse.json({
        success: true,
        data: {
          files: [],
          folders: [],
          currentPath: folder
        }
      })
    }

    const files = []
    const folders = []

    // Recursive function to read all image files
    async function readImageFiles(dirPath: string, currentFolder: string): Promise<void> {
      const entries = await fs.readdir(dirPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = path.join(dirPath, entry.name)
        const stats = await fs.stat(fullPath)

        if (entry.isDirectory()) {
          // Get file count in subdirectory
          try {
            const subEntries = await fs.readdir(fullPath)
            folders.push({
              name: entry.name,
              path: path.join(currentFolder, entry.name).replace(/\\/g, '/'),
              fileCount: subEntries.length,
              createdAt: stats.birthtime.toISOString(),
              modifiedAt: stats.mtime.toISOString()
            })
          } catch {
            folders.push({
              name: entry.name,
              path: path.join(currentFolder, entry.name).replace(/\\/g, '/'),
              fileCount: 0,
              createdAt: stats.birthtime.toISOString(),
              modifiedAt: stats.mtime.toISOString()
            })
          }

          // Recursively read subdirectories if recursive is true
          if (recursive) {
            await readImageFiles(fullPath, path.join(currentFolder, entry.name).replace(/\\/g, '/'))
          }
        } else if (entry.isFile()) {
          // Check if it's an image file
          const ext = path.extname(entry.name).toLowerCase()
          const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg', '.bmp', '.ico']
          
          if (imageExtensions.includes(ext)) {
            const relativePath = path.join('uploads', currentFolder, entry.name).replace(/\\/g, '/')
            const url = `/${relativePath}`
            
            // Try to load metadata if it exists
            let metadata = {}
            try {
              const metadataPath = fullPath + '.meta.json'
              const metadataContent = await fs.readFile(metadataPath, 'utf-8')
              metadata = JSON.parse(metadataContent)
            } catch {
              // No metadata file, use defaults
            }
            
            files.push({
              id: Buffer.from(relativePath).toString('base64'),
              name: entry.name,
              originalName: entry.name,
              url: url,
              thumbnailUrl: url,
              size: stats.size,
              type: 'image',
              mimeType: `image/${ext.slice(1)}`,
              altText: metadata.altText || '',
              title: metadata.title || entry.name.replace(/\.[^/.]+$/, ''),
              description: metadata.description || '',
              tags: metadata.tags || [],
              category: metadata.category || currentFolder || 'other',
              uploadedAt: stats.birthtime.toISOString(),
              updatedAt: stats.mtime.toISOString(),
              uploadedBy: user.email,
              width: null,
              height: null,
              isPublic: true,
              isFeatured: false,
              folder: currentFolder,
              path: relativePath
            })
          }
        }
      }
    }

    await readImageFiles(targetDir, folder)

    // Sort files by modified date (newest first)
    files.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

    return NextResponse.json({
      success: true,
      data: {
        files,
        folders,
        currentPath: folder,
        totalCount: files.length
      }
    })

  } catch (error) {
    console.error('Error reading uploads directory:', error)
    return NextResponse.json(
      { 
        error: 'Failed to read uploads directory',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getSimpleUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { id, title, altText, description, tags, category } = body

    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Decode the file path from base64
    const filePath = Buffer.from(id, 'base64').toString('utf-8')
    const fullPath = path.join(process.cwd(), 'public', filePath)

    // Check if file exists
    try {
      await fs.access(fullPath)
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // For file system based media, we can't store metadata directly
    // Instead, we'll create a metadata file alongside the image
    const metadataPath = fullPath + '.meta.json'
    const metadata = {
      title,
      altText,
      description,
      tags: tags || [],
      category,
      updatedAt: new Date().toISOString(),
      updatedBy: user.email
    }

    await fs.writeFile(metadataPath, JSON.stringify(metadata, null, 2))

    return NextResponse.json({
      success: true,
      data: {
        id,
        title,
        altText,
        description,
        tags,
        category,
        updatedAt: metadata.updatedAt
      }
    })

  } catch (error) {
    console.error('Error updating file metadata:', error)
    return NextResponse.json(
      { 
        error: 'Failed to update file metadata',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Verify authentication
    const user = await getSimpleUser(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'File ID is required' },
        { status: 400 }
      )
    }

    // Decode the file path from base64
    const filePath = Buffer.from(id, 'base64').toString('utf-8')
    const fullPath = path.join(process.cwd(), 'public', filePath)

    // Check if file exists
    try {
      await fs.access(fullPath)
    } catch {
      return NextResponse.json(
        { error: 'File not found' },
        { status: 404 }
      )
    }

    // Delete the file
    await fs.unlink(fullPath)

    // Also delete metadata file if it exists
    const metadataPath = fullPath + '.meta.json'
    try {
      await fs.unlink(metadataPath)
    } catch {
      // Metadata file doesn't exist, that's fine
    }

    return NextResponse.json({
      success: true,
      message: 'File deleted successfully'
    })

  } catch (error) {
    console.error('Error deleting file:', error)
    return NextResponse.json(
      { 
        error: 'Failed to delete file',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}