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
      employee?: any
    }
  }

  interface User {
    id: string
    email: string
    name?: string | null
    role: UserRole
    phone?: string | null
    branchId?: string | null
    employee?: any
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    role: UserRole
    phone?: string | null
    branchId?: string | null
    employee?: any
  }
}