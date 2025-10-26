import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugFooter() {
  try {
    console.log('🔍 Debugging footer data...')
    
    // Get footer columns
    const columns = await prisma.footerColumn.findMany({
      orderBy: { order: 'asc' }
    })
    
    console.log('\n📋 Footer Columns:')
    columns.forEach((column, index) => {
      console.log(`\n${index + 1}. ${column.title} (${column.type})`)
      console.log(`   Content: ${column.content}`)
      console.log(`   Parsed: ${JSON.stringify(JSON.parse(column.content), null, 2)}`)
    })
    
    // Get footer content
    const footerContent = await prisma.footerContent.findFirst()
    console.log('\n📄 Footer Content:')
    console.log(`   Copyright: ${footerContent?.copyrightText}`)
    
    // Get social links
    const socialLinks = await prisma.footerSocial.findFirst()
    console.log('\n🔗 Social Links:')
    console.log(`   Facebook: ${socialLinks?.facebook}`)
    console.log(`   Twitter: ${socialLinks?.twitter}`)
    console.log(`   Instagram: ${socialLinks?.instagram}`)
    
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugFooter()