import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

export async function GET(request: NextRequest) {
  try {
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Recursively get all files in uploads directory
    function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
      const files = fs.readdirSync(dirPath)
      
      files.forEach(file => {
        const fullPath = path.join(dirPath, file)
        if (fs.statSync(fullPath).isDirectory()) {
          arrayOfFiles = getAllFiles(fullPath, arrayOfFiles)
        } else {
          arrayOfFiles.push(fullPath)
        }
      })
      
      return arrayOfFiles
    }
    
    const allFiles = getAllFiles(uploadsDir)
    
    // Filter for image files and create media objects
    const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
    const mediaFiles = allFiles
      .filter(file => {
        const ext = path.extname(file).toLowerCase()
        return imageExtensions.includes(ext)
      })
      .map(file => {
        const relativePath = path.relative(path.join(process.cwd(), 'public'), file)
        const stats = fs.statSync(file)
        
        return {
          id: relativePath.replace(/[^a-zA-Z0-9]/g, '_'),
          filename: path.basename(file),
          originalName: path.basename(file),
          path: relativePath,
          url: '/' + relativePath.replace(/\\/g, '/'),
          thumbnailUrl: '/' + relativePath.replace(/\\/g, '/'),
          mimeType: `image/${path.extname(file).slice(1)}`,
          size: stats.size,
          altText: path.basename(file).replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
          title: path.basename(file).replace(/\.[^/.]+$/, "").replace(/[-_]/g, ' '),
          category: 'general',
          tags: [],
          isPublic: true,
          isFeatured: false,
          order: 0,
          metadata: {},
          createdAt: stats.birthtime.toISOString(),
          updatedAt: stats.mtime.toISOString()
        }
      })
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
    
    return NextResponse.json({
      success: true,
      data: {
        files: mediaFiles,
        total: mediaFiles.length,
        hasMore: false
      }
    })
    
  } catch (error) {
    console.error('Error fetching public media:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch media' },
      { status: 500 }
    )
  }
}