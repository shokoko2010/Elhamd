import { NextRequest } from 'next/server'
import { UserRole } from '@prisma/client'

import { getAuthUser } from '@/lib/auth-server'
import { authenticateProductionUser } from '@/lib/simple-production-auth'

export interface ResolvedAuthUser {
  id: string
  email: string
  name?: string | null
  role: UserRole
  phone?: string | null
  branchId?: string | null
  permissions: string[]
}

export async function resolveAuthUser(request?: NextRequest): Promise<ResolvedAuthUser | null> {
  const sessionUser = await getAuthUser()
  if (sessionUser) {
    return {
      id: sessionUser.id,
      email: sessionUser.email,
      name: sessionUser.name ?? null,
      role: sessionUser.role,
      phone: sessionUser.phone ?? null,
      branchId: sessionUser.branchId ?? null,
      permissions: Array.isArray(sessionUser.permissions) ? sessionUser.permissions : [],
    }
  }

  const fallbackUser = await authenticateProductionUser(request)
  if (!fallbackUser) {
    return null
  }

  return {
    id: fallbackUser.id,
    email: fallbackUser.email,
    name: fallbackUser.name ?? null,
    role: fallbackUser.role,
    phone: fallbackUser.phone ?? null,
    branchId: fallbackUser.branchId ?? null,
    permissions: Array.isArray(fallbackUser.permissions) ? fallbackUser.permissions : [],
  }
}
