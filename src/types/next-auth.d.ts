import { UserRole } from '@prisma/client'

declare module 'next-auth' {
  interface Session {
    user: {
      id: string
      email: string
      name?: string
      role: UserRole
      phone?: string
      branchId?: string
      permissions: string[]
    }
  }

  interface User {
    id: string
    email: string
    name?: string
    role: UserRole
    phone?: string
    branchId?: string
    permissions: string[]
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    phone?: string
    branchId?: string
    permissions: string[]
  }
}