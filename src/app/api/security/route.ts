import { NextRequest, NextResponse } from 'next/server'
import { SecurityService } from '@/lib/security-service'

const securityService = SecurityService.getInstance()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')
    
    switch (action) {
      case 'security-settings':
        return await getSecuritySettings(request)
      case 'audit-logs':
        return await getAuditLogs(request)
      case 'security-events':
        return await getSecurityEvents(request)
      case 'password-policy':
        return await getPasswordPolicy()
      case 'sessions':
        return await getSessions(request)
      case 'health-check':
        return await getSecurityHealthCheck()
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Security GET error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'setup-2fa':
        return await setupTwoFactorAuth(body)
      case 'verify-2fa':
        return await verifyTwoFactorToken(body)
      case 'verify-backup-code':
        return await verifyBackupCode(body)
      case 'enable-2fa':
        return await enableTwoFactorAuth(body)
      case 'disable-2fa':
        return await disableTwoFactorAuth(body)
      case 'change-password':
        return await changePassword(body)
      case 'record-failed-login':
        return await recordFailedLogin(body)
      case 'reset-failed-attempts':
        return await resetFailedAttempts(body)
      case 'check-account-locked':
        return await checkAccountLocked(body)
      case 'create-session':
        return await createSession(body)
      case 'invalidate-session':
        return await invalidateSession(body)
      case 'register-trusted-device':
        return await registerTrustedDevice(body)
      case 'remove-trusted-device':
        return await removeTrustedDevice(body)
      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Security POST error:', error)
    return NextResponse.json(
      { error: 'Failed to process request', details: error.message },
      { status: 500 }
    )
  }
}

// Action handlers
async function getSecuritySettings(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  // This would get user security settings from database
  const securitySettings = {
    userId,
    twoFactorEnabled: false,
    twoFactorMethod: 'NONE',
    passwordLastChanged: new Date(),
    sessionTimeout: 3600,
    loginAttempts: 0,
    accountLocked: false,
    backupCodes: [],
    securityQuestions: [],
    trustedDevices: []
  }

  return NextResponse.json({
    success: true,
    data: securitySettings
  })
}

async function getAuditLogs(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const limit = parseInt(searchParams.get('limit') || '100')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const filters: any = { limit }
  if (userId) filters.userId = userId
  if (dateFrom) filters.dateFrom = new Date(dateFrom)
  if (dateTo) filters.dateTo = new Date(dateTo)

  const auditLogs = userId 
    ? await securityService.getUserAuditLogs(userId, limit)
    : await securityService.getSystemAuditLogs(filters)

  return NextResponse.json({
    success: true,
    data: auditLogs
  })
}

async function getSecurityEvents(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')
  const eventType = searchParams.get('eventType')
  const severity = searchParams.get('severity')
  const limit = parseInt(searchParams.get('limit') || '100')
  const dateFrom = searchParams.get('dateFrom')
  const dateTo = searchParams.get('dateTo')

  const filters: any = { limit }
  if (userId) filters.userId = userId
  if (eventType) filters.eventType = eventType
  if (severity) filters.severity = severity
  if (dateFrom) filters.dateFrom = new Date(dateFrom)
  if (dateTo) filters.dateTo = new Date(dateTo)

  const securityEvents = userId
    ? await securityService.getUserSecurityEvents(userId, limit)
    : await securityService.getSystemSecurityEvents(filters)

  return NextResponse.json({
    success: true,
    data: securityEvents
  })
}

async function getPasswordPolicy() {
  const passwordPolicy = securityService.getPasswordPolicy()

  return NextResponse.json({
    success: true,
    data: passwordPolicy
  })
}

async function getSessions(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const userId = searchParams.get('userId')

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  const sessions = await securityService.getUserSessions(userId)

  return NextResponse.json({
    success: true,
    data: sessions
  })
}

async function getSecurityHealthCheck() {
  const healthCheck = await securityService.getSecurityHealthCheck()

  return NextResponse.json({
    success: true,
    data: healthCheck
  })
}

async function setupTwoFactorAuth(body: any) {
  const { userId } = body

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  const twoFactorSetup = await securityService.setupTwoFactorAuth(userId)

  return NextResponse.json({
    success: true,
    data: twoFactorSetup,
    message: 'Two-factor authentication setup initiated'
  })
}

async function verifyTwoFactorToken(body: any) {
  const { userId, token } = body

  if (!userId || !token) {
    return NextResponse.json(
      { error: 'User ID and token are required' },
      { status: 400 }
    )
  }

  const isValid = await securityService.verifyTwoFactorToken(userId, token)

  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Token verified successfully'
  })
}

async function verifyBackupCode(body: any) {
  const { userId, code } = body

  if (!userId || !code) {
    return NextResponse.json(
      { error: 'User ID and backup code are required' },
      { status: 400 }
    )
  }

  const isValid = await securityService.verifyBackupCode(userId, code)

  if (!isValid) {
    return NextResponse.json(
      { error: 'Invalid backup code' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Backup code verified successfully'
  })
}

async function enableTwoFactorAuth(body: any) {
  const { userId, method, token } = body

  if (!userId || !method || !token) {
    return NextResponse.json(
      { error: 'User ID, method, and token are required' },
      { status: 400 }
    )
  }

  const enabled = await securityService.enableTwoFactorAuth(userId, method, token)

  if (!enabled) {
    return NextResponse.json(
      { error: 'Failed to enable two-factor authentication' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Two-factor authentication enabled successfully'
  })
}

async function disableTwoFactorAuth(body: any) {
  const { userId, password } = body

  if (!userId || !password) {
    return NextResponse.json(
      { error: 'User ID and password are required' },
      { status: 400 }
    )
  }

  const disabled = await securityService.disableTwoFactorAuth(userId, password)

  if (!disabled) {
    return NextResponse.json(
      { error: 'Failed to disable two-factor authentication' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Two-factor authentication disabled successfully'
  })
}

async function changePassword(body: any) {
  const { userId, currentPassword, newPassword } = body

  if (!userId || !currentPassword || !newPassword) {
    return NextResponse.json(
      { error: 'User ID, current password, and new password are required' },
      { status: 400 }
    )
  }

  const changed = await securityService.changePassword(userId, currentPassword, newPassword)

  if (!changed) {
    return NextResponse.json(
      { error: 'Failed to change password' },
      { status: 400 }
    )
  }

  return NextResponse.json({
    success: true,
    message: 'Password changed successfully'
  })
}

async function recordFailedLogin(body: any) {
  const { userId, ipAddress } = body

  if (!userId || !ipAddress) {
    return NextResponse.json(
      { error: 'User ID and IP address are required' },
      { status: 400 }
    )
  }

  await securityService.recordFailedLogin(userId, ipAddress)

  return NextResponse.json({
    success: true,
    message: 'Failed login recorded'
  })
}

async function resetFailedAttempts(body: any) {
  const { userId } = body

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  await securityService.resetFailedLoginAttempts(userId)

  return NextResponse.json({
    success: true,
    message: 'Failed login attempts reset'
  })
}

async function checkAccountLocked(body: any) {
  const { userId } = body

  if (!userId) {
    return NextResponse.json(
      { error: 'User ID is required' },
      { status: 400 }
    )
  }

  const isLocked = await securityService.isAccountLocked(userId)

  return NextResponse.json({
    success: true,
    data: { isLocked }
  })
}

async function createSession(body: any) {
  const { userId, deviceInfo } = body

  if (!userId || !deviceInfo) {
    return NextResponse.json(
      { error: 'User ID and device info are required' },
      { status: 400 }
    )
  }

  const sessionId = await securityService.createSession(userId, deviceInfo)

  return NextResponse.json({
    success: true,
    data: { sessionId }
  })
}

async function invalidateSession(body: any) {
  const { sessionId, userId } = body

  if (!userId || !userId) {
    return NextResponse.json(
      { error: 'Session ID and User ID are required' },
      { status: 400 }
    )
  }

  await securityService.invalidateSession(sessionId, userId)

  return NextResponse.json({
    success: true,
    message: 'Session invalidated successfully'
  })
}

async function registerTrustedDevice(body: any) {
  const { userId, deviceInfo } = body

  if (!userId || !deviceInfo) {
    return NextResponse.json(
      { error: 'User ID and device info are required' },
      { status: 400 }
    )
  }

  await securityService.registerTrustedDevice(userId, deviceInfo)

  return NextResponse.json({
    success: true,
    message: 'Trusted device registered successfully'
  })
}

async function removeTrustedDevice(body: any) {
  const { userId, deviceId } = body

  if (!userId || !deviceId) {
    return NextResponse.json(
      { error: 'User ID and device ID are required' },
      { status: 400 }
    )
  }

  await securityService.removeTrustedDevice(userId, deviceId)

  return NextResponse.json({
    success: true,
    message: 'Trusted device removed successfully'
  })
}