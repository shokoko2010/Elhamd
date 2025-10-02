interface RouteParams {
  params: Promise<{ params: string[] }>
}

import { NextRequest, NextResponse } from 'next/server'

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  const { params } = await context
  const [width, height] = params

  // Get text from query parameter
  const { searchParams } = new URL(request.url)
  const text = searchParams.get('text') || `${width}x${height}`

  // Create a simple SVG placeholder
  const svg = `
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect width="100%" height="100%" fill="#f3f4f6"/>
      <text x="50%" y="50%" font-family="Arial, sans-serif" font-size="16" fill="#6b7280" text-anchor="middle" dominant-baseline="middle">
        ${text}
      </text>
    </svg>
  `

  return new NextResponse(svg, {
    headers: {
      'Content-Type': 'image/svg+xml',
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}