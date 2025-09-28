const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedDefaultPopups() {
  try {
    console.log('🌱 Seeding default popup configurations...')

    const defaultPopups = [
      {
        title: 'مرحباً بك في الحمد للسيارات',
        content: 'اكتشف أحدث موديلات تاتا مع ضمان المصنع الكامل وخدمة ما بعد البيع المتميزة. قم بزيارة معرضنا الآن!',
        buttonText: 'استعرض السيارات',
        linkUrl: '/vehicles',
        buttonColor: '#3b82f6',
        textColor: '#ffffff',
        backgroundColor: '#1f2937',
        position: 'BOTTOM_RIGHT',
        showDelay: 3000,
        autoHide: true,
        hideDelay: 10000,
        isActive: true,
        showOnPages: '["homepage"]',
        targetAudience: 'new',
        priority: 10,
      },
      {
        title: 'عرض خاص على سيارات تاتا',
        content: 'احصل على خصم 15% على جميع سيارات تاتا لفترة محدودة. لا تفوت هذه الفرصة!',
        buttonText: 'اطلع على العرض',
        linkUrl: '/vehicles?featured=true',
        buttonColor: '#ef4444',
        textColor: '#ffffff',
        backgroundColor: '#7c2d12',
        position: 'TOP_CENTER',
        showDelay: 5000,
        autoHide: false,
        hideDelay: 15000,
        isActive: true,
        showOnPages: '["homepage", "vehicles"]',
        targetAudience: 'all',
        priority: 8,
      },
      {
        title: 'خدمة الصيانة المتميزة',
        content: 'نقدم خدمة صيانة سيارات تاتا باستخدام قطع غيار أصلية وفنيين مدربين. احجز موعدك الآن!',
        buttonText: 'احجز موعد',
        linkUrl: '/service-booking',
        buttonColor: '#10b981',
        textColor: '#ffffff',
        backgroundColor: '#064e3b',
        position: 'BOTTOM_LEFT',
        showDelay: 4000,
        autoHide: true,
        hideDelay: 12000,
        isActive: true,
        showOnPages: '["homepage"]',
        targetAudience: 'returning',
        priority: 5,
      }
    ]

    for (const popupData of defaultPopups) {
      const existingPopup = await prisma.popupConfig.findFirst({
        where: { title: popupData.title }
      })

      if (!existingPopup) {
        await prisma.popupConfig.create({
          data: popupData
        })
        console.log(`✅ Created popup: ${popupData.title}`)
      } else {
        console.log(`⚠️ Popup already exists: ${popupData.title}`)
      }
    }

    console.log('🎉 Default popup configurations seeded successfully!')
  } catch (error) {
    console.error('❌ Error seeding default popups:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedDefaultPopups()