const { PrismaClient } = require('@prisma/client');

// Use the DATABASE_URL from environment
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL || 'postgres://bd6a6a5bc661f911ad736bbbfa4e5391914456d456e391e3519691dc7bd9b356:sk_U3Tdoy56oriIPnpsjHGTR@db.prisma.io:5432/postgres?sslmode=require'
    }
  }
});

async function checkProductionData() {
  try {
    console.log('🔍 Checking production database...\n');
    
    // Check vehicles
    const vehicles = await prisma.vehicle.findMany({
      include: {
        images: {
          orderBy: { order: 'asc' }
        },
        pricing: true
      },
      take: 10
    });
    
    console.log(`📊 Found ${vehicles.length} vehicles:`);
    vehicles.forEach(v => {
      console.log(`- ${v.make} ${v.model} (${v.year}) - ${v.images.length} images - Featured: ${v.featured}`);
      if (v.images.length > 0) {
        v.images.forEach(img => {
          console.log(`  📸 ${img.isPrimary ? '[PRIMARY]' : ''} ${img.imageUrl}`);
        });
      }
    });
    
    // Check calendar events
    const events = await prisma.calendarEvent.findMany({
      take: 10,
      orderBy: { startTime: 'asc' }
    });
    
    console.log(`\n📅 Found ${events.length} calendar events:`);
    events.forEach(e => {
      console.log(`- ${e.title} (${e.type}) - ${e.startTime}`);
    });
    
    // Check time slots
    const timeSlots = await prisma.timeSlot.findMany({
      take: 10
    });
    
    console.log(`\n⏰ Found ${timeSlots.length} time slots:`);
    timeSlots.forEach(slot => {
      console.log(`- Day ${slot.dayOfWeek}: ${slot.startTime} - ${slot.endTime} (Max: ${slot.maxBookings})`);
    });
    
    // Check holidays
    const holidays = await prisma.holiday.findMany({
      take: 10
    });
    
    console.log(`\n🎉 Found ${holidays.length} holidays:`);
    holidays.forEach(h => {
      console.log(`- ${h.name} - ${h.date}`);
    });
    
    // Check if we need to create sample data
    if (vehicles.length === 0) {
      console.log('\n⚠️ No vehicles found. Creating sample vehicles...');
      
      const sampleVehicles = [
        {
          make: 'Tata',
          model: 'Nexon',
          year: 2024,
          price: 350000,
          stockNumber: 'TNX2024001',
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
          stockNumber: 'TPC2024001',
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
          stockNumber: 'TTG2024001',
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
                  imageUrl: `/uploads/vehicles/${vehicleData.stockNumber.toLowerCase()}-front.jpg`,
                  altText: `${vehicleData.make} ${vehicleData.model} - الأمام`,
                  isPrimary: true,
                  order: 0
                },
                {
                  imageUrl: `/uploads/vehicles/${vehicleData.stockNumber.toLowerCase()}-side.jpg`,
                  altText: `${vehicleData.make} ${vehicleData.model} - الجانب`,
                  isPrimary: false,
                  order: 1
                }
              ]
            }
          }
        });
        console.log(`✅ Created vehicle: ${vehicle.make} ${vehicle.model}`);
      }
    }
    
    if (events.length === 0) {
      console.log('\n⚠️ No calendar events found. Creating sample events...');
      
      const sampleEvents = [
        {
          title: 'حجز اختبار قيادة - Tata Nexon',
          description: 'عميل مهتم بتجربة Tata Nexon',
          startTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000 + 60 * 60 * 1000),
          type: 'APPOINTMENT',
          status: 'SCHEDULED',
          location: 'المعرض الرئيسي',
          attendees: [],
          notes: 'عميل جديد، يفضل التجربة في الصباح'
        },
        {
          title: 'صيانة دورية - Tata Punch',
          description: 'صيانة دورية بعد 10000 كم',
          startTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          endTime: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000),
          type: 'TASK_DEADLINE',
          status: 'SCHEDULED',
          location: 'ورشة الصيانة',
          attendees: [],
          notes: 'تغيير زيت وفلتر'
        }
      ];
      
      for (const eventData of sampleEvents) {
        const event = await prisma.calendarEvent.create({
          data: eventData
        });
        console.log(`✅ Created event: ${event.title}`);
      }
    }
    
    if (timeSlots.length === 0) {
      console.log('\n⚠️ No time slots found. Creating sample time slots...');
      
      const timeSlotsData = [
        { dayOfWeek: 1, startTime: '09:00', endTime: '10:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 1, startTime: '10:00', endTime: '11:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 1, startTime: '11:00', endTime: '12:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 2, startTime: '09:00', endTime: '10:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 2, startTime: '10:00', endTime: '11:00', maxBookings: 3, isActive: true },
        { dayOfWeek: 2, startTime: '11:00', endTime: '12:00', maxBookings: 3, isActive: true },
      ];
      
      for (const slotData of timeSlotsData) {
        const slot = await prisma.timeSlot.create({
          data: slotData
        });
        console.log(`✅ Created time slot: Day ${slot.dayOfWeek} ${slot.startTime}-${slot.endTime}`);
      }
    }
    
    console.log('\n✅ Production database check completed!');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkProductionData();