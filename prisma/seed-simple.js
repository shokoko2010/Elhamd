const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create admin user
  const adminUser = await prisma.user.upsert({
    where: { email: 'admin@elhamd.com' },
    update: {},
    create: {
      email: 'admin@elhamd.com',
      name: 'Admin User',
      password: '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.Gm.F5e', // password: admin123
      role: 'ADMIN',
      isActive: true,
      emailVerified: true,
    },
  });

  console.log('Created admin user:', adminUser.email);

  // Create company info
  const companyInfo = await prisma.companyInfo.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      title: 'الحمد للسيارات',
      subtitle: 'الوكيل الرسمي لسيارات تاتا في مصر',
      description: 'نقدم أحدث سيارات تاتا بأفضل الأسعار والضمانات المعتمدة من المصنع',
      features: [
        'وكيل معتمد من تاتا موتورز',
        'ضمان المصنعية الكاملة',
        'خدمة صيانة على مدار الساعة',
        'أفضل الأسعار في السوق المصري'
      ],
      ctaButtons: [
        { text: 'استعرض السيارات', link: '/vehicles', variant: 'primary' },
        { text: 'قيادة تجريبية', link: '/test-drive', variant: 'secondary' }
      ],
      imageUrl: '/uploads/showroom-luxury.jpg',
    },
  });

  console.log('Created company info');

  // Create a sample vehicle
  const vehicle = await prisma.vehicle.upsert({
    where: { stockNumber: 'NEXON001' },
    update: {},
    create: {
      make: 'Tata',
      model: 'Nexon EV',
      year: 2024,
      price: 650000,
      stockNumber: 'NEXON001',
      vin: 'MAT64567891011234',
      description: 'أحدث سيارة SUV كهربائية من تاتا بمدى 312 كم للشحنة الواحدة',
      category: 'SUV',
      fuelType: 'ELECTRIC',
      transmission: 'AUTOMATIC',
      mileage: 0,
      color: 'أبيض',
      status: 'AVAILABLE',
      featured: true,
      images: {
        create: [
          {
            imageUrl: '/uploads/vehicles/nxz2024001/nexon-ev-front.jpg',
            altText: 'Tata Nexon EV Front View',
            isPrimary: true,
            order: 0,
          },
        ],
      },
      pricing: {
        create: {
          basePrice: 650000,
          totalPrice: 650000,
          currency: 'EGP',
        },
      },
    },
  });

  console.log('Created sample vehicle:', vehicle.stockNumber);

  // Create contact info
  const contactInfo = await prisma.contactInfo.upsert({
    where: { id: 'main' },
    update: {},
    create: {
      id: 'main',
      primaryPhone: '+20 2 12345678',
      primaryEmail: 'info@elhamd.com',
      address: 'شارع الرئيسي، القاهرة، مصر',
      workingHours: '{"days": "الأحد - الخميس", "hours": "9 صباحاً - 8 مساءً"}',
      mapLat: 30.0444,
      mapLng: 31.2357,
    },
  });

  console.log('Created contact info');

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });