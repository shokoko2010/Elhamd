const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createSampleBookings() {
  try {
    // Get a customer user
    const customer = await prisma.user.findFirst({
      where: { role: 'CUSTOMER' }
    });
    
    if (!customer) {
      console.log('No customer found. Skipping sample bookings.');
      return;
    }
    
    // Get vehicles
    const vehicles = await prisma.vehicle.findMany({
      take: 3
    });
    
    // Get service types
    const serviceTypes = await prisma.serviceType.findMany({
      take: 2
    });
    
    // Create sample test drive bookings
    for (let i = 0; i < vehicles.length; i++) {
      const vehicle = vehicles[i];
      const date = new Date();
      date.setDate(date.getDate() + i + 1); // Bookings in the next few days
      
      const existingBooking = await prisma.testDriveBooking.findFirst({
        where: {
          customerId: customer.id,
          vehicleId: vehicle.id,
          date: date
        }
      });
      
      if (!existingBooking) {
        await prisma.testDriveBooking.create({
          data: {
            customerId: customer.id,
            vehicleId: vehicle.id,
            date: date,
            timeSlot: '10:00',
            status: 'CONFIRMED',
            notes: `عميل مهتم بتجربة ${vehicle.make} ${vehicle.model}`
          }
        });
        console.log(`Created test drive booking for ${vehicle.make} ${vehicle.model}`);
      }
    }
    
    // Create sample service bookings
    for (let i = 0; i < serviceTypes.length; i++) {
      const serviceType = serviceTypes[i];
      const date = new Date();
      date.setDate(date.getDate() + i + 3); // Bookings in the next few days
      
      const existingBooking = await prisma.serviceBooking.findFirst({
        where: {
          customerId: customer.id,
          serviceTypeId: serviceType.id,
          date: date
        }
      });
      
      if (!existingBooking) {
        await prisma.serviceBooking.create({
          data: {
            customerId: customer.id,
            vehicleId: vehicles[0].id, // Use first vehicle
            serviceTypeId: serviceType.id,
            date: date,
            timeSlot: '11:00',
            status: 'PENDING',
            notes: `حجز ${serviceType.name} للسيارة ${vehicles[0].make} ${vehicles[0].model}`,
            totalPrice: serviceType.price || 0
          }
        });
        console.log(`Created service booking for ${serviceType.name}`);
      }
    }
    
    console.log('\n✅ Sample bookings created successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createSampleBookings();