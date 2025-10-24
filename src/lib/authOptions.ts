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
        try {
          console.log('NextAuth authorize attempt:', { email: credentials?.email })
          
          if (!credentials?.email || !credentials?.password) {
            console.log('Missing credentials')
            return null
          }

          const { db } = await import('@/lib/db')
          const bcrypt = await import('bcryptjs')
          const { PermissionService } = await import('@/lib/permissions')

          const user = await db.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user) {
            console.log('User not found:', credentials.email)
            return null
          }

          if (!user.isActive) {
            console.log('User is not active:', credentials.email)
            return null
          }

          if (!user.password) {
            console.log('User has no password set:', credentials.email)
            return null
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          )

          if (!isPasswordValid) {
            console.log('Invalid password for:', credentials.email)
            return null
          }

          console.log('User authenticated successfully:', credentials.email)

          // Get user permissions
          const permissions = await PermissionService.getUserPermissions(user.id)

          // Update last login
          try {
            await db.user.update({
              where: { id: user.id },
              data: { lastLoginAt: new Date() }
            })
          } catch (updateError) {
            console.warn('Failed to update last login:', updateError)
            // Don't fail authentication if we can't update last login
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
          console.error('NextAuth authorize error:', error)
          return null
        }
      }
    })
  ],
  session: {
    strategy: 'jwt' as const
  },
  secret: process.env.NEXTAUTH_SECRET,
  url: process.env.NEXTAUTH_URL || 'https://elhamdimport.com',
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.phone = user.phone
        token.branchId = user.branchId
        token.permissions = user.permissions
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as UserRole
        session.user.phone = token.phone as string
        session.user.branchId = token.branchId as string
        session.user.permissions = token.permissions as string[]
      }
      return session
    }
  },
  pages: {
    signIn: '/login',
    signUp: '/register'
  },
  cookies: {
    sessionToken: {
      name: 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        domain: process.env.NODE_ENV === 'production' ? '.elhamdimport.com' : undefined
      }
    }
  },
  useSecureCookies: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development'
}