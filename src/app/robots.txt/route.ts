import { NextResponse } from 'next/server'
import { sitemapService } from '@/lib/sitemap-service'

export async function GET() {
  try {
    // Fetch site settings to get custom robots.txt if available
    let robotsContent = ''
    
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/api/site-settings`)
      if (response.ok) {
        const settings = await response.json()
        if (settings[0]?.seoSettings?.robotsTxt) {
          robotsContent = settings[0].seoSettings.robotsTxt
        }
      }
    } catch (error) {
      console.error('Error fetching site settings for robots.txt:', error)
    }

    // Use default robots.txt if no custom one is set
    if (!robotsContent) {
      robotsContent = sitemapService.generateRobotsTxt()
    }
    
    return new NextResponse(robotsContent, {
      headers: {
        'Content-Type': 'text/plain',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 1 day
      },
    })
  } catch (error) {
    console.error('Error generating robots.txt:', error)
    return new NextResponse('Error generating robots.txt', { status: 500 })
  }
}