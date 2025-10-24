import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'

export async function GET(request: NextRequest) {
  const healthCheck = {
    timestamp: new Date().toISOString(),
    status: 'unknown',
    checks: {} as any,
    environment: {
      NODE_ENV: process.env.NODE_ENV,
      DATABASE_URL: process.env.DATABASE_URL ? 'SET' : 'NOT_SET',
      POSTGRES_URL: process.env.POSTGRES_URL ? 'SET' : 'NOT_SET',
      PRISMA_DATABASE_URL: process.env.PRISMA_DATABASE_URL ? 'SET' : 'NOT_SET',
      NEXTAUTH_URL: process.env.NEXTAUTH_URL || 'NOT_SET',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'SET' : 'NOT_SET',
    }
  }

  try {
    // 1. Database Connection Test
    try {
      await db.$connect()
      const result = await db.$queryRaw`SELECT 1 as test`
      healthCheck.checks.database = {
        status: 'connected',
        message: 'Database connection successful',
        result: result
      }
      await db.$disconnect()
    } catch (error) {
      healthCheck.checks.database = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown database error',
        error: error
      }
    }

    // 2. Authentication Test
    try {
      const user = await getAuthUser()
      healthCheck.checks.authentication = {
        status: user ? 'authenticated' : 'not_authenticated',
        user: user ? {
          id: user.id,
          email: user.email,
          role: user.role,
          permissionsCount: user.permissions.length
        } : null
      }
    } catch (error) {
      healthCheck.checks.authentication = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown auth error',
        error: error
      }
    }

    // 3. Permissions Test
    try {
      const permissionsCount = await db.permission.count()
      const roleTemplatesCount = await db.roleTemplate.count()
      const usersCount = await db.user.count()
      
      healthCheck.checks.permissions = {
        status: 'checked',
        counts: {
          permissions: permissionsCount,
          roleTemplates: roleTemplatesCount,
          users: usersCount
        }
      }
    } catch (error) {
      healthCheck.checks.permissions = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown permissions error',
        error: error
      }
    }

    // 4. Schema Test - Check critical tables
    try {
      const tables = ['users', 'permissions', 'roleTemplates', 'invoice', 'customerProfile']
      const tableChecks = {}
      
      for (const table of tables) {
        try {
          // @ts-ignore - dynamic table query
          const count = await db[table].count()
          tableChecks[table] = { status: 'exists', count }
        } catch (error) {
          tableChecks[table] = { 
            status: 'error', 
            message: error instanceof Error ? error.message : 'Unknown table error'
          }
        }
      }
      
      healthCheck.checks.schema = tableChecks
    } catch (error) {
      healthCheck.checks.schema = {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown schema error',
        error: error
      }
    }

    // 5. Memory Usage
    healthCheck.checks.memory = {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + 'MB',
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024) + 'MB'
    }

    // Overall status
    const allChecks = Object.values(healthCheck.checks)
    const hasErrors = allChecks.some(check => check.status === 'error')
    healthCheck.status = hasErrors ? 'unhealthy' : 'healthy'

    return NextResponse.json(healthCheck)

  } catch (error) {
    healthCheck.status = 'critical_error'
    healthCheck.error = error instanceof Error ? error.message : 'Unknown critical error'
    
    return NextResponse.json(healthCheck, { status: 500 })
  }
}