import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string | null
      role: UserRole
      phone?: string | null
      branchId?: string | null
      permissions?: string[]
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: UserRole
    phone?: string | null
    branchId?: string | null
    permissions?: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    phone?: string | null
    branchId?: string | null
    permissions?: string[]
  }
}