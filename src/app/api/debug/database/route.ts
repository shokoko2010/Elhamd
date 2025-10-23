import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    // Test database connection
    await db.$connect()
    
    // Check if we can query basic data
    const invoiceCount = await db.invoice.count()
    const paymentCount = await db.payment.count()
    const serviceTypeCount = await db.serviceType.count()
    
    // Check for offline payment service type
    const offlineServiceType = await db.serviceType.findFirst({
      where: { name: 'Offline Payment Service' }
    })
    
    // Check tax rates
    const taxRateCount = await db.taxRate.count()
    
    return NextResponse.json({
      success: true,
      message: 'Database connection and basic queries working',
      data: {
        invoiceCount,
        paymentCount,
        serviceTypeCount,
        taxRateCount,
        offlineServiceTypeExists: !!offlineServiceType,
        offlineServiceType: offlineServiceType ? {
          id: offlineServiceType.id,
          name: offlineServiceType.name,
          category: offlineServiceType.category
        } : null
      }
    })
  } catch (error) {
    console.error('Debug API error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        type: typeof error,
        name: error instanceof Error ? error.name : 'Unknown'
      }
    }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}