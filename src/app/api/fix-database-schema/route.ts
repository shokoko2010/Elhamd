import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getAuthUser } from '@/lib/auth-server'

export async function POST(request: NextRequest) {
  try {
    console.log('=== DATABASE SCHEMA FIX API START ===')
    
    // Test database connection
    await db.$connect()
    console.log('✅ Database connected')
    
    // Test authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    console.log('✅ User authenticated:', user.email)
    
    // Check if metadata field exists in payments table
    let paymentsMetadataExists = false
    try {
      await db.payment.findFirst({ where: { metadata: { not: null } } })
      paymentsMetadataExists = true
      console.log('✅ Payments metadata field exists')
    } catch (error) {
      console.log('❌ Payments metadata field missing:', error instanceof Error ? error.message : 'Unknown error')
    }
    
    // Check if metadata field exists in transactions table
    let transactionsMetadataExists = false
    try {
      await db.transaction.findFirst({ where: { metadata: { not: null } } })
      transactionsMetadataExists = true
      console.log('✅ Transactions metadata field exists')
    } catch (error) {
      console.log('❌ Transactions metadata field missing:', error instanceof Error ? error.message : 'Unknown error')
    }
    
    // Try to add metadata columns if they don't exist
    const results = []
    
    if (!paymentsMetadataExists) {
      try {
        await db.$executeRaw`ALTER TABLE payments ADD COLUMN IF NOT EXISTS metadata JSONB`
        console.log('✅ Added metadata column to payments table')
        results.push('Added metadata column to payments table')
        
        // Verify the column was added
        await db.payment.findFirst({ where: { metadata: { not: null } } })
        paymentsMetadataExists = true
      } catch (alterError) {
        console.error('❌ Failed to add metadata column to payments:', alterError)
        results.push(`Failed to add metadata to payments: ${alterError instanceof Error ? alterError.message : 'Unknown error'}`)
      }
    }
    
    if (!transactionsMetadataExists) {
      try {
        await db.$executeRaw`ALTER TABLE transactions ADD COLUMN IF NOT EXISTS metadata JSONB`
        console.log('✅ Added metadata column to transactions table')
        results.push('Added metadata column to transactions table')
        
        // Verify the column was added
        await db.transaction.findFirst({ where: { metadata: { not: null } } })
        transactionsMetadataExists = true
      } catch (alterError) {
        console.error('❌ Failed to add metadata column to transactions:', alterError)
        results.push(`Failed to add metadata to transactions: ${alterError instanceof Error ? alterError.message : 'Unknown error'}`)
      }
    }
    
    console.log('=== DATABASE SCHEMA FIX API COMPLETE ===')
    
    return NextResponse.json({
      success: true,
      message: 'Database schema check completed',
      schema: {
        paymentsMetadataExists,
        transactionsMetadataExists
      },
      results: results,
      nextSteps: [
        'Test the finance payment functionality',
        'Test the invoice status update functionality',
        'If issues persist, check Vercel function logs'
      ]
    })
    
  } catch (error) {
    console.error('❌ Database schema fix failed:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error')
    
    return NextResponse.json({
      success: false,
      error: 'Database schema fix failed',
      details: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      manualFixInstructions: {
        sqlScript: 'fix-finance-database.sql',
        steps: [
          '1. Connect to your Prisma Postgres database',
          '2. Run the SQL script in fix-finance-database.sql',
          '3. Verify the metadata columns are added',
          '4. Test the finance functionality'
        ]
      }
    }, { status: 500 })
  } finally {
    await db.$disconnect()
  }
}