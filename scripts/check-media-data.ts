import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkMediaData() {
  try {
    console.log('Checking media data in database...')

    const mediaFiles = await prisma.media.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' }
    })

    console.log(`Found ${mediaFiles.length} media files:`)
    
    for (const media of mediaFiles) {
      console.log('\n--- Media File ---')
      console.log('ID:', media.id)
      console.log('Filename:', media.filename)
      console.log('Original Name:', media.originalName)
      console.log('URL:', media.url)
      console.log('Thumbnail URL:', media.thumbnailUrl)
      console.log('MIME Type:', media.mimeType)
      console.log('Size:', media.size)
      console.log('Category:', media.category)
      console.log('Tags:', media.tags)
      console.log('Created At:', media.createdAt)
      console.log('Created By:', media.createdBy)
    }

    const totalCount = await prisma.media.count()
    console.log(`\nTotal media files: ${totalCount}`)

  } catch (error) {
    console.error('Error checking media data:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkMediaData()