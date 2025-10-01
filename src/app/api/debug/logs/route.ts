import { NextRequest, NextResponse } from 'next/server'
import { logger } from '@/lib/error-logger'

export async function GET(request: NextRequest) {
  try {
    const logs = logger.getLogs()
    
    return NextResponse.json({
      success: true,
      logs,
      summary: logger.getErrorSummary(),
      total: logs.length
    })
  } catch (error) {
    logger.error('Failed to fetch debug logs', {
      path: request.url,
      method: request.method
    }, error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    logger.clearLogs()
    
    return NextResponse.json({
      success: true,
      message: 'Logs cleared successfully'
    })
  } catch (error) {
    logger.error('Failed to clear debug logs', {
      path: request.url,
      method: request.method
    }, error instanceof Error ? error : new Error(String(error)))
    
    return NextResponse.json({
      success: false,
      error: 'Failed to clear logs',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}