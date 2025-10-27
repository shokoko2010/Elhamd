import CredentialsProvider from 'next-auth/providers/credentials'
import { UserRole } from '@prisma/client'

export const authOptions = {
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const { db } = await import('@/lib/db')
          const bcrypt = await import('bcryptjs')
          const { PermissionService } = await import('@/lib/permissions')

          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.isActive || !user.password) {
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            return null
          }

          // Get user permissions
          let permissions = []
          try {
            permissions = await PermissionService.getUserPermissions(user.id)
          } catch (permError) {
            console.warn('Could not fetch user permissions:', permError)
            permissions = []
          }

          // Update last login
          try {
            await db.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() }
            })
          } catch (updateError) {
            console.warn('Could not update last login:', updateError)
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
            phone: user.phone,
            branchId: user.branchId,
            permissions
          }
        } catch (error) {
          console.error('Auth error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const,
    maxAge: 24 * 60 * 60, // 24 hours
    updateAge: 60 * 60, // 1 hour
  },
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development',
  url: process.env.NEXTAUTH_URL || 'http://localhost:3000',
  trustHost: true,
  debug: process.env.NODE_ENV === 'development',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.phone = user.phone
        token.branchId = user.branchId
        token.permissions = user.permissions || []
      }
      return token
    },
    async session({ session, token }) {
      if (token && session?.user) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.phone = token.phone as string || undefined
        session.user.branchId = token.branchId as string || undefined
        session.user.permissions = (token.permissions as string[]) || []
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register'
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
}