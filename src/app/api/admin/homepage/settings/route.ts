import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser, UserRole } from '@/lib/auth-server'
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
  facebookVideoUrl: 'https://www.facebook.com/elhamdimport/videos',
  theme: 'LIGHT' as HomepageTheme
}

const sanitizeBoolean = (value: unknown, fallback: boolean) => {
  if (typeof value === 'boolean') return value
  if (typeof value === 'string') {
    if (value.toLowerCase() === 'true') return true
    if (value.toLowerCase() === 'false') return false
  }
  return fallback
}

const sanitizeNumber = (value: unknown, fallback: number, options?: { min?: number; max?: number }) => {
  const parsed = typeof value === 'string' ? Number.parseInt(value, 10) : typeof value === 'number' ? value : Number.NaN
  if (Number.isNaN(parsed)) return fallback
  if (options?.min !== undefined && parsed < options.min) return options.min
  if (options?.max !== undefined && parsed > options.max) return options.max
  return parsed
}

const sanitizeString = (value: unknown, fallback: string) => {
  if (typeof value === 'string') {
    const trimmed = value.trim()
    return trimmed.length > 0 ? trimmed : fallback
  }
  return fallback
}

const sanitizeTheme = (value: unknown): HomepageTheme => {
  if (typeof value === 'string') {
    const upper = value.toUpperCase() as HomepageTheme
    if (['LIGHT', 'DARK', 'AUTO'].includes(upper)) {
      return upper
    }
  }
  return HomepageTheme.LIGHT
}

export async function GET() {
  try {
    const user = await getAuthUser()
    if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = await db.homepageSettings.findFirst()

    if (!settings) {
      return NextResponse.json({ id: 'default', ...DEFAULT_SETTINGS }, {
        headers: { 'Cache-Control': 'no-store' }
      })
    }

    return NextResponse.json(settings, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error fetching homepage settings:', error)
    return NextResponse.json({ error: 'Failed to fetch homepage settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await request.json()

    const data = {
      showHeroSlider: sanitizeBoolean(payload.showHeroSlider, DEFAULT_SETTINGS.showHeroSlider),
      autoPlaySlider: sanitizeBoolean(payload.autoPlaySlider, DEFAULT_SETTINGS.autoPlaySlider),
      sliderInterval: sanitizeNumber(payload.sliderInterval, DEFAULT_SETTINGS.sliderInterval, { min: 1000, max: 60000 }),
      showFeaturedVehicles: sanitizeBoolean(payload.showFeaturedVehicles, DEFAULT_SETTINGS.showFeaturedVehicles),
      featuredVehiclesCount: sanitizeNumber(payload.featuredVehiclesCount, DEFAULT_SETTINGS.featuredVehiclesCount, { min: 1, max: 12 }),
      showServices: sanitizeBoolean(payload.showServices, DEFAULT_SETTINGS.showServices),
      showCompanyInfo: sanitizeBoolean(payload.showCompanyInfo, DEFAULT_SETTINGS.showCompanyInfo),
      servicesTitle: sanitizeString(payload.servicesTitle, DEFAULT_SETTINGS.servicesTitle),
      servicesSubtitle: sanitizeString(payload.servicesSubtitle, DEFAULT_SETTINGS.servicesSubtitle),
      servicesDescription: sanitizeString(payload.servicesDescription, DEFAULT_SETTINGS.servicesDescription),
      servicesCtaText: sanitizeString(payload.servicesCtaText, DEFAULT_SETTINGS.servicesCtaText),
      facebookPageUrl: sanitizeString(payload.facebookPageUrl, DEFAULT_SETTINGS.facebookPageUrl),
      facebookVideoUrl: sanitizeString(payload.facebookVideoUrl, DEFAULT_SETTINGS.facebookVideoUrl),
      theme: sanitizeTheme(payload.theme)
    }

    const existing = await db.homepageSettings.findFirst()

    const settings = existing
      ? await db.homepageSettings.update({ where: { id: existing.id }, data })
      : await db.homepageSettings.create({ data })

    return NextResponse.json(settings, { headers: { 'Cache-Control': 'no-store' } })
  } catch (error) {
    console.error('Error updating homepage settings:', error)
    return NextResponse.json({ error: 'Failed to update homepage settings' }, { status: 500 })
  }
}
