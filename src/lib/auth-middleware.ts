import { getServerSession } from 'next-auth/next'
import { authOptions } from './auth'
import { PermissionsService } from './permissions'
import { NextRequest, NextResponse } from 'next/server'
import { UserRole } from '@prisma/client'

export async function requireAuth(request: NextRequest) {
  const session = await getServerSession(authOptions)
  
  if (!session?.user) {
    return NextResponse.json(
      { error: 'Authentication required' },
      { status: 401 }
    )
  }
  
  return session.user
}

export async function requirePermission(permission: string, request: NextRequest) {
  const user = await requireAuth(request)
  
  if (user instanceof NextResponse) {
    return user // Error response
  }
  
  const hasPermission = await PermissionsService.hasPermission(user.id, permission as any)
  
  if (!hasPermission) {
    return NextResponse.json(
      { error: 'Insufficient permissions' },
      { status: 403 }
    )
  }
  
  return user
}

export async function requireRole(role: UserRole, request: NextRequest) {
  const user = await requireAuth(request)
  
  if (user instanceof NextResponse) {
    return user // Error response
  }
  
  if (user.role !== role && user.role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json(
      { error: 'Insufficient role permissions' },
      { status: 403 }
    )
  }
  
  return user
}

export async function requireAnyRole(roles: UserRole[], request: NextRequest) {
  const user = await requireAuth(request)
  
  if (user instanceof NextResponse) {
    return user // Error response
  }
  
  if (!roles.includes(user.role) && user.role !== UserRole.SUPER_ADMIN) {
    return NextResponse.json(
      { error: 'Insufficient role permissions' },
      { status: 403 }
    )
  }
  
  return user
}