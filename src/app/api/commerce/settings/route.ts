interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'

interface CommerceSettings {
  ecommerce: {
    enabled: boolean
    allowOnlinePurchase: boolean
    requireApproval: boolean
    autoConfirmOrders: boolean
    minOrderAmount: number
    maxOrderAmount: number
    currency: string
    taxRate: number
    shippingEnabled: boolean
    freeShippingThreshold: number
    shippingFee: number
  }
  payments: {
    enabled: boolean
    methods: {
      creditCard: boolean
      debitCard: boolean
      bankTransfer: boolean
      cashOnDelivery: boolean
      mobileWallet: boolean
    }
    providers: {
      stripe: boolean
      paypal: boolean
      fawry: boolean
      vodafoneCash: boolean
    }
  }
  orders: {
    autoGenerateNumber: boolean
    numberPrefix: string
    statusFlow: string[]
    allowCancellation: boolean
    cancellationPeriod: number
    allowModifications: boolean
    notificationEnabled: boolean
  }
  reviews: {
    enabled: boolean
    requireApproval: boolean
    allowPhotos: boolean
    allowAnonymous: boolean
    minRating: number
    autoPublish: boolean
  }
  promotions: {
    enabled: boolean
    allowCoupons: boolean
    allowDiscounts: boolean
    allowLoyaltyPoints: boolean
    pointsPerPurchase: number
    pointsValue: number
  }
}

// Default settings
const defaultSettings: CommerceSettings = {
  ecommerce: {
    enabled: true,
    allowOnlinePurchase: true,
    requireApproval: true,
    autoConfirmOrders: false,
    minOrderAmount: 1000,
    maxOrderAmount: 1000000,
    currency: 'EGP',
    taxRate: 14,
    shippingEnabled: true,
    freeShippingThreshold: 50000,
    shippingFee: 100
  },
  payments: {
    enabled: true,
    methods: {
      creditCard: true,
      debitCard: true,
      bankTransfer: true,
      cashOnDelivery: false,
      mobileWallet: true
    },
    providers: {
      stripe: true,
      paypal: false,
      fawry: true,
      vodafoneCash: true
    }
  },
  orders: {
    autoGenerateNumber: true,
    numberPrefix: 'ORD-',
    statusFlow: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
    allowCancellation: true,
    cancellationPeriod: 24,
    allowModifications: true,
    notificationEnabled: true
  },
  reviews: {
    enabled: true,
    requireApproval: true,
    allowPhotos: true,
    allowAnonymous: false,
    minRating: 1,
    autoPublish: false
  },
  promotions: {
    enabled: true,
    allowCoupons: true,
    allowDiscounts: true,
    allowLoyaltyPoints: true,
    pointsPerPurchase: 100,
    pointsValue: 0.01
  }
}

export async function GET() {
  try {
    const user = await requireUnifiedAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to access commerce settings
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Try to get settings from database
    let settings = await db.commerceSettings.findFirst()
    
    if (!settings) {
      // Create default settings if none exist
      settings = await db.commerceSettings.create({
        data: {
          settings: defaultSettings
        }
      })
    }

    return NextResponse.json(settings.settings)
  } catch (error) {
    console.error('Error fetching commerce settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update commerce settings
    if (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    
    // Validate the settings structure
    const newSettings: CommerceSettings = body

    // Update or create settings in database
    const existingSettings = await db.commerceSettings.findFirst()
    
    if (existingSettings) {
      const updatedSettings = await db.commerceSettings.update({
        where: { id: existingSettings.id },
        data: {
          settings: newSettings,
          updatedAt: new Date()
        }
      })
      return NextResponse.json(updatedSettings.settings)
    } else {
      const createdSettings = await db.commerceSettings.create({
        data: {
          settings: newSettings
        }
      })
      return NextResponse.json(createdSettings.settings)
    }
  } catch (error) {
    console.error('Error updating commerce settings:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}