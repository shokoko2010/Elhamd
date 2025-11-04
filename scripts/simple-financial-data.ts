import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createSimpleFinancialTestData() {
  try {
    console.log('Creating simple financial test data...')
    
    // Get or create test user
    let testUser = await prisma.user.findFirst()
    if (!testUser) {
      testUser = await prisma.user.create({
        data: {
          email: 'financial-test@example.com',
          name: 'Financial Test User',
          role: 'ADMIN',
          password: 'hashedpassword',
          isActive: true,
          emailVerified: true
        }
      })
      console.log('Created test user:', testUser.email)
    }
    
    // Get or create test branch
    let testBranch = await prisma.branch.findFirst()
    if (!testBranch) {
      testBranch = await prisma.branch.create({
        data: {
          name: 'Test Branch',
          code: 'TEST',
          address: 'Test Address',
          phone: '+20123456789',
          email: 'test@example.com',
          isActive: true,
          openingDate: new Date()
        }
      })
      console.log('Created test branch:', testBranch.name)
    }
    
    // Create simple invoice
    const testInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        customerId: testUser.id,
        branchId: testBranch.id,
        type: 'SERVICE',
        status: 'SENT',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 4545.45,
        taxAmount: 454.55,
        totalAmount: 5000.00,
        paidAmount: 0,
        paymentStatus: 'PENDING' as any,
        currency: 'EGP',
        notes: 'Test invoice for financial system verification',
        createdBy: testUser.id
      }
    })
    console.log('Created test invoice:', testInvoice.invoiceNumber)
    
    // Create simple payment (requires service booking)
    const testServiceType = await prisma.serviceType.findFirst()
    if (testServiceType) {
      const testServiceBooking = await prisma.serviceBooking.create({
        data: {
          customerId: testUser.id,
          serviceTypeId: testServiceType.id,
          date: new Date(),
          timeSlot: '10:00-11:00',
          status: 'COMPLETED',
          totalPrice: 2500.00,
          paymentStatus: 'COMPLETED',
          notes: 'Test service booking for payment'
        }
      })
      
      const testPayment = await prisma.payment.create({
        data: {
          bookingId: testServiceBooking.id,
          bookingType: 'SERVICE',
          serviceBookingId: testServiceBooking.id,
          customerId: testUser.id,
          amount: 2500.00,
          currency: 'EGP',
          paymentMethod: 'BANK_TRANSFER',
          status: 'COMPLETED',
          transactionId: `TXN-${Date.now()}`,
          branchId: testBranch.id,
          notes: 'Test payment'
        }
      })
      console.log('Created test payment:', testPayment.transactionId)
    }
    
    // Create simple tax record
    const testTaxRecord = await prisma.taxRecord.create({
      data: {
        type: 'VAT',
        period: '2024-10',
        amount: 500.00,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        reference: `VAT-${Date.now()}`,
        notes: 'Test VAT record',
        createdBy: testUser.id,
        branchId: testBranch.id
      }
    })
    console.log('Created test tax record:', testTaxRecord.reference)
    
    console.log('✅ Simple financial test data created successfully!')
    
    return {
      user: testUser,
      branch: testBranch,
      invoice: testInvoice,
      taxRecord: testTaxRecord
    }
    
  } catch (error) {
    console.error('❌ Error creating financial test data:', error)
    throw error
  }
}

async function main() {
  try {
    await createSimpleFinancialTestData()
  } catch (error) {
    console.error('Error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

if (require.main === module) {
  main()
}