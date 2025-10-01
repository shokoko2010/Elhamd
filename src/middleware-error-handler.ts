// Enhanced middleware error handler for Vercel
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/error-logger';

export function withErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return async (req: NextRequest) => {
    try {
      const start = Date.now();
      
      // Log request start
      logger.info('Request started', {
        path: req.url,
        method: req.method,
        userAgent: req.headers.get('user-agent') || undefined,
        ip: req.headers.get('x-forwarded-for') || req.headers.get('x-real-ip') || undefined
      });

      const response = await handler(req);
      
      // Log request completion
      const duration = Date.now() - start;
      logger.info('Request completed', {
        path: req.url,
        method: req.method,
        status: response.status,
        duration: `${duration}ms`
      });

      return response;
    } catch (error) {
      // Log detailed error information
      logger.error('Middleware error', {
        path: req.url,
        method: req.method,
        headers: Object.fromEntries(req.headers.entries()),
        body: req.body,
        query: Object.fromEntries(req.nextUrl.searchParams.entries())
      }, error instanceof Error ? error : new Error(String(error)));

      // Return detailed error response in development
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          error: {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined,
            timestamp: new Date().toISOString(),
            path: req.url,
            method: req.method
          }
        }, { status: 500 });
      }

      // Return generic error in production
      return NextResponse.json({
        error: {
          message: 'Internal server error',
          timestamp: new Date().toISOString(),
          requestId: crypto.randomUUID()
        }
      }, { status: 500 });
    }
  };
}

// Error boundary for API routes
export function apiErrorHandler(handler: (req: NextRequest) => Promise<NextResponse>) {
  return withErrorHandler(handler);
}

// Log performance issues
export function logPerformanceIssue(
  req: NextRequest,
  duration: number,
  threshold: number = 5000
) {
  if (duration > threshold) {
    logger.warn('Slow request detected', {
      path: req.url,
      method: req.method,
      duration: `${duration}ms`,
      threshold: `${threshold}ms`
    });
  }
}