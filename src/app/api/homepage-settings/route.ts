import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { HomepageTheme } from '@prisma/client'

const DEFAULT_SETTINGS = {
  showHeroSlider: true,
  autoPlaySlider: true,
  sliderInterval: 5000,
  showFeaturedVehicles: true,
  featuredVehiclesCount: 6,
  showServices: true,
  showCompanyInfo: true,
  servicesTitle: 'خدماتنا المتكاملة',
  servicesSubtitle: 'نقدم مجموعة شاملة من الخدمات لضمان أفضل تجربة لعملائنا',
  servicesDescription: 'اكتشف حلولنا المتكاملة في البيع، الصيانة، التمويل، وقطع الغيار مع فريق دعم متخصص.',
  servicesCtaText: 'احجز الآن',
  facebookPageUrl: 'https://www.facebook.com/elhamdimport',
  theme: HomepageTheme.LIGHT
}

export async function GET() {
  try {
    const settings = await db.homepageSettings.findFirst()

    if (!settings) {
      return NextResponse.json(DEFAULT_SETTINGS, {
        headers: { 'Cache-Control': 'no-store' }
      })
    }

    return NextResponse.json(
      {
        ...DEFAULT_SETTINGS,
        ...settings
      },
      { headers: { 'Cache-Control': 'no-store' } }
    )
  } catch (error) {
    console.error('Error fetching public homepage settings:', error)
    return NextResponse.json(DEFAULT_SETTINGS, {
      headers: { 'Cache-Control': 'no-store' },
      status: 200
    })
  }
}
