import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedFooterLinks() {
  try {
    console.log('🚀 Starting footer links seeding...')

    // Clear existing footer columns
    await prisma.footerColumn.deleteMany()
    console.log('🗑️ Cleared existing footer columns')

    // Create footer columns with proper links
    const footerColumns = [
      {
        id: 'footer-quick-links',
        title: 'روابط سريعة',
        content: JSON.stringify([
          { text: 'الرئيسية', href: '/' },
          { text: 'السيارات', href: '/vehicles' },
          { text: 'الخدمات', href: '/service-booking' },
          { text: 'من نحن', href: '/about' },
          { text: 'اتصل بنا', href: '/contact' }
        ]),
        order: 1,
        isVisible: true,
        type: 'LINKS'
      },
      {
        id: 'footer-services',
        title: 'خدماتنا',
        content: JSON.stringify([
          { text: 'بيع السيارات', href: '/vehicles' },
          { text: 'قيادة تجريبية', href: '/test-drive' },
          { text: 'حجز الخدمة', href: '/service-booking' },
          { text: 'التمويل', href: '/financing' },
          { text: 'الصيانة', href: '/maintenance' }
        ]),
        order: 2,
        isVisible: true,
        type: 'LINKS'
      },
      {
        id: 'footer-contact',
        title: 'معلومات التواصل',
        content: JSON.stringify([
          { text: '+20 2 1234 5678', href: 'tel:+20212345678' },
          { text: 'info@elhamdimport.com', href: 'mailto:info@elhamdimport.com' },
          { text: 'القاهرة، مصر', href: 'https://maps.google.com/?q=Cairo+Egypt' },
          { text: 'السبت - الخميس: 9:00 ص - 8:00 م', href: '#' }
        ]),
        order: 3,
        isVisible: true,
        type: 'CONTACT'
      },
      {
        id: 'footer-social',
        title: 'تابعنا',
        content: JSON.stringify([
          { text: 'فيسبوك', href: 'https://facebook.com/elhamdcars' },
          { text: 'تويتر', href: 'https://twitter.com/elhamdcars' },
          { text: 'انستغرام', href: 'https://instagram.com/elhamdcars' },
          { text: 'لينكدإن', href: 'https://linkedin.com/company/elhamdcars' }
        ]),
        order: 4,
        isVisible: true,
        type: 'SOCIAL'
      },
      {
        id: 'footer-legal',
        title: 'سياسة الخصوصية',
        content: JSON.stringify([
          { text: 'سياسة الخصوصية', href: '/privacy' },
          { text: 'الشروط والأحكام', href: '/terms' },
          { text: 'الأسئلة الشائعة', href: '/faq' },
          { text: 'خريطة الموقع', href: '/sitemap' }
        ]),
        order: 5,
        isVisible: true,
        type: 'LINKS'
      },
      {
        id: 'footer-support',
        title: 'الدعم الفني',
        content: JSON.stringify([
          { text: 'الدعم الفني', href: '/support' },
          { text: 'الضمان', href: '/warranty' },
          { text: 'الصيانة', href: '/maintenance' },
          { text: 'قطع الغيار', href: '/parts' }
        ]),
        order: 6,
        isVisible: true,
        type: 'LINKS'
      }
    ]

    // Insert footer columns
    for (const column of footerColumns) {
      await prisma.footerColumn.create({
        data: column
      })
      console.log(`✅ Created footer column: ${column.title}`)
    }

    // Update footer content with proper links
    const existingFooterContent = await prisma.footerContent.findFirst()
    
    if (existingFooterContent) {
      await prisma.footerContent.update({
        where: { id: existingFooterContent.id },
        data: {
          primaryPhone: '+20 2 1234 5678',
          primaryEmail: 'info@elhamdimport.com',
          address: 'القاهرة، مصر',
          workingHours: 'السبت - الخميس: 9:00 ص - 8:00 م',
          copyrightText: `© ${new Date().getFullYear()} <a href="/" style="color: inherit; text-decoration: none;">Al-Hamd Cars</a>. جميع الحقوق محفوظة. | <a href="/privacy" style="color: inherit;">سياسة الخصوصية</a> | <a href="/terms" style="color: inherit;">الشروط والأحكام</a>`,
          newsletterText: 'اشترك في نشرتنا البريدية للحصول على أحدث العروض والتحديثات',
          backToTopText: 'العودة للأعلى'
        }
      })
      console.log('✅ Updated footer content')
    } else {
      await prisma.footerContent.create({
        data: {
          primaryPhone: '+20 2 1234 5678',
          primaryEmail: 'info@elhamdimport.com',
          address: 'القاهرة، مصر',
          workingHours: 'السبت - الخميس: 9:00 ص - 8:00 م',
          copyrightText: `© ${new Date().getFullYear()} <a href="/" style="color: inherit; text-decoration: none;">Al-Hamd Cars</a>. جميع الحقوق محفوظة. | <a href="/privacy" style="color: inherit;">سياسة الخصوصية</a> | <a href="/terms" style="color: inherit;">الشروط والأحكام</a>`,
          newsletterText: 'اشترك في نشرتنا البريدية للحصول على أحدث العروض والتحديثات',
          backToTopText: 'العودة للأعلى'
        }
      })
      console.log('✅ Created footer content')
    }

    // Update social links
    const existingSocialLinks = await prisma.footerSocial.findFirst()
    
    if (existingSocialLinks) {
      await prisma.footerSocial.update({
        where: { id: existingSocialLinks.id },
        data: {
          facebook: 'https://facebook.com/elhamdcars',
          twitter: 'https://twitter.com/elhamdcars',
          instagram: 'https://instagram.com/elhamdcars',
          linkedin: 'https://linkedin.com/company/elhamdcars',
          youtube: 'https://youtube.com/@elhamdcars',
          tiktok: 'https://tiktok.com/@elhamdcars'
        }
      })
      console.log('✅ Updated social links')
    } else {
      await prisma.footerSocial.create({
        data: {
          facebook: 'https://facebook.com/elhamdcars',
          twitter: 'https://twitter.com/elhamdcars',
          instagram: 'https://instagram.com/elhamdcars',
          linkedin: 'https://linkedin.com/company/elhamdcars',
          youtube: 'https://youtube.com/@elhamdcars',
          tiktok: 'https://tiktok.com/@elhamdcars'
        }
      })
      console.log('✅ Created social links')
    }

    console.log('🎉 Footer links seeding completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding footer links:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the seeding
seedFooterLinks()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })