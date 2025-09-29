interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/public/popup - Get active popup configuration for the current page
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = searchParams.get('page') || 'homepage'
    const userAgent = request.headers.get('user-agent') || ''

    // Get current date
    const now = new Date()

    // Find active popups for this page with highest priority
    const popups = await db.popupConfig.findMany({
      where: {
        isActive: true,
        OR: [
          { startDate: null },
          { startDate: { lte: now } }
        ],
        OR: [
          { endDate: null },
          { endDate: { gte: now } }
        ]
      },
      orderBy: [
        { priority: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 10 // Get top 10 to filter in application
    })

    // Filter popups that should show on this page
    const filteredPopups = popups.filter(popup => {
      try {
        const showOnPages = JSON.parse(popup.showOnPages)
        return showOnPages.includes(page) || showOnPages.includes('all')
      } catch {
        // If JSON parsing fails, use default homepage
        return popup.showOnPages.includes('homepage') || page === 'homepage'
      }
    })

    // Filter by target audience if needed
    const finalPopups = filteredPopups.filter(popup => {
      if (popup.targetAudience === 'all') return true
      
      // Simple detection based on user agent and cookies
      // This is a basic implementation - you might want to enhance this
      if (popup.targetAudience === 'guests') {
        return !userAgent.includes('Mobile') // Simple guest detection
      }
      
      if (popup.targetAudience === 'new') {
        // Check if it's a new user (no cookies or first visit)
        return !request.headers.get('cookie')?.includes('visited_before')
      }
      
      if (popup.targetAudience === 'returning') {
        // Check if it's a returning user
        return request.headers.get('cookie')?.includes('visited_before')
      }
      
      return true
    })

    // Return the highest priority popup or null if none found
    const activePopup = finalPopups[0] || null

    return NextResponse.json({ popup: activePopup })
  } catch (error) {
    console.error('Error fetching popup config:', error)
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
  }
}