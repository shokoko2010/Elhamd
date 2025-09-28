import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser } from '@/lib/auth-server'
import { getApiUser } from '@/lib/api-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Try NextAuth first
    const user = await getAuthUser()
    
    if (!user) {
      // Try API token authentication
      const apiUser = await getApiUser(request)
      if (!apiUser) {
        return NextResponse.json(
          { error: 'Authentication required' },
          { status: 401 }
        )
      }
      
      // Fetch user profile from database using API user
      const userProfile = await db.user.findUnique({
        where: { id: apiUser.id }
      })

      if (!userProfile) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        )
      }

      // Return only safe fields
      const safeProfile = {
        id: userProfile.id,
        email: userProfile.email,
        name: userProfile.name,
        phone: userProfile.phone,
        role: userProfile.role,
        createdAt: userProfile.createdAt,
        lastLoginAt: userProfile.lastLoginAt,
        emailVerified: userProfile.emailVerified,
        securitySettings: userProfile.securitySettings,
        notificationPreferences: userProfile.notificationPreferences,
        addresses: userProfile.addresses,
        paymentMethods: userProfile.paymentMethods
      }

      return NextResponse.json({ 
        message: 'Profile fetched successfully',
        profile: safeProfile
      })
    }

    // Fetch user profile from database
    const userProfile = await db.user.findUnique({
      where: { id: user.id }
    })

    if (!userProfile) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    // Return only safe fields
    const safeProfile = {
      id: userProfile.id,
      email: userProfile.email,
      name: userProfile.name,
      phone: userProfile.phone,
      role: userProfile.role,
      createdAt: userProfile.createdAt,
      lastLoginAt: userProfile.lastLoginAt,
      emailVerified: userProfile.emailVerified,
      securitySettings: userProfile.securitySettings,
      notificationPreferences: userProfile.notificationPreferences,
      addresses: userProfile.addresses,
      paymentMethods: userProfile.paymentMethods
    }

    return NextResponse.json({ 
      message: 'Profile fetched successfully',
      profile: safeProfile
    })
  } catch (error) {
    console.error('Error fetching profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    const { name, email, phone } = await request.json()
    
    // Update user profile
    const updatedUser = await db.user.update({
      where: { id: user.id },
      data: {
        ...(name && { name }),
        ...(email && { email }),
        ...(phone && { phone })
      }
    })

    // Return only safe fields
    const safeProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      name: updatedUser.name,
      phone: updatedUser.phone,
      role: updatedUser.role,
      createdAt: updatedUser.createdAt,
      lastLoginAt: updatedUser.lastLoginAt,
      emailVerified: updatedUser.emailVerified,
      securitySettings: updatedUser.securitySettings
    }

    return NextResponse.json({ 
      message: 'Profile updated successfully',
      profile: safeProfile
    })
  } catch (error) {
    console.error('Error updating profile:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}