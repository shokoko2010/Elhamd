import { NextResponse } from 'next/server'
import { sitemapService } from '@/lib/sitemap-service'

export async function GET() {
  try {
    const sitemap = await sitemapService.generateSitemap()
    
    return new NextResponse(sitemap, {
      headers: {
        'Content-Type': 'application/xml',
        'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 1 day
      },
    })
  } catch (error) {
    console.error('Error generating sitemap:', error)
    return new NextResponse('Error generating sitemap', { status: 500 })
  }
}