const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function createTestVehicles() {
  try {
    console.log('🚗 Creating test vehicles...');

    // Create a simple vehicle without complex relations
    const vehicle = await prisma.vehicle.create({
      data: {
        make: 'TATA',
        model: 'Nexon',
        year: 2024,
        price: 450000,
        stockNumber: 'TNX-2024-001',
        vin: 'MAT62543798765432',
        description: 'سيارة SUV عائلية عصرية مع ميزات أمان متقدمة وتصميم رياضي أنيق',
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أبيض',
        status: 'AVAILABLE',
        featured: true,
      }
    });

    console.log('✅ Vehicle created:', vehicle);

    // Create vehicle images
    await prisma.vehicleImage.createMany({
      data: [
        {
          vehicleId: vehicle.id,
          imageUrl: '/uploads/vehicles/1/nexon-front.jpg',
          altText: 'TATA Nexon - Front View',
          isPrimary: true,
          order: 0,
        },
        {
          vehicleId: vehicle.id,
          imageUrl: '/uploads/vehicles/1/nexon-side.jpg',
          altText: 'TATA Nexon - Side View',
          isPrimary: false,
          order: 1,
        },
        {
          vehicleId: vehicle.id,
          imageUrl: '/uploads/vehicles/1/nexon-front-new.jpg',
          altText: 'TATA Nexon - New Front View',
          isPrimary: false,
          order: 2,
        }
      ]
    });

    console.log('✅ Vehicle images created');

    // Create another vehicle
    const vehicle2 = await prisma.vehicle.create({
      data: {
        make: 'TATA',
        model: 'Punch',
        year: 2024,
        price: 320000,
        stockNumber: 'TPU-2024-002',
        vin: 'MAT62543798765433',
        description: 'سيارة SUV مدمجة مثالية للقيادة في المدينة بتصميم شبابي',
        category: 'SUV',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'أحمر',
        status: 'AVAILABLE',
        featured: true,
      }
    });

    console.log('✅ Second vehicle created:', vehicle2);

    // Create images for second vehicle
    await prisma.vehicleImage.createMany({
      data: [
        {
          vehicleId: vehicle2.id,
          imageUrl: '/uploads/vehicles/2/punch-front.jpg',
          altText: 'TATA Punch - Front View',
          isPrimary: true,
          order: 0,
        },
        {
          vehicleId: vehicle2.id,
          imageUrl: '/uploads/vehicles/2/punch-front-new.jpg',
          altText: 'TATA Punch - New Front View',
          isPrimary: false,
          order: 1,
        }
      ]
    });

    console.log('✅ Second vehicle images created');

    // Create a third vehicle
    const vehicle3 = await prisma.vehicle.create({
      data: {
        make: 'TATA',
        model: 'Tiago',
        year: 2024,
        price: 280000,
        stockNumber: 'TTI-2024-003',
        vin: 'MAT62543798765434',
        description: 'سيارة هاتشباك عملية ومثالية للاستخدام اليومي',
        category: 'HATCHBACK',
        fuelType: 'PETROL',
        transmission: 'MANUAL',
        mileage: 0,
        color: 'رمادي',
        status: 'AVAILABLE',
        featured: false,
      }
    });

    console.log('✅ Third vehicle created:', vehicle3);

    // Create images for third vehicle
    await prisma.vehicleImage.createMany({
      data: [
        {
          vehicleId: vehicle3.id,
          imageUrl: '/uploads/vehicles/3/tiago-front.jpg',
          altText: 'TATA Tiago - Front View',
          isPrimary: true,
          order: 0,
        },
        {
          vehicleId: vehicle3.id,
          imageUrl: '/uploads/vehicles/3/tiago-front-new.jpg',
          altText: 'TATA Tiago - New Front View',
          isPrimary: false,
          order: 1,
        }
      ]
    });

    console.log('✅ Third vehicle images created');

    console.log('🎉 All test vehicles created successfully!');

  } catch (error) {
    console.error('❌ Error creating vehicles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestVehicles();