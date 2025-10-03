const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVehicles() {
  try {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        images: true
      }
    });
    
    console.log(`Found ${vehicles.length} vehicles:`);
    vehicles.forEach(v => {
      console.log(`- ${v.make} ${v.model} (${v.year}) - ${v.images.length} images`);
      if (v.images.length > 0) {
        v.images.forEach(img => {
          console.log(`  Image: ${img.imageUrl}`);
        });
      }
    });
    
    // Check if we need to create sample vehicles
    if (vehicles.length === 0) {
      console.log('No vehicles found. Creating sample vehicles...');
      
      const sampleVehicles = [
        {
          make: 'Tata',
          model: 'Nexon',
          year: 2024,
          price: 350000,
          stockNumber: 'NEX-001',
          description: 'سيارة SUV عائلية عصرية مع مساحة واسعة وميزات متقدمة',
          category: 'SUV',
          fuelType: 'PETROL',
          transmission: 'MANUAL',
          mileage: 0,
          color: 'أبيض',
          status: 'AVAILABLE',
          featured: true,
          isActive: true
        },
        {
          make: 'Tata',
          model: 'Punch',
          year: 2024,
          price: 280000,
          stockNumber: 'PUN-001',
          description: 'سيارة مدمجة عصرية مثالية للمدينة',
          category: 'SUV',
          fuelType: 'PETROL',
          transmission: 'MANUAL',
          mileage: 0,
          color: 'أحمر',
          status: 'AVAILABLE',
          featured: true,
          isActive: true
        },
        {
          make: 'Tata',
          model: 'Tiago',
          year: 2024,
          price: 220000,
          stockNumber: 'TIA-001',
          description: 'سيارة هاتشباك اقتصادية وموفرة للوقود',
          category: 'HATCHBACK',
          fuelType: 'PETROL',
          transmission: 'MANUAL',
          mileage: 0,
          color: 'أزرق',
          status: 'AVAILABLE',
          featured: false,
          isActive: true
        }
      ];
      
      for (const vehicleData of sampleVehicles) {
        const vehicle = await prisma.vehicle.create({
          data: {
            ...vehicleData,
            pricing: {
              create: {
                basePrice: vehicleData.price,
                discountPrice: null,
                discountPercentage: null,
                taxes: 0,
                fees: 0,
                totalPrice: vehicleData.price,
                currency: 'EGP',
                hasDiscount: false,
                discountExpires: null
              }
            },
            images: {
              create: [
                {
                  imageUrl: `/uploads/vehicles/${vehicleData.stockNumber.split('-')[0].toLowerCase()}-front.jpg`,
                  altText: `${vehicleData.make} ${vehicleData.model} - الأمام`,
                  isPrimary: true,
                  order: 0
                },
                {
                  imageUrl: `/uploads/vehicles/${vehicleData.stockNumber.split('-')[0].toLowerCase()}-side.jpg`,
                  altText: `${vehicleData.make} ${vehicleData.model} - الجانب`,
                  isPrimary: false,
                  order: 1
                }
              ]
            }
          }
        });
        console.log(`Created vehicle: ${vehicle.make} ${vehicle.model}`);
      }
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVehicles();