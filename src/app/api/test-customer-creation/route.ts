import { NextRequest, NextResponse } from 'next/server'
import { executeWithRetry } from '@/lib/db'
import { authenticateProductionUser } from '@/lib/production-auth-vercel'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 Testing customer creation API...')
    
    // Test authentication
    const user = await authenticateProductionUser(request)
    if (!user) {
      return NextResponse.json({ 
        error: 'Authentication failed',
        test: 'FAILED'
      }, { status: 401 })
    }
    
    console.log(`✅ Authentication successful: ${user.email}`)
    
    // Test database connection
    const testResult = await executeWithRetry(async () => {
      const count = await db.user.count()
      return { userCount: count }
    })
    
    console.log(`✅ Database connection successful: ${testResult.userCount} users found`)
    
    // Test customer creation with sample data
    const testEmail = `test-${Date.now()}@example.com`
    const testCustomer = await executeWithRetry(async () => {
      return await db.user.create({
        data: {
          email: testEmail,
          name: 'Test Customer',
          phone: '+20 123 456 7890',
          role: 'CUSTOMER',
          status: 'active',
          segment: 'CUSTOMER'
        }
      })
    })
    
    console.log(`✅ Test customer created: ${testCustomer.id}`)
    
    // Clean up - delete test customer
    await executeWithRetry(async () => {
      return await db.user.delete({
        where: { id: testCustomer.id }
      })
    })
    
    console.log(`✅ Test customer cleaned up`)
    
    return NextResponse.json({
      success: true,
      test: 'PASSED',
      message: 'Customer creation API is working correctly',
      details: {
        authenticatedUser: user.email,
        userRole: user.role,
        databaseConnected: true,
        totalUsers: testResult.userCount,
        testCustomerCreated: true,
        testCustomerDeleted: true
      }
    })
    
  } catch (error) {
    console.error('❌ Test failed:', error)
    return NextResponse.json({
      success: false,
      test: 'FAILED',
      error: error instanceof Error ? error.message : 'Unknown error',
      details: {
        timestamp: new Date().toISOString(),
        stack: error instanceof Error ? error.stack : undefined
      }
    }, { status: 500 })
  }
}