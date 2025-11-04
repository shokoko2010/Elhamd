import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createFinancialTestData() {
  try {
    console.log('Creating financial test data...')
    
    // First create a test user if none exists
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
    
    // Create test branch if none exists
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
    
    // Create test invoices
    const testInvoice1 = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}-1`,
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
        notes: 'Test invoice #1 for financial system verification',
        createdBy: testUser.id,
        items: {
          create: [
            {
              description: 'خدمة صيانة دورية للشاحنة',
              quantity: 1,
              unitPrice: 4545.45,
              totalPrice: 4545.45,
              taxRate: 10,
              taxAmount: 454.55
            }
          ]
        }
      }
    })
    console.log('Created test invoice 1:', testInvoice1.invoiceNumber)
    
    const testInvoice2 = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}-2`,
        customerId: testUser.id,
        branchId: testBranch.id,
        type: 'PRODUCT',
        status: 'PAID',
        issueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        subtotal: 9090.91,
        taxAmount: 909.09,
        totalAmount: 10000.00,
        paidAmount: 10000.00,
        paymentStatus: 'PAID' as any,
        currency: 'EGP',
        notes: 'Test invoice #2 for financial system verification - Paid',
        createdBy: testUser.id,
        approvedBy: testUser.id,
        approvedAt: new Date(),
        sentAt: new Date(),
        paidAt: new Date(),
        items: {
          create: [
            {
              description: 'قطع غيار أصلية',
              quantity: 2,
              unitPrice: 4545.45,
              totalPrice: 9090.91,
              taxRate: 10,
              taxAmount: 909.09
            }
          ]
        }
      }
    })
    console.log('Created test invoice 2:', testInvoice2.invoiceNumber)
    
    const testInvoice3 = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}-3`,
        customerId: testUser.id,
        branchId: testBranch.id,
        type: 'SERVICE',
        status: 'OVERDUE',
        issueDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000),
        dueDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000),
        subtotal: 2727.27,
        taxAmount: 272.73,
        totalAmount: 3000.00,
        paidAmount: 0,
        paymentStatus: 'PENDING' as any,
        currency: 'EGP',
        notes: 'Test invoice #3 for financial system verification - Overdue',
        createdBy: testUser.id,
        sentAt: new Date(),
        items: {
          create: [
            {
              description: 'خدمة إصلاح عاجلة',
              quantity: 1,
              unitPrice: 2727.27,
              totalPrice: 2727.27,
              taxRate: 10,
              taxAmount: 272.73
            }
          ]
        }
      }
    })
    console.log('Created test invoice 3:', testInvoice3.invoiceNumber)
    
    // Create test service type first
    let testServiceType = await prisma.serviceType.findFirst()
    if (!testServiceType) {
      testServiceType = await prisma.serviceType.create({
        data: {
          name: 'Test Service',
          description: 'Test service for financial verification',
          duration: 60,
          price: 10000.00,
          category: 'MAINTENANCE',
          isActive: true
        }
      })
      console.log('Created test service type:', testServiceType.name)
    }
    
    // Create test service booking first for payments
    const testServiceBooking = await prisma.serviceBooking.create({
      data: {
        customerId: testUser.id,
        serviceTypeId: testServiceType.id,
        date: new Date(),
        timeSlot: '10:00-11:00',
        status: 'COMPLETED',
        totalPrice: 10000.00,
        paymentStatus: 'COMPLETED',
        notes: 'Test service booking for financial verification'
      }
    })
    console.log('Created test service booking:', testServiceBooking.id)
    
    // Create test payments
    const testPayment1 = await prisma.payment.create({
      data: {
        bookingId: testServiceBooking.id,
        bookingType: 'SERVICE',
        serviceBookingId: testServiceBooking.id,
        customerId: testUser.id,
        amount: 10000.00,
        currency: 'EGP',
        paymentMethod: 'BANK_TRANSFER',
        status: 'COMPLETED',
        transactionId: `TXN-${Date.now()}-1`,
        branchId: testBranch.id,
        notes: 'Test payment for invoice #2'
      }
    })
    console.log('Created test payment 1:', testPayment1.transactionId)
    
    const testPayment2 = await prisma.payment.create({
      data: {
        bookingId: testServiceBooking.id,
        bookingType: 'SERVICE',
        serviceBookingId: testServiceBooking.id,
        customerId: testUser.id,
        amount: 2500.00,
        currency: 'EGP',
        paymentMethod: 'MOBILE_WALLET',
        status: 'PENDING',
        transactionId: `TXN-${Date.now()}-2`,
        branchId: testBranch.id,
        notes: 'Test payment for invoice #1 - Pending'
      }
    })
    console.log('Created test payment 2:', testPayment2.transactionId)
    
    const testPayment3 = await prisma.payment.create({
      data: {
        bookingId: testServiceBooking.id,
        bookingType: 'SERVICE',
        serviceBookingId: testServiceBooking.id,
        customerId: testUser.id,
        amount: 1500.00,
        currency: 'EGP',
        paymentMethod: 'CREDIT_CARD',
        status: 'FAILED',
        transactionId: `TXN-${Date.now()}-3`,
        branchId: testBranch.id,
        notes: 'Test payment - Failed'
      }
    })
    console.log('Created test payment 3:', testPayment3.transactionId)
    
    // Create test tax records
    const testTaxRecord1 = await prisma.taxRecord.create({
      data: {
        type: 'VAT',
        period: '2024-10',
        amount: 1636.37,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000),
        status: 'PENDING',
        reference: `VAT-${Date.now()}-1`,
        notes: 'VAT for October 2024',
        createdBy: testUser.id,
        branchId: testBranch.id
      }
    })
    console.log('Created test tax record 1:', testTaxRecord1.reference)
    
    const testTaxRecord2 = await prisma.taxRecord.create({
      data: {
        type: 'INCOME_TAX',
        period: '2024-Q3',
        amount: 5000.00,
        dueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000),
        status: 'PAID',
        reference: `TAX-${Date.now()}-2`,
        notes: 'Income tax for Q3 2024',
        createdBy: testUser.id,
        approvedBy: testUser.id,
        paidDate: new Date(),
        branchId: testBranch.id
      }
    })
    console.log('Created test tax record 2:', testTaxRecord2.reference)
    
    // Create test quotations
    const testQuotation1 = await prisma.quotation.create({
      data: {
        quotationNumber: `QUO-${Date.now()}-1`,
        customerId: testUser.id,
        branchId: testBranch.id,
        type: 'SERVICE',
        status: 'SENT',
        issueDate: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        subtotal: 4090.91,
        taxAmount: 409.09,
        totalAmount: 4500.00,
        discountAmount: 500.00,
        currency: 'EGP',
        notes: 'Test quotation #1 for financial system verification',
        createdBy: testUser.id,
        sentAt: new Date(),
        items: {
          create: [
            {
              description: 'حزمة صيانة شاملة',
              quantity: 1,
              unitPrice: 4590.91,
              totalPrice: 4590.91,
              taxRate: 10,
              taxAmount: 459.09,
              discountAmount: 500.00
            }
          ]
        }
      }
    })
    console.log('Created test quotation 1:', testQuotation1.quotationNumber)
    
    // Create test transactions
    const testTransaction1 = await prisma.transaction.create({
      data: {
        amount: 10000.00,
        currency: 'EGP',
        type: 'INCOME',
        category: 'SERVICE_PAYMENT',
        description: 'Payment for invoice #2',
        reference: testInvoice2.invoiceNumber,
        customerId: testUser.id,
        paymentId: testPayment1.id,
        status: 'COMPLETED',
        branchId: testBranch.id,
        processedAt: new Date()
      }
    })
    console.log('Created test transaction 1:', testTransaction1.reference)
    
    const testTransaction2 = await prisma.transaction.create({
      data: {
        amount: 500.00,
        currency: 'EGP',
        type: 'EXPENSE',
        category: 'OPERATIONAL',
        description: 'Office supplies',
        reference: `EXP-${Date.now()}`,
        customerId: testUser.id,
        status: 'COMPLETED',
        branchId: testBranch.id,
        processedAt: new Date()
      }
    })
    console.log('Created test transaction 2:', testTransaction2.reference)
    
    console.log('✅ Financial test data created successfully!')
    
    return {
      user: testUser,
      branch: testBranch,
      serviceType: testServiceType,
      serviceBooking: testServiceBooking,
      invoices: [testInvoice1, testInvoice2, testInvoice3],
      payments: [testPayment1, testPayment2, testPayment3],
      taxRecords: [testTaxRecord1, testTaxRecord2],
      quotations: [testQuotation1],
      transactions: [testTransaction1, testTransaction2]
    }
    
  } catch (error) {
    console.error('❌ Error creating financial test data:', error)
    throw error
  }
}

async function main() {
  try {
    await createFinancialTestData()
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