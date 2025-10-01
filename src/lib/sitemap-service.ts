import { db } from '@/lib/db'

export interface SitemapUrl {
  loc: string
  lastmod?: string
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never'
  priority?: number
  alternates?: Array<{
    hreflang: string
    href: string
  }>
}

export interface SitemapIndex {
  loc: string
  lastmod?: string
}

export class SitemapService {
  private static instance: SitemapService
  private baseUrl: string

  private constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://alhamdcars.com'
  }

  static getInstance(): SitemapService {
    if (!SitemapService.instance) {
      SitemapService.instance = new SitemapService()
    }
    return SitemapService.instance
  }

  // Generate main sitemap
  async generateSitemap(): Promise<string> {
    const urls = await this.getAllUrls()
    return this.generateSitemapXml(urls)
  }

  // Generate sitemap index for large sites
  async generateSitemapIndex(): Promise<string> {
    const sitemaps = await this.getSitemapUrls()
    return this.generateSitemapIndexXml(sitemaps)
  }

  // Get all URLs for sitemap
  private async getAllUrls(): Promise<SitemapUrl[]> {
    const urls: SitemapUrl[] = []

    // Static pages
    urls.push(...this.getStaticPages())

    // Dynamic pages
    urls.push(...await this.getVehiclePages())
    urls.push(...await this.getServicePages())
    urls.push(...await this.getBlogPages()) // If blog is implemented

    return urls
  }

  // Get static page URLs
  private getStaticPages(): SitemapUrl[] {
    const staticPages = [
      { path: '/', priority: 1.0, changefreq: 'daily' as const },
      { path: '/about', priority: 0.8, changefreq: 'monthly' as const },
      { path: '/vehicles', priority: 0.9, changefreq: 'daily' as const },
      { path: '/contact', priority: 0.7, changefreq: 'monthly' as const },
      { path: '/booking', priority: 0.8, changefreq: 'weekly' as const },
      { path: '/test-drive', priority: 0.8, changefreq: 'weekly' as const },
      { path: '/maintenance', priority: 0.7, changefreq: 'weekly' as const },
      { path: '/financing', priority: 0.6, changefreq: 'monthly' as const },
      { path: '/login', priority: 0.3, changefreq: 'yearly' as const },
      { path: '/register', priority: 0.3, changefreq: 'yearly' as const }
    ]

    return staticPages.map(page => ({
      loc: `${this.baseUrl}${page.path}`,
      lastmod: new Date().toISOString(),
      changefreq: page.changefreq,
      priority: page.priority,
      alternates: this.getAlternates(page.path)
    }))
  }

  // Get vehicle page URLs
  private async getVehiclePages(): Promise<SitemapUrl[]> {
    // Skip database access during build time
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return []
    }
    
    try {
      const vehicles = await db.vehicle.findMany({
        where: { status: 'AVAILABLE' },
        select: { id: true, updatedAt: true }
      })

      return vehicles.map(vehicle => ({
        loc: `${this.baseUrl}/vehicles/${vehicle.id}`,
        lastmod: vehicle.updatedAt.toISOString(),
        changefreq: 'weekly' as const,
        priority: 0.8,
        alternates: this.getAlternates(`/vehicles/${vehicle.id}`)
      }))
    } catch (error) {
      console.error('Error fetching vehicle pages for sitemap:', error)
      return []
    }
  }

  // Get service page URLs
  private async getServicePages(): Promise<SitemapUrl[]> {
    // Skip database access during build time
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return []
    }
    
    try {
      const services = await db.serviceType.findMany({
        where: { isActive: true },
        select: { id: true, updatedAt: true }
      })

      return services.map(service => ({
        loc: `${this.baseUrl}/maintenance/${service.id}`,
        lastmod: service.updatedAt.toISOString(),
        changefreq: 'monthly' as const,
        priority: 0.7,
        alternates: this.getAlternates(`/maintenance/${service.id}`)
      }))
    } catch (error) {
      console.error('Error fetching service pages for sitemap:', error)
      return []
    }
  }

  // Get blog page URLs (placeholder for future implementation)
  private async getBlogPages(): Promise<SitemapUrl[]> {
    // Placeholder for blog functionality
    return []
  }

  // Get alternate language versions
  private getAlternates(path: string): Array<{ hreflang: string; href: string }> {
    return [
      {
        hreflang: 'ar',
        href: `${this.baseUrl}${path}`
      },
      {
        hreflang: 'en',
        href: `${this.baseUrl}/en${path}`
      },
      {
        hreflang: 'x-default',
        href: `${this.baseUrl}${path}`
      }
    ]
  }

  // Get sitemap URLs for sitemap index
  private async getSitemapUrls(): Promise<SitemapIndex[]> {
    const sitemaps: SitemapIndex[] = [
      { loc: `${this.baseUrl}/sitemap.xml` }
    ]

    // Skip database access during build time
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      return sitemaps
    }

    // Add vehicle sitemap if many vehicles
    try {
      const vehicleCount = await db.vehicle.count({ where: { status: 'AVAILABLE' } })
      if (vehicleCount > 100) {
        sitemaps.push({ loc: `${this.baseUrl}/sitemap-vehicles.xml` })
      }
    } catch (error) {
      console.error('Error counting vehicles for sitemap:', error)
    }

    // Add service sitemap if many services
    try {
      const serviceCount = await db.serviceType.count({ where: { isActive: true } })
      if (serviceCount > 50) {
        sitemaps.push({ loc: `${this.baseUrl}/sitemap-services.xml` })
      }
    } catch (error) {
      console.error('Error counting services for sitemap:', error)
    }

    return sitemaps
  }

  // Generate sitemap XML
  private generateSitemapXml(urls: SitemapUrl[]): string {
    const xmlUrls = urls.map(url => {
      let xml = `  <url>\n    <loc>${url.loc}</loc>`
      
      if (url.lastmod) {
        xml += `\n    <lastmod>${url.lastmod}</lastmod>`
      }
      
      if (url.changefreq) {
        xml += `\n    <changefreq>${url.changefreq}</changefreq>`
      }
      
      if (url.priority !== undefined) {
        xml += `\n    <priority>${url.priority}</priority>`
      }

      if (url.alternates && url.alternates.length > 0) {
        xml += '\n    <xhtml:link rel="alternate"'
        url.alternates.forEach(alt => {
          xml += `\n      hreflang="${alt.hreflang}" href="${alt.href}"`
        })
        xml += '\n    />'
      }
      
      xml += '\n  </url>'
      return xml
    }).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${xmlUrls}
</urlset>`
  }

  // Generate sitemap index XML
  private generateSitemapIndexXml(sitemaps: SitemapIndex[]): string {
    const xmlSitemaps = sitemaps.map(sitemap => {
      let xml = `  <sitemap>\n    <loc>${sitemap.loc}</loc>`
      
      if (sitemap.lastmod) {
        xml += `\n    <lastmod>${sitemap.lastmod}</lastmod>`
      }
      
      xml += '\n  </sitemap>'
      return xml
    }).join('\n')

    return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
              xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
              xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
              http://www.sitemaps.org/schemas/sitemap/0.9/siteindex.xsd">
${xmlSitemaps}
</sitemapindex>`
  }

  // Generate robots.txt content
  generateRobotsTxt(seoSettings?: any): string {
    const defaultRobots = `User-agent: *
Allow: /

# Sitemap
Sitemap: ${this.baseUrl}/sitemap.xml

# Crawl delay
Crawl-delay: 1

# Block admin areas
Disallow: /admin/
Disallow: /api/
Disallow: /_next/
Disallow: /static/

# Allow specific bots
User-agent: Googlebot
Allow: /

User-agent: Bingbot
Allow: /

User-agent: Twitterbot
Allow: /

User-agent: facebookexternalhit
Allow: /
`

    // Use custom robots.txt if provided
    if (seoSettings?.robotsTxt) {
      return seoSettings.robotsTxt
    }

    return defaultRobots
  }

  // Generate structured data for homepage
  generateHomepageStructuredData(): string {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "AutomotiveBusiness",
      "name": "Al-Hamd Cars",
      "description": "Authorized TATA Motors dealer in Egypt offering new vehicles, test drives, and expert service.",
      "url": this.baseUrl,
      "telephone": "+20 2 1234 5678",
      "email": "info@alhamdcars.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Tahrir Street",
        "addressLocality": "Cairo",
        "addressCountry": "EG"
      },
      "openingHours": "Mo-Fr 09:00-20:00 Sa 10:00-18:00",
      "priceRange": "$$$",
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "TATA Vehicles",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Vehicle",
              "name": "TATA Nexon",
              "description": "Compact SUV with advanced safety features"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Vehicle",
              "name": "TATA Punch",
              "description": "Compact SUV perfect for city driving"
            }
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Vehicle",
              "name": "TATA Tiago",
              "description": "Efficient hatchback with great fuel economy"
            }
          }
        ]
      },
      "sameAs": [
        "https://facebook.com/alhamdcars",
        "https://twitter.com/alhamdcars",
        "https://instagram.com/alhamdcars"
      ]
    }

    return JSON.stringify(structuredData, null, 2)
  }

  // Generate structured data for vehicle
  generateVehicleStructuredData(vehicle: any): string {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "Vehicle",
      "name": `${vehicle.make} ${vehicle.model}`,
      "model": vehicle.model,
      "manufacturer": {
        "@type": "Organization",
        "name": "TATA Motors"
      },
      "modelDate": vehicle.year.toString(),
      "offers": {
        "@type": "Offer",
        "price": vehicle.price,
        "priceCurrency": "EGP",
        "availability": "https://schema.org/InStock",
        "seller": {
          "@type": "AutomotiveBusiness",
          "name": "Al-Hamd Cars",
          "address": {
            "@type": "PostalAddress",
            "streetAddress": "Tahrir Street",
            "addressLocality": "Cairo",
            "addressCountry": "EG"
          }
        }
      },
      "vehicleConfiguration": vehicle.description || `New ${vehicle.make} ${vehicle.model}`,
      "fuelType": vehicle.fuelType,
      "vehicleTransmission": vehicle.transmission
    }

    return JSON.stringify(structuredData, null, 2)
  }

  // Ping search engines
  async pingSearchEngines(): Promise<void> {
    const sitemapUrl = `${this.baseUrl}/sitemap.xml`
    const searchEngines = [
      `https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`,
      `https://www.bing.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`
    ]

    const promises = searchEngines.map(url =>
      fetch(url, { method: 'GET' })
        .then(response => {
          if (!response.ok) {
            console.error(`Failed to ping ${url}:`, response.status)
          }
        })
        .catch(error => {
          console.error(`Error pinging ${url}:`, error)
        })
    )

    await Promise.allSettled(promises)
  }

  // Validate sitemap
  validateSitemap(sitemapContent: string): { valid: boolean; errors: string[] } {
    const errors: string[] = []

    // Basic XML validation
    if (!sitemapContent.includes('<?xml version="1.0" encoding="UTF-8"?>')) {
      errors.push('Missing XML declaration')
    }

    if (!sitemapContent.includes('<urlset')) {
      errors.push('Missing urlset element')
    }

    if (!sitemapContent.includes('</urlset>')) {
      errors.push('Missing closing urlset element')
    }

    // Check for required elements in each URL
    const urlRegex = /<url>.*?<loc>(.*?)<\/loc>.*?<\/url>/gs
    const urls = sitemapContent.match(urlRegex) || []
    
    urls.forEach(url => {
      if (!url.includes('<loc>')) {
        errors.push('URL missing loc element')
      }
      if (!url.includes('</loc>')) {
        errors.push('URL missing closing loc element')
      }
    })

    return {
      valid: errors.length === 0,
      errors
    }
  }
}

// Export singleton instance
export const sitemapService = SitemapService.getInstance()