import { db } from '@/lib/db'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkFinancialTables() {
  try {
    console.log('Checking database connection...')
    
    // Check if tables exist
    const tables = await prisma.$queryRaw`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name;`
    console.log('Available tables:', tables)
    
    // Check for financial tables specifically
    const financialTables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND (
        table_name LIKE '%invoice%' OR 
        table_name LIKE '%payment%' OR 
        table_name LIKE '%tax%' OR 
        table_name LIKE '%transaction%' OR
        table_name LIKE '%quotation%' OR
        table_name LIKE '%journal%'
      )
      ORDER BY table_name;
    `
    console.log('Financial tables:', financialTables)
    
    // Check if we can create financial records
    console.log('Creating test financial data...')
    
    // Create test invoices
    const testInvoice = await prisma.invoice.create({
      data: {
        invoiceNumber: `INV-${Date.now()}`,
        customerId: 'admin-user-id',
        type: 'SERVICE',
        status: 'SENT',
        issueDate: new Date(),
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        totalAmount: 5000,
        taxAmount: 500,
        discountAmount: 0,
        paidAmount: 0,
        currency: 'EGP',
        notes: 'Test invoice for financial system verification',
        items: {
          create: [
            {
              description: 'خدمة صيانة دورية',
              quantity: 1,
              unitPrice: 5000,
              totalPrice: 5000,
              taxRate: 10,
              taxAmount: 500
            }
          ]
        }
      }
    })
    console.log('Created test invoice:', testInvoice)
    
    // Create test payment
    const testPayment = await prisma.payment.create({
      data: {
        amount: 2500,
        currency: 'EGP',
        method: 'BANK_TRANSFER',
        status: 'COMPLETED',
        transactionId: `TXN-${Date.now()}`,
        customerId: 'admin-user-id',
        invoiceId: testInvoice.id,
        gateway: 'bank-transfer',
        gatewayTransactionId: `BANK-${Date.now()}`,
        notes: 'Test payment for financial system verification'
      }
    })
    console.log('Created test payment:', testPayment)
    
    // Create test tax record
    const testTaxRecord = await prisma.taxRecord.create({
      data: {
        type: 'VAT',
        period: '2024-01',
        amount: 500,
        dueDate: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000), // 15 days from now
        status: 'PENDING',
        reference: `TAX-${Date.now()}`,
        notes: 'Test tax record for financial system verification',
        creatorId: 'admin-user-id'
      }
    })
    console.log('Created test tax record:', testTaxRecord)
    
    // Create test quotation
    const testQuotation = await prisma.quotation.create({
      data: {
        quotationNumber: `QUO-${Date.now()}`,
        customerId: 'admin-user-id',
        type: 'SERVICE',
        status: 'SENT',
        issueDate: new Date(),
        validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
        totalAmount: 4500,
        taxAmount: 450,
        discountAmount: 500,
        currency: 'EGP',
        notes: 'Test quotation for financial system verification',
        items: {
          create: [
            {
              description: 'خدمة صيانة دورية',
              quantity: 1,
              unitPrice: 5000,
              totalPrice: 5000,
              taxRate: 10,
              taxAmount: 500,
              discountAmount: 500
            }
          ]
        }
      }
    })
    console.log('Created test quotation:', testQuotation)
    
    // Create test transaction
    const testTransaction = await prisma.transaction.create({
      data: {
        amount: 2500,
        currency: 'EGP',
        type: 'INCOME',
        category: 'SERVICE_PAYMENT',
        description: 'Test transaction for financial system verification',
        reference: `TXN-${Date.now()}`,
        customerId: 'admin-user-id',
        paymentId: testPayment.id,
        status: 'COMPLETED'
      }
    })
    console.log('Created test transaction:', testTransaction)
    
    console.log('✅ Financial test data created successfully!')
    
    return {
      invoice: testInvoice,
      payment: testPayment,
      taxRecord: testTaxRecord,
      quotation: testQuotation,
      transaction: testTransaction
    }
    
  } catch (error) {
    console.error('❌ Error creating financial test data:', error)
    throw error
  }
}

async function main() {
  try {
    await checkFinancialTables()
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