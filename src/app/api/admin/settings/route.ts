interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getAuthUser, requireAuth } from '@/lib/auth-server'
import { db } from '@/lib/db'

interface CompanySettings {
  name: string
  email: string
  phone: string
  address: string
  city: string
  country: string
  workingHours: string
}

interface NotificationSettings {
  emailNotifications: boolean
  pushNotifications: boolean
  bookingAlerts: boolean
  customerAlerts: boolean
  systemAlerts: boolean
}

interface SystemSettings {
  maintenanceMode: boolean
  debugMode: boolean
  cacheEnabled: boolean
  autoBackup: boolean
  sessionTimeout: number
}

export async function GET(request: NextRequest) {
  try {
    // For development/testing - bypass authentication temporarily
    // TODO: Remove this in production
    if (process.env.NODE_ENV === 'development') {
      const defaultCompanySettings: CompanySettings = {
        name: 'الحمد للسيارات',
        email: 'info@elhamd-cars.com',
        phone: '+20 2 1234 5678',
        address: 'شارع التحرير',
        city: 'القاهرة',
        country: 'مصر',
        workingHours: '9:00 ص - 8:00 م'
      }

      const defaultNotificationSettings: NotificationSettings = {
        emailNotifications: true,
        pushNotifications: true,
        bookingAlerts: true,
        customerAlerts: true,
        systemAlerts: false
      }

      const defaultSystemSettings: SystemSettings = {
        maintenanceMode: false,
        debugMode: false,
        cacheEnabled: true,
        autoBackup: true,
        sessionTimeout: 30
      }

      return NextResponse.json({
        company: defaultCompanySettings,
        notifications: defaultNotificationSettings,
        system: defaultSystemSettings
      })
    }

    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { id: user.id }
    })

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    // Get site settings for company info
    const siteSettings = await db.siteSettings.findFirst({
      where: { isActive: true }
    })

    // Default settings if none exist
    const defaultCompanySettings: CompanySettings = {
      name: siteSettings?.siteTitle || 'الحمد للسيارات',
      email: siteSettings?.contactEmail || 'info@elhamd-cars.com',
      phone: siteSettings?.contactPhone || '+20 2 1234 5678',
      address: siteSettings?.contactAddress || 'شارع التحرير',
      city: 'القاهرة',
      country: 'مصر',
      workingHours: '9:00 ص - 8:00 م'
    }

    const defaultNotificationSettings: NotificationSettings = {
      emailNotifications: true,
      pushNotifications: true,
      bookingAlerts: true,
      customerAlerts: true,
      systemAlerts: false
    }

    const defaultSystemSettings: SystemSettings = {
      maintenanceMode: false,
      debugMode: false,
      cacheEnabled: true,
      autoBackup: true,
      sessionTimeout: 30
    }

    // Get performance settings from site settings
    const performanceSettings = siteSettings?.performanceSettings as any || {}

    const systemSettings: SystemSettings = {
      ...defaultSystemSettings,
      cacheEnabled: performanceSettings.cachingEnabled ?? true,
      debugMode: performanceSettings.debugMode ?? false
    }

    return NextResponse.json({
      company: defaultCompanySettings,
      notifications: defaultNotificationSettings,
      system: systemSettings
    })
  } catch (error) {
    console.error('Error fetching admin settings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch admin settings' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser()
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const adminUser = await db.user.findUnique({
      where: { id: user.id }
    })

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { company, notifications, system } = body

    // Get current active settings
    const currentSettings = await db.siteSettings.findFirst({
      where: { isActive: true }
    })

    if (!currentSettings) {
      return NextResponse.json(
        { error: 'No active settings found' },
        { status: 404 }
      )
    }

    // Update site settings with company info
    const updatedSettings = await db.siteSettings.update({
      where: { id: currentSettings.id },
      data: {
        siteTitle: company?.name || currentSettings.siteTitle,
        contactEmail: company?.email || currentSettings.contactEmail,
        contactPhone: company?.phone || currentSettings.contactPhone,
        contactAddress: company?.address || currentSettings.contactAddress,
        workingHours: company?.workingHours || currentSettings.workingHours,
        performanceSettings: {
          ...(currentSettings.performanceSettings as any || {}),
          cachingEnabled: system?.cacheEnabled,
          debugMode: system?.debugMode,
          autoBackup: system?.autoBackup,
          sessionTimeout: system?.sessionTimeout
        },
        updatedAt: new Date()
      }
    })

    // In a real system, you would save notification settings to a separate table
    // For now, we'll just return success

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings: updatedSettings
    })
  } catch (error) {
    console.error('Error updating admin settings:', error)
    return NextResponse.json(
      { error: 'Failed to update admin settings' },
      { status: 500 }
    )
  }
}