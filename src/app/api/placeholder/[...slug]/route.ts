import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string[] } }
) {
  try {
    const [width, height] = params.slug
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('text') || 'Vehicle Image'
    
    const w = parseInt(width) || 400
    const h = parseInt(height) || 300
    
    // Create an SVG placeholder
    const svg = `
      <svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#f3f4f6;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#e5e7eb;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="100%" height="100%" fill="url(#bg)"/>
        <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="${Math.min(w, h) / 10}" 
              fill="#6b7280" text-anchor="middle" dy=".3em">
          ${text}
        </text>
        <circle cx="${w/2}" cy="${h/3}" r="${Math.min(w, h) / 8}" fill="#9ca3af" opacity="0.3"/>
        <rect x="${w/3}" y="${h/2.5}" width="${w/3}" height="${h/6}" rx="${Math.min(w, h) / 20}" fill="#9ca3af" opacity="0.3"/>
        <circle cx="${w/3.5}" cy="${h*0.75}" r="${Math.min(w, h) / 15}" fill="#9ca3af" opacity="0.3"/>
        <circle cx="${w*0.65}" cy="${h*0.75}" r="${Math.min(w, h) / 15}" fill="#9ca3af" opacity="0.3"/>
      </svg>
    `
    
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=86400', // Cache for 1 day
      },
    })
  } catch (error) {
    console.error('Placeholder generation error:', error)
    return new NextResponse('Error generating placeholder', { status: 500 })
  }
}