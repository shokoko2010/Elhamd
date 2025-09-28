import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { EnhancedMediaService } from '@/lib/enhanced-media-service'

// Initialize media service
const mediaService = EnhancedMediaService.getInstance()

export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to view media stats
    if (!['ADMIN', 'SUPER_ADMIN', 'STAFF', 'BRANCH_MANAGER'].includes(user.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Get media statistics
    const stats = await mediaService.getMediaStats()
    
    return NextResponse.json({
      success: true,
      data: stats
    })

  } catch (error) {
    console.error('Error fetching media stats:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch media stats' },
      { status: 500 }
    )
  }
}