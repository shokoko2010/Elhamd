import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting database seeding...')

    // Check if user exists
    let adminUser = await prisma.user.findFirst({
      where: { email: 'admin@elhamd.com' }
    })

    if (!adminUser) {
      console.log('Creating admin user...')
      adminUser = await prisma.user.create({
        data: {
          email: 'admin@elhamd.com',
          name: 'Admin User',
          password: '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj6hsxq9w5GS', // password: admin123
          role: 'ADMIN',
          isActive: true,
          emailVerified: true
        }
      })
      console.log('Admin user created:', adminUser.email)
    } else {
      console.log('Admin user already exists:', adminUser.email)
    }

    // Create a branch if not exists
    const mainBranch = await prisma.branch.findFirst({
      where: { code: 'MAIN' }
    })

    if (!mainBranch) {
      console.log('Creating main branch...')
      const branch = await prisma.branch.create({
        data: {
          name: 'الفرع الرئيسي',
          code: 'MAIN',
          address: 'القاهرة، مصر',
          phone: '+20 2 12345678',
          email: 'main@elhamd.com',
          isActive: true,
          openingDate: new Date()
        }
      })
      console.log('Main branch created:', branch.name)
    }

    // Create sample vehicles
    const vehicleCount = await prisma.vehicle.count()
    if (vehicleCount === 0) {
      console.log('Creating sample vehicles...')
      const vehicles = [
        {
          make: 'Tata',
          model: 'Nexon EV',
          year: 2024,
          price: 450000,
          stockNumber: 'TAT-NX-001',
          vin: 'TATNX2024001',
          description: 'سيارة كهربائية عائلية بمواصفات عالية',
          category: 'SUV',
          fuelType: 'ELECTRIC',
          transmission: 'AUTOMATIC',
          mileage: 0,
          color: 'أبيض',
          status: 'AVAILABLE',
          featured: true
        },
        {
          make: 'Tata',
          model: 'Punch',
          year: 2024,
          price: 320000,
          stockNumber: 'TAT-PC-001',
          vin: 'TATPC2024001',
          description: 'سيارة مدمجة عملية مناسبة للمدن',
          category: 'HATCHBACK',
          fuelType: 'PETROL',
          transmission: 'MANUAL',
          mileage: 0,
          color: 'أحمر',
          status: 'AVAILABLE',
          featured: false
        },
        {
          make: 'Tata',
          model: 'Tiago EV',
          year: 2024,
          price: 280000,
          stockNumber: 'TAT-TG-001',
          vin: 'TATTG2024001',
          description: 'سيارة كهربائية صغيرة مثالية للمدينة',
          category: 'HATCHBACK',
          fuelType: 'ELECTRIC',
          transmission: 'AUTOMATIC',
          mileage: 0,
          color: 'أزرق',
          status: 'AVAILABLE',
          featured: true
        }
      ]

      for (const vehicleData of vehicles) {
        const vehicle = await prisma.vehicle.create({
          data: vehicleData
        })
        console.log('Vehicle created:', vehicle.stockNumber)

        // Create vehicle images
        await prisma.vehicleImage.create({
          data: {
            vehicleId: vehicle.id,
            imageUrl: `/uploads/vehicles/${vehicle.stockNumber.toLowerCase()}-1.jpg`,
            altText: `${vehicle.make} ${vehicle.model} - عرض أمامي`,
            isPrimary: true,
            order: 0
          }
        })
      }
    }

    // Create sample marketing campaign
    const campaignCount = await prisma.marketingCampaign.count()
    if (campaignCount === 0) {
      console.log('Creating sample marketing campaign...')
      const campaign = await prisma.marketingCampaign.create({
        data: {
          name: 'حملة السيارات الكهربائية 2024',
          description: 'تسويق السيارات الكهربائية الجديدة من تاتا',
          type: 'EMAIL',
          category: 'PRODUCT_LAUNCH',
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          budget: 50000,
          targetAudience: 'العملاء المهتمون بالسيارات الكهربائية',
          content: 'عرض خاص على السيارات الكهربائية من تاتا',
          channels: ['EMAIL', 'SOCIAL_MEDIA', 'SMS'],
          goals: ['زيادة المبيعات', 'زيادة الوعي بالمنتج'],
          createdBy: adminUser.id
        }
      })
      console.log('Marketing campaign created:', campaign.name)
    }

    // Create sample leads
    const leadCount = await prisma.lead.count()
    if (leadCount === 0) {
      console.log('Creating sample leads...')
      const leads = [
        {
          leadNumber: 'LD-000001',
          firstName: 'أحمد',
          lastName: 'محمد',
          email: 'ahmed.mohammed@email.com',
          phone: '+20 101 234 5678',
          company: 'شركة النقل السريع',
          position: 'مدير المشتريات',
          source: 'WEBSITE',
          status: 'NEW',
          priority: 'HIGH',
          estimatedValue: 450000,
          assignedTo: adminUser.id,
          assignedBy: adminUser.id,
          assignedAt: new Date(),
          notes: 'مهتم جداً بالسيارات الكهربائية'
        },
        {
          leadNumber: 'LD-000002',
          firstName: 'محمد',
          lastName: 'علي',
          email: 'mohamed.ali@email.com',
          phone: '+20 102 345 6789',
          company: 'شركة التوصيل السريع',
          position: 'صاحب الشركة',
          source: 'SOCIAL_MEDIA',
          status: 'CONTACTED',
          priority: 'MEDIUM',
          estimatedValue: 320000,
          assignedTo: adminUser.id,
          assignedBy: adminUser.id,
          assignedAt: new Date(),
          notes: 'يبحث عن سيارة عملية للتوصيل'
        },
        {
          leadNumber: 'LD-000003',
          firstName: 'خالد',
          lastName: 'سالم',
          email: 'khaled.salem@email.com',
          phone: '+20 100 456 7890',
          source: 'REFERRAL',
          status: 'QUALIFIED',
          priority: 'HIGH',
          estimatedValue: 280000,
          assignedTo: adminUser.id,
          assignedBy: adminUser.id,
          assignedAt: new Date(),
          notes: 'عميل محتمل جيد ومهتم بالشراء'
        }
      ]

      for (const leadData of leads) {
        const lead = await prisma.lead.create({
          data: leadData
        })
        console.log('Lead created:', lead.leadNumber)
      }
    }

    // Create sample sales targets
    const targetCount = await prisma.salesTarget.count()
    if (targetCount === 0) {
      console.log('Creating sample sales targets...')
      const targets = [
        {
          name: 'هدف مبيعات السيارات الكهربائية - Q4 2024',
          description: 'بيع 10 سيارات كهربائية خلال الربع الرابع',
          type: 'REVENUE',
          targetValue: 4500000,
          period: 'QUARTERLY',
          startDate: new Date(2024, 9, 1), // October 1, 2024
          endDate: new Date(2024, 11, 31), // December 31, 2024
          assignedTo: adminUser.id,
          assignedType: 'USER',
          status: 'ACTIVE',
          metadata: {
            targetVehicles: 10,
            currentProgress: 3
          }
        },
        {
          name: 'هدف مبيعات السيارات الصغيرة - نوفمبر 2024',
          description: 'بيع 15 سيارة صغيرة خلال نوفمبر',
          type: 'SALES',
          targetValue: 15,
          period: 'MONTHLY',
          startDate: new Date(2024, 10, 1), // November 1, 2024
          endDate: new Date(2024, 10, 30), // November 30, 2024
          assignedTo: adminUser.id,
          assignedType: 'USER',
          status: 'ACTIVE',
          metadata: {
            targetCategory: 'HATCHBACK',
            currentProgress: 5
          }
        }
      ]

      for (const targetData of targets) {
        const target = await prisma.salesTarget.create({
          data: targetData
        })
        console.log('Sales target created:', target.name)
      }
    }

    console.log('Database seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()