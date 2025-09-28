import { NextRequest, NextResponse } from 'next/server'
import { enhancedImageService } from '@/lib/enhanced-image-service'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'config':
        return NextResponse.json(enhancedImageService.getConfig())

      case 'stats':
        return NextResponse.json(enhancedImageService.getOptimizationStats())

      case 'report':
        return NextResponse.json(enhancedImageService.generateOptimizationReport())

      case 'health':
        const health = await enhancedImageService.healthCheck()
        return NextResponse.json(health)

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in image optimization API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, ...data } = await request.json()

    switch (action) {
      case 'update-config':
        enhancedImageService.updateConfig(data.config)
        return NextResponse.json({ success: true, message: 'Configuration updated' })

      case 'optimize-url':
        const optimizedUrl = enhancedImageService.optimizeImageUrl(data.url, data.options)
        return NextResponse.json({ optimizedUrl })

      case 'generate-sources':
        const sources = enhancedImageService.generateResponsiveSources(data.url, data.options)
        return NextResponse.json(sources)

      case 'batch-optimize':
        const metadata = await enhancedImageService.batchOptimizeImages(data.urls)
        return NextResponse.json(metadata)

      case 'validate-url':
        const validation = enhancedImageService.validateImageUrl(data.url)
        return NextResponse.json(validation)

      case 'cleanup-cache':
        enhancedImageService.cleanupCache(data.maxAge)
        return NextResponse.json({ success: true, message: 'Cache cleaned up' })

      case 'clear-cache':
        enhancedImageService.clearCache()
        return NextResponse.json({ success: true, message: 'Cache cleared' })

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in image optimization API:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}