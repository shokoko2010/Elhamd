interface RouteParams {
  params: Promise<{ params: string[] }>
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  { params }: RouteParams
) {
  try {
    const resolvedParams = await params
    
    // Validate params
    if (!resolvedParams || resolvedParams.length < 2) {
      return NextResponse.json(
        { error: 'Width and height are required' },
        { status: 400 }
      )
    }
    
    const [width, height] = resolvedParams
    
    // Validate width and height
    const w = parseInt(width)
    const h = parseInt(height)
    
    if (isNaN(w) || isNaN(h) || w <= 0 || h <= 0 || w > 2000 || h > 2000) {
      return NextResponse.json(
        { error: 'Invalid width or height. Must be between 1 and 2000' },
        { status: 400 }
      )
    }

    // Get text from query parameter
    const { searchParams } = new URL(request.url)
    const text = searchParams.get('text') || `${w}x${h}`
    
    // Sanitize text to prevent SVG injection
    const sanitizedText = text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')

    // Create a simple SVG placeholder
    const svg = `<svg width="${w}" height="${h}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">${sanitizedText}</text>
    </svg>`

    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Placeholder API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate placeholder image' },
      { status: 500 }
    )
  }
}