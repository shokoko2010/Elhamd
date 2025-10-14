const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function seedInvoices() {
  try {
    // Create or get a user (customer)
    let user = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    })
    if (!user) {
      user = await prisma.user.create({
        data: {
          email: 'customer@example.com',
          name: 'أحمد محمد',
          phone: '01234567890',
          role: 'CUSTOMER',
          isActive: true,
          emailVerified: true
        }
      })
    }

    // Create sample invoices
    const invoices = [
      {
        invoiceNumber: 'INV-2024-001',
        type: 'SERVICE',
        status: 'PAID',
        issueDate: new Date('2024-01-15'),
        dueDate: new Date('2024-01-30'),
        subtotal: 5000,
        taxAmount: 700,
        totalAmount: 5700,
        paidAmount: 5700,
        currency: 'EGP',
        notes: 'صيانة دورية للسيارة',
        terms: 'الدفع عند الاستلام',
        createdBy: 'admin',
        items: {
          create: [
            {
              description: 'تغيير زيت المحرك',
              quantity: 1,
              unitPrice: 500,
              totalPrice: 500,
              taxRate: 14,
              taxAmount: 70
            },
            {
              description: 'استبدال فلاتر الهواء',
              quantity: 2,
              unitPrice: 200,
              totalPrice: 400,
              taxRate: 14,
              taxAmount: 56
            },
            {
              description: 'فحص شامل للسيارة',
              quantity: 1,
              unitPrice: 4100,
              totalPrice: 4100,
              taxRate: 14,
              taxAmount: 574
            }
          ]
        }
      },
      {
        invoiceNumber: 'INV-2024-002',
        type: 'SERVICE',
        status: 'SENT',
        issueDate: new Date('2024-02-01'),
        dueDate: new Date('2024-02-15'),
        subtotal: 3000,
        taxAmount: 420,
        totalAmount: 3420,
        paidAmount: 0,
        currency: 'EGP',
        notes: 'إصلاح نظام المكابح',
        terms: 'الدفع خلال 14 يوم',
        createdBy: 'admin',
        items: {
          create: [
            {
              description: 'تغيير بطانات المكابح الأمامية',
              quantity: 2,
              unitPrice: 800,
              totalPrice: 1600,
              taxRate: 14,
              taxAmount: 224
            },
            {
              description: 'تغيير زيت الفرامل',
              quantity: 1,
              unitPrice: 300,
              totalPrice: 300,
              taxRate: 14,
              taxAmount: 42
            },
            {
              description: 'فحص نظام الفرامل',
              quantity: 1,
              unitPrice: 1100,
              totalPrice: 1100,
              taxRate: 14,
              taxAmount: 154
            }
          ]
        }
      },
      {
        invoiceNumber: 'INV-2024-003',
        type: 'PRODUCT',
        status: 'OVERDUE',
        issueDate: new Date('2024-01-01'),
        dueDate: new Date('2024-01-15'),
        subtotal: 15000,
        taxAmount: 2100,
        totalAmount: 17100,
        paidAmount: 8000,
        currency: 'EGP',
        notes: 'بيع قطع غيار',
        terms: 'الدفع عند الاستلام',
        createdBy: 'admin',
        items: {
          create: [
            {
              description: 'إطارات جديدة (4 قطع)',
              quantity: 4,
              unitPrice: 2500,
              totalPrice: 10000,
              taxRate: 14,
              taxAmount: 1400
            },
            {
              description: 'بطارية سيارة',
              quantity: 1,
              unitPrice: 5000,
              totalPrice: 5000,
              taxRate: 14,
              taxAmount: 700
            }
          ]
        }
      }
    ]

    for (const invoiceData of invoices) {
      await prisma.invoice.create({
        data: {
          ...invoiceData,
          customerId: user.id
        }
      })
    }

    console.log('Sample invoices created successfully')
  } catch (error) {
    console.error('Error creating sample invoices:', error)
  } finally {
    await prisma.$disconnect()
  }
}

seedInvoices()