const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function fixVehicleImages() {
  try {
    // Get all vehicles with their images
    const vehicles = await prisma.vehicle.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' }
        }
      }
    });
    
    console.log(`Processing ${vehicles.length} vehicles...`);
    
    for (const vehicle of vehicles) {
      console.log(`\nProcessing: ${vehicle.make} ${vehicle.model} (${vehicle.stockNumber})`);
      
      // Delete duplicate images
      if (vehicle.images.length > 0) {
        const uniqueImages = [];
        const seenUrls = new Set();
        
        for (const image of vehicle.images) {
          if (!seenUrls.has(image.imageUrl)) {
            seenUrls.add(image.imageUrl);
            uniqueImages.push(image);
          } else {
            console.log(`  Deleting duplicate image: ${image.imageUrl}`);
            await prisma.vehicleImage.delete({
              where: { id: image.id }
            });
          }
        }
        
        // Update primary image (first one)
        if (uniqueImages.length > 0) {
          await prisma.vehicleImage.update({
            where: { id: uniqueImages[0].id },
            data: { isPrimary: true }
          });
          
          // Set others as non-primary
          for (let i = 1; i < uniqueImages.length; i++) {
            await prisma.vehicleImage.update({
              where: { id: uniqueImages[i].id },
              data: { isPrimary: false }
            });
          }
        }
      }
      
      // Add images for vehicles that don't have any
      if (vehicle.images.length === 0) {
        console.log(`  Adding images for ${vehicle.make} ${vehicle.model}`);
        
        const baseName = vehicle.model.toLowerCase();
        const imagePaths = [
          `/uploads/vehicles/${vehicle.id}/${baseName}-front.jpg`,
          `/uploads/vehicles/${vehicle.id}/${baseName}-side.jpg`
        ];
        
        for (let i = 0; i < imagePaths.length; i++) {
          await prisma.vehicleImage.create({
            data: {
              vehicleId: vehicle.id,
              imageUrl: imagePaths[i],
              altText: `${vehicle.make} ${vehicle.model} - ${i === 0 ? 'الأمام' : 'الجانب'}`,
              isPrimary: i === 0,
              order: i
            }
          });
        }
      }
    }
    
    console.log('\n✅ Vehicle images fixed successfully!');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

fixVehicleImages();