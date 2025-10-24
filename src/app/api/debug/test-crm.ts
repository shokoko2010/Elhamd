import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== CRM TEST START ===')
    
    // Test database connection
    await db.$connect()
    console.log('✅ Database connected')
    
    // Test authentication
    const user = await getAuthUser()
    console.log('👤 Auth user:', user ? `${user.email} (${user.role})` : 'Not authenticated')
    
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication required',
        fix: 'Please log in first'
      }, { status: 401 })
    }
    
    // Test permissions
    const hasPermission = user.role === 'ADMIN' || 
                         user.role === 'SUPER_ADMIN' || 
                         user.role === 'BRANCH_MANAGER' || 
                         user.role === 'SALES_MANAGER' ||
                         user.permissions.includes('create_customers')
    
    console.log('🔐 Has permission:', hasPermission)
    
    if (!hasPermission) {
      return NextResponse.json({ 
        error: 'Insufficient permissions',
        userRole: user.role,
        permissionsCount: user.permissions.length,
        fix: 'Contact admin to get proper permissions'
      }, { status: 403 })
    }
    
    // Test creating a simple customer
    const testCustomer = {
      email: `test-${Date.now()}@example.com`,
      name: 'Test Customer',
      phone: '+201234567890',
      segment: 'LEAD'
    }
    
    console.log('📝 Creating test customer:', testCustomer.email)
    
    // Check if customer already exists
    const existingCustomer = await db.user.findUnique({
      where: { email: testCustomer.email }
    })
    
    if (existingCustomer) {
      console.log('⚠️ Test customer already exists, deleting...')
      await db.user.delete({
        where: { email: testCustomer.email }
      })
    }
    
    // Create customer
    const customer = await db.user.create({
      data: {
        email: testCustomer.email,
        name: testCustomer.name,
        phone: testCustomer.phone,
        role: 'CUSTOMER',
        status: 'active',
        customerProfile: {
          create: {
            segment: testCustomer.segment,
            preferences: {},
            riskScore: 0,
            satisfactionScore: 0,
            referralCount: 0,
            totalPurchases: 0,
            totalSpent: 0,
            isActive: true
          }
        }
      },
      include: {
        customerProfile: true
      }
    })
    
    console.log('✅ Test customer created:', customer.id)
    
    // Clean up - delete the test customer
    await db.user.delete({
      where: { id: customer.id }
    })
    console.log('🧹 Test customer cleaned up')
    
    await db.$disconnect()
    
    return NextResponse.json({
      success: true,
      message: 'CRM test completed successfully',
      tests: {
        database: '✅ Connected',
        authentication: `✅ ${user.email} (${user.role})`,
        permissions: '✅ Sufficient',
        customerCreation: '✅ Working'
      }
    })
    
  } catch (error) {
    console.error('❌ CRM test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      fix: 'Check database connection and permissions'
    }, { status: 500 })
  }
}