import { db } from './src/lib/db'

async function seedPayments() {
  try {
    // First get some service bookings to create payments for
    const bookings = await db.serviceBooking.findMany({
      take: 3,
      include: {
        customer: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (bookings.length === 0) {
      console.log('No service bookings found. Creating sample bookings first...')
      
      // Create sample service bookings
      const serviceTypes = await db.serviceType.findMany({
        take: 2,
        select: { id: true, name: true, price: true }
      })

      if (serviceTypes.length === 0) {
        console.log('No service types found. Please create service types first.')
        return
      }

      const users = await db.user.findMany({
        take: 2,
        select: { id: true, name: true }
      })

      if (users.length === 0) {
        console.log('No users found. Please create users first.')
        return
      }

      const sampleBookings = await Promise.all([
        db.serviceBooking.create({
          data: {
            customerId: users[0].id,
            serviceTypeId: serviceTypes[0].id,
            date: new Date('2024-01-15'),
            timeSlot: '10:00-11:00',
            status: 'COMPLETED',
            totalPrice: serviceTypes[0].price || 500,
            paymentStatus: 'PAID'
          }
        }),
        db.serviceBooking.create({
          data: {
            customerId: users[1].id,
            serviceTypeId: serviceTypes[1].id,
            date: new Date('2024-01-20'),
            timeSlot: '14:00-15:00',
            status: 'COMPLETED',
            totalPrice: serviceTypes[1].price || 300,
            paymentStatus: 'PAID'
          }
        })
      ])

      bookings.push(...sampleBookings)
    }

    console.log('Found bookings:', bookings)

    // Create sample payments
    const samplePayments = [
      {
        bookingId: bookings[0]?.id,
        bookingType: 'SERVICE' as const,
        amount: 500.00,
        currency: 'EGP',
        status: 'COMPLETED' as const,
        paymentMethod: 'CREDIT_CARD' as const,
        transactionId: 'TXN-001',
        notes: 'دفع ببطاقة الائتمان'
      },
      {
        bookingId: bookings[1]?.id,
        bookingType: 'SERVICE' as const,
        amount: 300.00,
        currency: 'EGP',
        status: 'COMPLETED' as const,
        paymentMethod: 'CASH' as const,
        transactionId: 'TXN-002',
        notes: 'دفع نقداً'
      },
      {
        bookingId: bookings[0]?.id,
        bookingType: 'SERVICE' as const,
        amount: 150.00,
        currency: 'EGP',
        status: 'PENDING' as const,
        paymentMethod: 'BANK_TRANSFER' as const,
        transactionId: 'TXN-003',
        notes: 'تحويل بنكي قيد المعالجة'
      }
    ]

    // Create payments
    for (const paymentData of samplePayments) {
      if (paymentData.bookingId) {
        const payment = await db.payment.create({
          data: paymentData,
          include: {
            serviceBooking: {
              select: {
                customer: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            }
          }
        })
        console.log('Created payment:', payment.transactionId)
      }
    }

    console.log('Sample payments created successfully!')
    
    // List all payments
    const allPayments = await db.payment.findMany({
      include: {
        serviceBooking: {
          select: {
            customer: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }
      }
    })
    
    console.log(`Total payments in database: ${allPayments.length}`)
    allPayments.forEach(payment => {
      console.log(`- ${payment.transactionId}: ${payment.amount} ${payment.currency} - ${payment.status} - ${payment.serviceBooking?.customer?.name}`)
    })

  } catch (error) {
    console.error('Error seeding payments:', error)
  } finally {
    await db.$disconnect()
  }
}

seedPayments()