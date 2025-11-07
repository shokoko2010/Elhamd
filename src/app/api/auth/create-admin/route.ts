import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'
import { PERMISSIONS, PermissionService } from '@/lib/permissions'

/**
 * POST /api/auth/create-admin
 * Create the initial SUPER_ADMIN user. This route is secured by an optional secret key
 * provided via the `x-create-admin-key` header. If an admin already exists or the
 * provided key does not match `process.env.CREATE_ADMIN_KEY`, the request is rejected.
 */
export async function POST(request: NextRequest) {
  try {
    // Secure this endpoint with a secret key, if provided in the environment
    const secretKey = process.env.CREATE_ADMIN_KEY
    if (secretKey) {
      const providedKey = request.headers.get('x-create-admin-key') || ''
      if (providedKey !== secretKey) {
        return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 })
      }
    }
    // If any admin (ADMIN or SUPER_ADMIN) already exists, disallow creation
    const existingAdmin = await db.user.findFirst({
      where: {
        role: {
          in: [UserRole.ADMIN, UserRole.SUPER_ADMIN],
        },
      },
    })
    if (existingAdmin) {
      return NextResponse.json({ success: false, message: 'Admin user already exists', admin: { email: existingAdmin.email } }, { status: 400 })
    }
    // Parse request body for admin details
    const { name, email, password, phone, branchId } = await request.json()
    if (!email || !password) {
      return NextResponse.json({ success: false, message: 'Email and password are required' }, { status: 400 })
    }
    const hashedPassword = await bcrypt.hash(password, 10)
    const newAdmin = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: UserRole.SUPER_ADMIN,
        phone,
        branchId,
        isActive: true,
      },
    })
    // Give the new admin all permissions
    await PermissionService.setUserPermissions(newAdmin.id, Object.values(PERMISSIONS))
    return NextResponse.json({ success: true, admin: { id: newAdmin.id, email: newAdmin.email } }, { status: 201 })
  } catch (error) {
    console.error('create-admin error:', error)
    return NextResponse.json({ success: false, message: 'Internal server error' }, { status: 500 })
  }
}
