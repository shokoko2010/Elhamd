import { PrismaClient } from '@prisma/client'
import { readdir, stat } from 'fs/promises'
import path from 'path'

const prisma = new PrismaClient()

async function addExistingMedia() {
  try {
    console.log('🔄 Starting to add existing media to database...')
    
    const uploadsDir = path.join(process.cwd(), 'public', 'uploads')
    
    // Recursively find all image files
    async function findImages(dir: string, basePath = ''): Promise<string[]> {
      const files: string[] = []
      const entries = await readdir(dir, { withFileTypes: true })
      
      for (const entry of entries) {
        const fullPath = path.join(dir, entry.name)
        const relativePath = basePath ? path.join(basePath, entry.name) : entry.name
        
        if (entry.isDirectory()) {
          files.push(...await findImages(fullPath, relativePath))
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase()
          if (['.jpg', '.jpeg', '.png', '.webp', '.gif'].includes(ext)) {
            files.push(relativePath)
          }
        }
      }
      
      return files
    }
    
    const imageFiles = await findImages(uploadsDir)
    console.log(`📁 Found ${imageFiles.length} image files`)
    
    for (const imagePath of imageFiles) {
      const fullPath = path.join(uploadsDir, imagePath)
      const stats = await stat(fullPath)
      
      // Determine category based on path
      let category = 'other'
      if (imagePath.includes('vehicles')) category = 'vehicles'
      else if (imagePath.includes('banners')) category = 'banner'
      else if (imagePath.includes('logo')) category = 'company'
      else if (imagePath.includes('showroom')) category = 'gallery'
      else if (imagePath.includes('thumbnails')) category = 'gallery'
      
      // Check if already exists
      const existing = await prisma.media.findFirst({
        where: { url: `/uploads/${imagePath}` }
      })
      
      if (existing) {
        console.log(`⏭️  Skipping existing: ${imagePath}`)
        continue
      }
      
      // Create media record
      await prisma.media.create({
        data: {
          filename: path.basename(imagePath),
          originalName: path.basename(imagePath),
          path: `/uploads/${imagePath}`,
          url: `/uploads/${imagePath}`,
          thumbnailUrl: `/uploads/${imagePath}`,
          mimeType: `image/${path.extname(imagePath).slice(1)}`,
          size: stats.size,
          width: null,
          height: null,
          altText: path.basename(imagePath, path.extname(imagePath)),
          title: path.basename(imagePath, path.extname(imagePath)),
          description: '',
          tags: JSON.stringify([]),
          category: category,
          entityId: null,
          isPublic: true,
          isFeatured: false,
          order: 0,
          metadata: JSON.stringify({
            originalPath: imagePath,
            addedAt: new Date().toISOString()
          }),
          createdBy: 'system'
        }
      })
      
      console.log(`✅ Added: ${imagePath} (${category})`)
    }
    
    console.log('🎉 Finished adding existing media to database!')
    
  } catch (error) {
    console.error('❌ Error adding existing media:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addExistingMedia()