const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkVehicles() {
  try {
    console.log('🔍 Checking vehicles in database...');

    const vehicles = await prisma.vehicle.findMany({
      include: {
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      },
      take: 10
    });

    console.log(`Found ${vehicles.length} vehicles:`);
    
    vehicles.forEach((vehicle, index) => {
      console.log(`\n${index + 1}. ${vehicle.make} ${vehicle.model} (${vehicle.year})`);
      console.log(`   Stock: ${vehicle.stockNumber}`);
      console.log(`   Price: EGP ${vehicle.price.toLocaleString()}`);
      console.log(`   Featured: ${vehicle.featured}`);
      console.log(`   Status: ${vehicle.status}`);
      console.log(`   Images: ${vehicle.images.length}`);
      
      vehicle.images.forEach((image, imgIndex) => {
        console.log(`     ${imgIndex + 1}. ${image.imageUrl} (Primary: ${image.isPrimary})`);
      });
    });

    // Check featured vehicles specifically
    const featuredVehicles = await prisma.vehicle.findMany({
      where: {
        featured: true,
        status: 'AVAILABLE'
      },
      include: {
        images: {
          orderBy: {
            order: 'asc'
          }
        }
      }
    });

    console.log(`\n🌟 Found ${featuredVehicles.length} featured vehicles:`);
    
    featuredVehicles.forEach((vehicle, index) => {
      console.log(`\n${index + 1}. ${vehicle.make} ${vehicle.model} (${vehicle.year})`);
      console.log(`   Images: ${vehicle.images.length}`);
    });

  } catch (error) {
    console.error('❌ Error checking vehicles:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkVehicles();