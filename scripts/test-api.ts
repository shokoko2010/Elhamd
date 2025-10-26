import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function testApi() {
  try {
    console.log('🧪 Testing API directly...')

    // Test database connection
    const settings = await prisma.siteSettings.findFirst()
    console.log('✅ Database connection successful')
    
    if (settings?.headerSettings?.navigation) {
      console.log('✅ Found navigation in site settings')
      console.log('Navigation data:', JSON.stringify(settings.headerSettings.navigation, null, 2))
    } else {
      console.log('❌ No navigation in site settings')
    }

    // Test header navigation table
    const navItems = await prisma.headerNavigation.findMany({
      orderBy: { order: 'asc' }
    })
    
    console.log(`✅ Found ${navItems.length} navigation items in header_navigation table`)
    navItems.forEach(item => {
      console.log(`  ${item.order}. ${item.label} -> ${item.href}`)
    })

    // Return the navigation data
    const navigationData = settings?.headerSettings?.navigation || navItems
    
    console.log('\n📤 Final navigation data to return:')
    console.log(JSON.stringify(navigationData, null, 2))

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

testApi()