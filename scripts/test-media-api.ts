import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testMediaAPI() {
  try {
    console.log('🔍 Testing Media API functionality...')
    
    // Test database connection
    await prisma.$connect()
    console.log('✅ Database connected')
    
    // Test if media table exists and is accessible
    const mediaCount = await prisma.media.count()
    console.log(`✅ Media table accessible, found ${mediaCount} existing media items`)
    
    // Test creating a simple media record (without file)
    const testMedia = await prisma.media.create({
      data: {
        filename: 'test-file.jpg',
        originalName: 'test-file.jpg',
        path: '/uploads/media/test-file.jpg',
        url: '/uploads/media/test-file.jpg',
        mimeType: 'image/jpeg',
        size: 1024,
        tags: JSON.stringify(['test']),
        category: 'test',
        createdBy: 'test-user'
      }
    })
    
    console.log('✅ Test media record created:', testMedia.id)
    
    // Clean up test record
    await prisma.media.delete({
      where: { id: testMedia.id }
    })
    console.log('✅ Test record cleaned up')
    
    console.log('🎉 All tests passed! Media API should work correctly.')
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testMediaAPI()