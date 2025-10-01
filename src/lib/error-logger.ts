// Enhanced error logging for production debugging
export interface ErrorContext {
  userId?: string;
  path?: string;
  method?: string;
  body?: any;
  query?: any;
  headers?: Record<string, string>;
  timestamp?: string;
  stack?: string;
}

export interface LogEntry {
  level: 'error' | 'warn' | 'info' | 'debug';
  message: string;
  context?: ErrorContext;
  error?: Error;
  timestamp: string;
}

class EnhancedErrorLogger {
  private logs: LogEntry[] = [];
  private maxLogs = 1000; // Keep last 1000 logs

  log(level: LogEntry['level'], message: string, context?: ErrorContext, error?: Error) {
    const logEntry: LogEntry = {
      level,
      message,
      context: {
        ...context,
        timestamp: new Date().toISOString(),
        stack: error?.stack
      },
      error,
      timestamp: new Date().toISOString()
    };

    this.logs.push(logEntry);
    
    // Keep only the last maxLogs entries
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }

    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log(`[${level.toUpperCase()}] ${message}`, context, error);
    }

    // In production, you can send logs to external service
    if (process.env.NODE_ENV === 'production') {
      this.sendToExternalService(logEntry);
    }
  }

  error(message: string, context?: ErrorContext, error?: Error) {
    this.log('error', message, context, error);
  }

  warn(message: string, context?: ErrorContext) {
    this.log('warn', message, context);
  }

  info(message: string, context?: ErrorContext) {
    this.log('info', message, context);
  }

  debug(message: string, context?: ErrorContext) {
    this.log('debug', message, context);
  }

  getLogs(): LogEntry[] {
    return [...this.logs];
  }

  getErrors(): LogEntry[] {
    return this.logs.filter(log => log.level === 'error');
  }

  clearLogs() {
    this.logs = [];
  }

  private async sendToExternalService(logEntry: LogEntry) {
    // You can integrate with services like:
    // - Sentry
    // - LogRocket
    // - Custom logging service
    // - Vercel logs
    
    try {
      // Example: Send to Vercel logs
      console.log(JSON.stringify({
        level: logEntry.level,
        message: logEntry.message,
        context: logEntry.context,
        timestamp: logEntry.timestamp
      }));

      // Example: Send to external service
      // await fetch('https://your-logging-service.com/api/logs', {
      //   method: 'POST',
      //   headers: { 'Content-Type': 'application/json' },
      //   body: JSON.stringify(logEntry)
      // });
    } catch (err) {
      console.error('Failed to send log to external service:', err);
    }
  }

  // Get error summary for debugging
  getErrorSummary(): {
    totalErrors: number;
    recentErrors: LogEntry[];
    errorPatterns: Record<string, number>;
  } {
    const errors = this.getErrors();
    const errorPatterns: Record<string, number> = {};

    errors.forEach(error => {
      const pattern = error.message.split(':')[0] || 'Unknown';
      errorPatterns[pattern] = (errorPatterns[pattern] || 0) + 1;
    });

    return {
      totalErrors: errors.length,
      recentErrors: errors.slice(-10), // Last 10 errors
      errorPatterns
    };
  }
}

export const logger = new EnhancedErrorLogger();

// Utility function to log API errors
export function logApiError(
  error: Error,
  req: Request,
  context?: Partial<ErrorContext>
) {
  logger.error('API Error', {
    path: req.url,
    method: req.method,
    headers: Object.fromEntries(req.headers.entries()),
    ...context
  }, error);
}

// Utility function to log build errors
export function logBuildError(error: Error, context?: ErrorContext) {
  logger.error('Build Error', {
    ...context,
    timestamp: new Date().toISOString()
  }, error);
}

// Global error handler for unhandled errors
if (typeof window === 'undefined') {
  // Server-side
  process.on('uncaughtException', (error) => {
    logger.error('Uncaught Exception', {}, error);
  });

  process.on('unhandledRejection', (reason, promise) => {
    logger.error('Unhandled Rejection', {
      promise: promise.toString(),
      reason: reason?.toString()
    }, reason instanceof Error ? reason : new Error(String(reason)));
  });
} else {
  // Client-side
  window.addEventListener('error', (event) => {
    logger.error('Client Error', {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    }, event.error);
  });

  window.addEventListener('unhandledrejection', (event) => {
    logger.error('Client Unhandled Rejection', {
      reason: event.reason?.toString()
    }, event.reason instanceof Error ? event.reason : new Error(String(event.reason)));
  });
}