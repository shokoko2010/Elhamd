interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const settings = await db.siteSettings.findFirst({
      where: { isActive: true },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Set CORS headers
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    }

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
        siteTitle: 'شركة الحمد لاستيراد السيارات',
        siteDescription: 'الموزع المعتمد لسيارات تاتا في مدن القناة - السيارات التجارية والبيك أب والشاحنات',
        contactEmail: 'info@elhamdimport.online',
        contactPhone: '+20 2 12345678',
          contactAddress: 'بورسعيد، مصر',
        socialLinks: {
          facebook: 'https://facebook.com/elhamdimport',
          twitter: 'https://twitter.com/elhamdimport',
          instagram: 'https://instagram.com/elhamdimport',
          linkedin: 'https://linkedin.com/company/elhamdimport'
        },
        seoSettings: {
          metaTitle: 'شركة الحمد للسيارات - الموزع المعتمد لتاتا موتورز في مدن القناة',
          metaDescription: 'الموزع المعتمد لسيارات تاتا في مدن القناة، متخصصون في السيارات التجارية والبيك أب والشاحنات فقط',
          keywords: 'سيارات تاتا، وكيل تاتا، سيارات تجارية، شاحنات، بيك أب، مصر',
          ogImage: '/og-image.jpg',
          twitterHandle: '@elhamdimport'
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
      return NextResponse.json(defaultSettings, { headers })
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

    return NextResponse.json(processedSettings, { headers })
  } catch (error) {
    console.error('Error fetching public site settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch site settings' },
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        }
      }
    )
  }
}

export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    },
  })
}