import { PrismaClient } from '@prisma/client'
import { promises as fs } from 'fs'
import path from 'path'

const prisma = new PrismaClient()

async function scanDirectory(dirPath: string, category: string = 'general') {
  const files: Array<{
    filename: string
    originalName: string
    path: string
    url: string
    thumbnailUrl: string
    size: number
    mimeType: string
    type: string
    category: string
    altText: string
    title: string
    description: string
    tags: string[]
    uploadedBy: string
    createdAt: Date
    updatedAt: Date
  }> = []
  
  try {
    const items = await fs.readdir(dirPath, { withFileTypes: true })
    
    for (const item of items) {
      if (item.isFile()) {
        const fullPath = path.join(dirPath, item.name)
        const stats = await fs.stat(fullPath)
        const relativePath = path.relative('/home/z/my-project/public', fullPath)
        
        // Determine category based on path
        let fileCategory = category
        if (relativePath.includes('vehicles')) {
          fileCategory = 'vehicles'
        } else if (relativePath.includes('banners')) {
          fileCategory = 'banners'
        } else if (relativePath.includes('showroom')) {
          fileCategory = 'company'
        } else if (relativePath.includes('dealership')) {
          fileCategory = 'company'
        } else if (relativePath.includes('logo')) {
          fileCategory = 'brand'
        }
        
        files.push({
          filename: item.name,
          originalName: item.name,
          path: relativePath,
          url: `/${relativePath}`,
          thumbnailUrl: `/${relativePath}`,
          size: stats.size,
          mimeType: getMimeType(item.name),
          type: getFileType(item.name),
          category: fileCategory,
          altText: generateAltText(item.name, fileCategory),
          title: generateTitle(item.name),
          description: generateDescription(item.name, fileCategory),
          tags: generateTags(item.name, fileCategory),
          uploadedBy: 'admin',
          createdAt: stats.mtime,
          updatedAt: stats.mtime
        })
      } else if (item.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(path.join(dirPath, item.name), item.name)
        files.push(...subFiles)
      }
    }
  } catch (error) {
    console.error(`Error scanning directory ${dirPath}:`, error)
  }
  
  return files
}

function getMimeType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const mimeTypes: { [key: string]: string } = {
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.png': 'image/png',
    '.gif': 'image/gif',
    '.webp': 'image/webp',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.doc': 'application/msword',
    '.docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    '.xls': 'application/vnd.ms-excel',
    '.xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  }
  return mimeTypes[ext] || 'application/octet-stream'
}

function getFileType(filename: string): string {
  const ext = path.extname(filename).toLowerCase()
  const imageTypes = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg']
  const documentTypes = ['.pdf', '.doc', '.docx', '.xls', '.xlsx']
  
  if (imageTypes.includes(ext)) return 'image'
  if (documentTypes.includes(ext)) return 'document'
  return 'file'
}

function generateAltText(filename: string, category: string): string {
  const name = path.parse(filename).name
  switch (category) {
    case 'vehicles':
      return `صورة ${name.replace(/[-_]/g, ' ')}`
    case 'banners':
      return `بانر ${name.replace(/[-_]/g, ' ')}`
    case 'company':
      return `صورة المعرض ${name.replace(/[-_]/g, ' ')}`
    case 'brand':
      return `شعار ${name.replace(/[-_]/g, ' ')}`
    default:
      return `صورة ${name.replace(/[-_]/g, ' ')}`
  }
}

function generateTitle(filename: string): string {
  const name = path.parse(filename).name
  return name.replace(/[-_]/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function generateDescription(filename: string, category: string): string {
  const name = path.parse(filename).name
  switch (category) {
    case 'vehicles':
      return `صورة لسيارة ${name.replace(/[-_]/g, ' ')}`
    case 'banners':
      return `بانر ترويجي لـ ${name.replace(/[-_]/g, ' ')}`
    case 'company':
      return `صورة لمعرض الحمد للسيارات`
    case 'brand':
      return `شعار شركة الحمد للسيارات`
    default:
      return `ملف ${name.replace(/[-_]/g, ' ')}`
  }
}

function generateTags(filename: string, category: string): string[] {
  const name = path.parse(filename).name.toLowerCase()
  const tags: string[] = [category]
  
  // Add specific tags based on filename
  if (name.includes('nexon')) tags.push('nexon', 'تاتا', 'suv')
  if (name.includes('tiago')) tags.push('tiago', 'تاتا', 'هايتباك')
  if (name.includes('punch')) tags.push('punch', 'تاتا', 'ميني suv')
  if (name.includes('tigor')) tags.push('tigor', 'تاتا', 'سيدان')
  if (name.includes('harrier')) tags.push('harrier', 'تاتا', 'suv')
  if (name.includes('altroz')) tags.push('altroz', 'تاتا', 'هايتباك')
  if (name.includes('electric')) tags.push('كهربائي', 'ev')
  if (name.includes('banner')) tags.push('بانر', 'ترويجي')
  if (name.includes('showroom')) tags.push('معرض', 'محل')
  if (name.includes('logo')) tags.push('شعار', 'علامة تجارية')
  
  return tags
}

async function main() {
  try {
    console.log('Starting to scan uploads directory...')
    
    // Clear existing media files
    console.log('Clearing existing media files...')
    await prisma.media.deleteMany({})
    
    // Scan the uploads directory
    const uploadsPath = '/home/z/my-project/public/uploads'
    const mediaFiles = await scanDirectory(uploadsPath)
    
    console.log(`Found ${mediaFiles.length} media files`)
    
    // Insert media files into database
    for (const file of mediaFiles) {
      await prisma.media.create({
        data: {
          filename: file.filename,
          originalName: file.originalName,
          path: file.path,
          url: file.url,
          thumbnailUrl: file.thumbnailUrl,
          mimeType: file.mimeType,
          size: file.size,
          altText: file.altText,
          title: file.title,
          description: file.description,
          tags: JSON.stringify(file.tags),
          category: file.category,
          entityId: null,
          isPublic: true,
          isFeatured: false,
          order: 0,
          metadata: null,
          createdBy: file.uploadedBy,
          createdAt: file.createdAt,
          updatedAt: file.updatedAt
        }
      })
    }
    
    console.log(`Successfully added ${mediaFiles.length} media files to the database`)
    
    // Verify the count
    const totalCount = await prisma.media.count()
    console.log(`Total media files in database: ${totalCount}`)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()