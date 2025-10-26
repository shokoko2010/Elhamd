import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkNavigation() {
  try {
    console.log('🔍 Checking navigation data...')

    // Check header navigation table
    const headerNavItems = await prisma.headerNavigation.findMany({
      orderBy: { order: 'asc' }
    })
    
    console.log(`\n📋 Header Navigation Items (${headerNavItems.length}):`)
    headerNavItems.forEach(item => {
      console.log(`  ${item.order}. ${item.label} -> ${item.href} (${item.isVisible ? 'Visible' : 'Hidden'})`)
    })

    // Check site settings
    const siteSettings = await prisma.siteSettings.findFirst()
    
    if (siteSettings?.headerSettings?.navigation) {
      console.log(`\n⚙️ Site Settings Navigation:`)
      const navSettings = siteSettings.headerSettings.navigation as any[]
      navSettings.forEach((item, index) => {
        console.log(`  ${index + 1}. ${item.label} -> ${item.href} (${item.isVisible ? 'Visible' : 'Hidden'})`)
      })
    } else {
      console.log('\n⚙️ No navigation found in site settings')
    }

    // Test API response
    console.log('\n🌐 Testing API response...')
    const response = await fetch('http://localhost:3000/api/header/navigation')
    if (response.ok) {
      const data = await response.json()
      console.log(`✅ API returned ${data.length} navigation items:`)
      data.forEach((item: any, index: number) => {
        console.log(`  ${index + 1}. ${item.label} -> ${item.href} (${item.isVisible ? 'Visible' : 'Hidden'})`)
      })
    } else {
      console.log(`❌ API failed with status: ${response.status}`)
    }

  } catch (error) {
    console.error('❌ Error checking navigation:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkNavigation()