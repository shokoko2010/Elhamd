interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { db } from '@/lib/db'
import { PermissionService } from '@/lib/permissions'

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }
    
    // Check if user has permission to view users
    // For SUPER_ADMIN, allow access even if permissions don't exist yet
    if (user.role !== 'SUPER_ADMIN') {
      try {
        const hasPermission = await PermissionService.hasPermission(user.id, 'view_users')
        if (!hasPermission) {
          return NextResponse.json({ error: 'Access denied' }, { status: 403 })
        }
      } catch (error) {
        // If permissions don't exist yet, only allow SUPER_ADMIN
        return NextResponse.json({ error: 'Access denied' }, { status: 403 })
      }
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (role && role !== 'all') {
      where.role = role
    }

    // Get users with their permissions
    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        branchId: true,
        isActive: true,
        createdAt: true,
        branch: {
          select: {
            name: true
          }
        }
      },
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    })

    // Get permissions for each user
    const usersWithPermissions = await Promise.all(
      users.map(async (user) => {
        const permissions = await PermissionService.getUserPermissions(user.id)
        return {
          ...user,
          permissions,
          branchName: user.branch?.name
        }
      })
    )

    // Get total count for pagination
    const total = await db.user.count({ where })

    return NextResponse.json({
      users: usersWithPermissions,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching users with permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    )
  }
}