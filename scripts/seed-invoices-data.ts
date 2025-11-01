import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting invoices seeding...')

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@elhamd.com' }
    })

    if (!adminUser) {
      throw new Error('Admin user not found')
    }

    // Get main branch
    const mainBranch = await prisma.branch.findFirst({
      where: { code: 'MAIN' }
    })

    if (!mainBranch) {
      throw new Error('Main branch not found')
    }

    // Get vehicles
    const vehicles = await prisma.vehicle.findMany({
      take: 3,
      where: { status: 'AVAILABLE' }
    })

    if (vehicles.length === 0) {
      throw new Error('No vehicles found')
    }

    // Create sample invoices
    const invoiceCount = await prisma.invoice.count()
    if (invoiceCount === 0) {
      console.log('Creating sample invoices...')
      
      const invoices = [
        {
          invoiceNumber: 'INV-2024-001',
          customerId: adminUser.id,
          type: 'PRODUCT',
          status: 'PAID',
          issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
          dueDate: new Date(Date.now() + 25 * 24 * 60 * 60 * 1000), // 25 days from now
          subtotal: 450000,
          taxAmount: 63000,
          totalAmount: 513000,
          paidAmount: 513000,
          currency: 'EGP',
          notes: 'بيع سيارة نيكسيون EV',
          terms: 'شروط الدفع النقدية',
          createdBy: adminUser.id,
          branchId: mainBranch.id
        },
        {
          invoiceNumber: 'INV-2024-002',
          customerId: adminUser.id,
          type: 'PRODUCT',
          status: 'PENDING',
          issueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
          dueDate: new Date(Date.now() + 28 * 24 * 60 * 60 * 1000), // 28 days from now
          subtotal: 320000,
          taxAmount: 44800,
          totalAmount: 364800,
          paidAmount: 0,
          currency: 'EGP',
          notes: 'بيع سيارة بانش',
          terms: 'شروط الدفع خلال 30 يوم',
          createdBy: adminUser.id,
          branchId: mainBranch.id
        },
        {
          invoiceNumber: 'INV-2024-003',
          customerId: adminUser.id,
          type: 'SERVICE',
          status: 'PAID',
          issueDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
          dueDate: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000), // 20 days from now
          subtotal: 15000,
          taxAmount: 2100,
          totalAmount: 17100,
          paidAmount: 17100,
          currency: 'EGP',
          notes: 'صيانة شاملة للسيارة',
          terms: 'الدفع عند الاستلام',
          createdBy: adminUser.id,
          branchId: mainBranch.id
        }
      ]

      for (const invoiceData of invoices) {
        const invoice = await prisma.invoice.create({
          data: invoiceData
        })

        // Create invoice items
        await prisma.invoiceItem.createMany({
          data: [
            {
              invoiceId: invoice.id,
              description: invoice.type === 'SALE' 
                ? `${vehicles[0].make} ${vehicles[0].model} ${vehicles[0].year}`
                : 'خدمة صيانة شاملة',
              quantity: 1,
              unitPrice: invoice.subtotal,
              totalPrice: invoice.subtotal,
              taxRate: 14,
              taxAmount: invoice.taxAmount,
              metadata: {
                vehicleId: invoice.type === 'SALE' ? vehicles[0].id : null
              }
            }
          ]
        })

        // Create invoice tax
        await prisma.invoiceTax.create({
          data: {
            invoiceId: invoice.id,
            taxType: 'VAT',
            rate: 14,
            taxAmount: invoice.taxAmount,
            description: 'ضريبة القيمة المضافة'
          }
        })

        console.log('Invoice created:', invoice.invoiceNumber)
      }
    }

    console.log('Invoices seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding invoices:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()