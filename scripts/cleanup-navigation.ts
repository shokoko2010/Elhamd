import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function cleanupNavigation() {
  try {
    console.log('🧹 Cleaning up navigation data...')

    // Delete all existing navigation items
    await prisma.headerNavigation.deleteMany({})
    console.log('✅ Deleted all existing navigation items')

    // Create clean navigation items
    const navigationItems = [
      {
        id: 'nav-home',
        label: 'الرئيسية',
        href: '/',
        order: 1,
        isVisible: true
      },
      {
        id: 'nav-vehicles',
        label: 'السيارات',
        href: '/vehicles',
        order: 2,
        isVisible: true
      },
      {
        id: 'nav-test-drive',
        label: 'قيادة تجريبية',
        href: '/test-drive',
        order: 3,
        isVisible: true
      },
      {
        id: 'nav-service-booking',
        label: 'حجز خدمة',
        href: '/service-booking',
        order: 4,
        isVisible: true
      },
      {
        id: 'nav-consultation',
        label: 'استشارة',
        href: '/consultation',
        order: 5,
        isVisible: true
      },
      {
        id: 'nav-contact',
        label: 'اتصل بنا',
        href: '/contact',
        order: 6,
        isVisible: true
      }
    ]

    // Insert navigation items
    for (const item of navigationItems) {
      await prisma.headerNavigation.create({
        data: item
      })
      console.log(`✅ Created: ${item.label} -> ${item.href}`)
    }

    // Update site settings with clean navigation
    const siteSettings = await prisma.siteSettings.findFirst()
    
    const navigationData = navigationItems.map(item => ({
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
      console.log('✅ Updated site settings with clean navigation')
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
      console.log('✅ Created site settings with clean navigation')
    }

    console.log('🎉 Navigation cleanup completed successfully!')

  } catch (error) {
    console.error('❌ Error cleaning up navigation:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

cleanupNavigation()