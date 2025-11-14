import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function updateNavigation() {
  try {
    console.log('🔄 Updating navigation data...')

    // Update existing navigation items with correct links
    const navigationUpdates = [
      { id: 'nav-home', label: 'الرئيسية', href: '/', order: 1 },
      { id: 'nav-vehicles', label: 'السيارات', href: '/vehicles', order: 2 },
      { id: 'nav-test-drive', label: 'قيادة تجريبية', href: '/test-drive', order: 3 },
      { id: 'nav-service-booking', label: 'حجز خدمة', href: '/service-booking', order: 4 },
      { id: 'nav-consultation', label: 'استشارة', href: '/consultation', order: 5 },
      { id: 'nav-contact', label: 'اتصل بنا', href: '/contact', order: 6 }
    ]

    // Get existing items
    const existingItems = await prisma.headerNavigation.findMany()
    
    // Update or create each navigation item
    for (const update of navigationUpdates) {
      const existingItem = existingItems.find(item => 
        item.label === update.label || item.href === update.href
      )
      
      if (existingItem) {
        await prisma.headerNavigation.update({
          where: { id: existingItem.id },
          data: {
            label: update.label,
            href: update.href,
            order: update.order,
            isVisible: true
          }
        })
        console.log(`✅ Updated: ${update.label} -> ${update.href}`)
      } else {
        await prisma.headerNavigation.create({
          data: {
            id: update.id,
            label: update.label,
            href: update.href,
            order: update.order,
            isVisible: true
          }
        })
        console.log(`✅ Created: ${update.label} -> ${update.href}`)
      }
    }

    // Update site settings with navigation
    const siteSettings = await prisma.siteSettings.findFirst()
    
    const navigationData = navigationUpdates.map(item => ({
      id: item.id,
      label: item.label,
      href: item.href,
      order: item.order,
      isVisible: true
    }))

    if (siteSettings) {
      await prisma.siteSettings.update({
        where: { id: siteSettings.id },
        data: {
          headerSettings: {
            ...(siteSettings.headerSettings as any || {}),
            navigation: navigationData
          }
        }
      })
      console.log('✅ Updated site settings with navigation')
    } else {
      await prisma.siteSettings.create({
        data: {
          id: 'default',
          siteTitle: 'Al-Hamd Cars',
          siteDescription: 'Your Trusted Car Dealership',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          accentColor: '#F59E0B',
          fontFamily: 'Inter',
          contactEmail: 'info@elhamdimport.com',
          headerSettings: {
            navigation: navigationData
          },
          footerSettings: {},
          seoSettings: {}
        }
      })
      console.log('✅ Created site settings with navigation')
    }

    console.log('🎉 Navigation update completed successfully!')

  } catch (error) {
    console.error('❌ Error updating navigation:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

updateNavigation()