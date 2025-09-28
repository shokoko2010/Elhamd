import { NextRequest, NextResponse } from 'next/server'
import { PaymentMethod } from '@prisma/client'

interface PaymentGateway {
  id: string
  name: string
  status: 'active' | 'inactive' | 'maintenance'
  supportedMethods: PaymentMethod[]
  fees: {
    credit_card: number
    debit_card: number
    mobile_wallet: number
    bank_transfer: number
  }
  features: string[]
}

export async function GET(request: NextRequest) {
  try {
    // In a real implementation, this would fetch from a database
    // For now, we'll return mock data for the Egyptian payment gateways
    const gateways: PaymentGateway[] = [
      {
        id: 'fawry',
        name: 'Fawry',
        status: 'active',
        supportedMethods: [
          PaymentMethod.CREDIT_CARD,
          PaymentMethod.DEBIT_CARD,
          PaymentMethod.MOBILE_WALLET
        ],
        fees: {
          credit_card: 0.025, // 2.5%
          debit_card: 0.015, // 1.5%
          mobile_wallet: 0.02, // 2%
          bank_transfer: 0.005 // 0.5%
        },
        features: [
          'أكبر شبكة دفع في مصر',
          'دعم جميع البنوك المصرية',
          'دفع عبر FawryPay',
          'دفع في فروع فوري',
          'تطبيق موبايل متكامل'
        ]
      },
      {
        id: 'paymob',
        name: 'PayMob',
        status: 'active',
        supportedMethods: [
          PaymentMethod.CREDIT_CARD,
          PaymentMethod.DEBIT_CARD,
          PaymentMethod.MOBILE_WALLET
        ],
        fees: {
          credit_card: 0.022, // 2.2%
          debit_card: 0.018, // 1.8%
          mobile_wallet: 0.015, // 1.5%
          bank_transfer: 0.008 // 0.8%
        },
        features: [
          'بوابة دفع متكاملة',
          'دعم متعدد للعملات',
          'واجهة برمجية سهلة',
          'تقارير مفصلة',
          'دعم فني 24/7'
        ]
      },
      {
        id: 'vodafone_cash',
        name: 'Vodafone Cash',
        status: 'active',
        supportedMethods: [
          PaymentMethod.MOBILE_WALLET
        ],
        fees: {
          credit_card: 0.025,
          debit_card: 0.015,
          mobile_wallet: 0.01, // 1%
          bank_transfer: 0.005
        },
        features: [
          'محفظة فودافون الإلكترونية',
          'تحويل فوري',
          'دفع في المتاجر',
          'سحب من أجهزة الصراف',
          'تطبيق سهل الاستخدام'
        ]
      },
      {
        id: 'bank_transfer',
        name: 'تحويل بنكي',
        status: 'active',
        supportedMethods: [
          PaymentMethod.BANK_TRANSFER
        ],
        fees: {
          credit_card: 0.025,
          debit_card: 0.015,
          mobile_wallet: 0.02,
          bank_transfer: 0.002 // 0.2%
        },
        features: [
          'تحويل آمن',
          'دعم جميع البنوك',
          'تتبع التحويلات',
          'إيصالات رقمية',
          'دعم العملات الأجنبية'
        ]
      }
    ]

    return NextResponse.json({
      gateways,
      total: gateways.length,
      active: gateways.filter(g => g.status === 'active').length
    })
  } catch (error) {
    console.error('Error fetching payment gateways:', error)
    return NextResponse.json(
      { error: 'Failed to fetch payment gateways' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, gatewayId, config } = body

    if (action === 'update') {
      // Update gateway configuration
      // In a real implementation, this would update the database
      return NextResponse.json({
        success: true,
        message: 'Gateway configuration updated successfully'
      })
    }

    if (action === 'toggle') {
      // Toggle gateway status
      // In a real implementation, this would update the database
      return NextResponse.json({
        success: true,
        message: 'Gateway status updated successfully'
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('Error updating payment gateway:', error)
    return NextResponse.json(
      { error: 'Failed to update payment gateway' },
      { status: 500 }
    )
  }
}