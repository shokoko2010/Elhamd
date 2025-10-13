import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { monitorDbQuery } from '@/lib/performance-monitor'

// Simple cache for site settings (changes rarely)
let cachedSettings: any = null
let cacheTimestamp = 0
const CACHE_TTL = 10 * 60 * 1000 // 10 minutes

export async function GET(request: NextRequest) {
  try {
    // Check cache first
    const now = Date.now()
    if (cachedSettings && (now - cacheTimestamp) < CACHE_TTL) {
      return NextResponse.json(cachedSettings)
    }

    const settings = await monitorDbQuery('siteSettings-findFirst', () =>
      db.siteSettings.findFirst({
        where: { isActive: true },
        orderBy: {
          createdAt: 'desc'
        }
      })
    )

    if (!settings) {
      // Return default settings if none exist
      const defaultSettings = {
        id: 'default',
        logoUrl: '/logo.svg',
        faviconUrl: '/favicon.ico',
        primaryColor: '#3B82F6',
        secondaryColor: '#10B981',
        accentColor: '#F59E0B',
        fontFamily: 'Inter',
        siteTitle: 'Al-Hamd Cars',
        siteDescription: 'Premium Car Dealership in Egypt',
        contactEmail: 'info@alhamdcars.com',
        contactPhone: '+20 123 456 7890',
        contactAddress: 'Cairo, Egypt',
        socialLinks: {
          facebook: 'https://facebook.com/alhamdcars',
          twitter: 'https://twitter.com/alhamdcars',
          instagram: 'https://instagram.com/alhamdcars',
          linkedin: 'https://linkedin.com/company/alhamdcars'
        },
        seoSettings: {
          metaTitle: 'Al-Hamd Cars - Premium Car Dealership in Egypt',
          metaDescription: 'Discover premium cars at Al-Hamd Cars. Best prices, excellent service, and wide selection of vehicles.',
          keywords: 'cars, dealership, egypt, premium vehicles, car sales',
          ogImage: '/og-image.jpg',
          twitterHandle: '@alhamdcars'
        },
        performanceSettings: {
          cachingEnabled: true,
          cacheTTL: 300,
          compressionEnabled: true,
          imageOptimizationEnabled: true,
          lazyLoadingEnabled: true,
          minificationEnabled: true,
          bundleOptimizationEnabled: true,
          cdnEnabled: false,
          cdnUrl: '',
          prefetchingEnabled: true,
          monitoringEnabled: true
        },
        headerSettings: {
          showLogo: true,
          showNavigation: true,
          showContactInfo: true,
          showSocialLinks: true,
          stickyHeader: true,
          transparentHeader: false
        },
        footerSettings: {
          showLogo: true,
          showNavigation: true,
          showContactInfo: true,
          showSocialLinks: true,
          showNewsletter: true,
          showCopyright: true,
          columns: 4
        }
      }
      
      // Cache default settings
      cachedSettings = defaultSettings
      cacheTimestamp = now
      
      return NextResponse.json(defaultSettings)
    }

    // Ensure all JSON fields have default values
    const processedSettings = {
      ...settings,
      socialLinks: settings.socialLinks || {},
      seoSettings: settings.seoSettings || {},
      performanceSettings: settings.performanceSettings || {},
      headerSettings: settings.headerSettings || {},
      footerSettings: settings.footerSettings || {}
    }

    // Cache the processed settings
    cachedSettings = processedSettings
    cacheTimestamp = now

    return NextResponse.json(processedSettings)
  } catch (error) {
    console.error('Error fetching public site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { status: 500 }
    )
  }
}