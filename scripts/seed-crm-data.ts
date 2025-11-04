import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🤝 Starting CRM data seed...')

  try {
    // Get existing users and branches
    const users = await prisma.user.findMany({
      where: { role: 'CUSTOMER' }
    })
    
    const branches = await prisma.branch.findMany()
    const staffUsers = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'ADMIN', 'BRANCH_MANAGER'] } }
    })

    if (users.length === 0) {
      console.log('No customer users found. Creating sample customers first...')
      
      // Create sample customer users
      const sampleCustomers = [
        {
          email: 'customer1@example.com',
          name: 'أحمد محمد علي',
          password: await bcrypt.hash('password123', 10),
          role: 'CUSTOMER',
          phone: '+20 1012345678',
          isActive: true,
          emailVerified: true,
          branchId: branches[0]?.id
        },
        {
          email: 'customer2@example.com',
          name: 'محمد عبدالله السيد',
          password: await bcrypt.hash('password123', 10),
          role: 'CUSTOMER',
          phone: '+20 1023456789',
          isActive: true,
          emailVerified: true,
          branchId: branches[0]?.id
        },
        {
          email: 'customer3@example.com',
          name: 'خالد أحمد عمر',
          password: await bcrypt.hash('password123', 10),
          role: 'CUSTOMER',
          phone: '+20 1034567890',
          isActive: true,
          emailVerified: true,
          branchId: branches[0]?.id
        }
      ]

      for (const customer of sampleCustomers) {
        await prisma.user.create({ data: customer })
      }

      const updatedUsers = await prisma.user.findMany({
        where: { role: 'CUSTOMER' }
      })
      users.push(...updatedUsers)
    }

    // 1. Customer Profiles
    console.log('Creating Customer Profiles...')
    
    for (const user of users) {
      const existingProfile = await prisma.customerProfile.findUnique({
        where: { userId: user.id }
      })

      if (!existingProfile) {
        await prisma.customerProfile.create({
          data: {
            userId: user.id,
            segment: 'CUSTOMER',
            leadSource: 'WEBSITE',
            leadValue: 300000,
            lifetimeValue: 450000,
            lastContactDate: new Date(),
            nextFollowUp: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days from now
            preferences: {
              contactMethod: 'EMAIL',
              language: 'AR',
              interests: ['سيارات', 'تكنولوجيا', 'سفر'],
              communicationFrequency: 'weekly'
            },
            tags: ['عميل مهتم', 'سيارات عائلية'],
            notes: 'عميل مهتم بالسيارات العائلية، يفضل التواصل عبر البريد الإلكتروني',
            riskScore: 2,
            satisfactionScore: 4.5,
            referralCount: 0,
            totalPurchases: 1,
            totalSpent: 280000,
            isActive: true
          }
        })
      }
    }
    console.log('✓ Customer Profiles created')

    // 2. Leads
    console.log('Creating Leads...')
    
    const leads = [
      {
        leadNumber: 'LEAD-2024-001',
        firstName: 'سارة',
        lastName: 'أحمد محمد',
        email: 'sara.ahmed@example.com',
        phone: '+20 1045678901',
        company: null,
        position: null,
        source: 'WEBSITE',
        status: 'NEW',
        priority: 'HIGH',
        estimatedValue: 450000,
        assignedToId: staffUsers[0]?.id,
        branchId: branches[0]?.id,
        notes: 'مهتمة بسيارة تاتا نكسون كهربائية',
        tags: ['نكسون', 'كهربائي', 'عائلي']
      },
      {
        leadNumber: 'LEAD-2024-002',
        firstName: 'محمود',
        lastName: 'حسن علي',
        email: 'mahmoud.hassan@example.com',
        phone: '+20 1056789012',
        company: 'شركة النقل السريع',
        position: 'مدير الأسطول',
        source: 'REFERRAL',
        status: 'CONTACTED',
        priority: 'MEDIUM',
        estimatedValue: 1200000,
        assignedToId: staffUsers[1]?.id,
        branchId: branches[0]?.id,
        notes: 'يبحث عن أسطول سيارات بيك أب للشركة',
        tags: ['بيك أب', 'أسطول', 'شركات']
      },
      {
        leadNumber: 'LEAD-2024-003',
        firstName: 'فاطمة',
        lastName: 'عبدالرحمن',
        email: 'fatima.abdel@example.com',
        phone: '+20 1067890123',
        company: null,
        position: null,
        source: 'SOCIAL_MEDIA',
        status: 'QUALIFIED',
        priority: 'LOW',
        estimatedValue: 280000,
        assignedToId: staffUsers[0]?.id,
        branchId: branches[0]?.id,
        notes: 'مهتمة بسيارة تاتا بانش صغيرة',
        tags: ['بانش', 'صغيرة', 'شخصي']
      },
      {
        leadNumber: 'LEAD-2024-004',
        firstName: 'عمر',
        lastName: 'خالد أحمد',
        email: 'omar.khaled@example.com',
        phone: '+20 1078901234',
        company: 'مؤسسة التوصيل السريع',
        position: 'صاحب المؤسسة',
        source: 'COLD_CALL',
        status: 'PROPOSAL',
        priority: 'HIGH',
        estimatedValue: 800000,
        assignedToId: staffUsers[2]?.id,
        branchId: branches[0]?.id,
        notes: 'يحتاج شاحنات صغيرة للتوصيل',
        tags: ['شاحنات', 'توصيل', 'أعمال']
      }
    ]

    for (const lead of leads) {
      try {
        await prisma.lead.create({
          data: lead
        })
      } catch (error) {
        // Skip if lead already exists
        console.log(`Lead ${lead.leadNumber} already exists, skipping...`)
      }
    }
    console.log('✓ Leads created')

    // 3. Opportunities - Skipped for now due to schema complexity
    console.log('Skipping Opportunities creation (schema needs review)...')

    // 4. Campaigns
    console.log('Creating Campaigns...')
    
    const campaigns = [
      {
        name: 'حملة ترويج تاتا نكسون 2024',
        type: 'EMAIL',
        status: 'ACTIVE',
        startDate: new Date('2024-01-01'),
        endDate: new Date('2024-01-31'),
        budget: 50000,
        description: 'حملة ترويجية لموديل تاتا نكسون الجديد',
        targetAudience: ['عملاء محتملون', 'عملاء حاليين'],
        createdBy: staffUsers[0]?.id,
        branchId: branches[0]?.id,
        settings: {
          sendTime: '09:00',
          timezone: 'Africa/Cairo',
          frequency: 'weekly'
        }
      },
      {
        name: 'عرض خاص على السيارات التجارية',
        type: 'SMS',
        status: 'SCHEDULED',
        startDate: new Date('2024-02-01'),
        endDate: new Date('2024-02-15'),
        budget: 25000,
        description: 'عرض خاص على شاحنات وبيك أب تاتا',
        targetAudience: ['شركات', 'أصحاب أعمال'],
        createdBy: staffUsers[1]?.id,
        branchId: branches[0]?.id,
        settings: {
          sendTime: '14:00',
          timezone: 'Africa/Cairo',
          frequency: 'once'
        }
      },
      {
        name: 'حملة الصيانة الشتوية',
        type: 'EMAIL',
        status: 'COMPLETED',
        startDate: new Date('2023-12-01'),
        endDate: new Date('2023-12-31'),
        budget: 15000,
        description: 'تذكير العملاء بالصيانة الدورية',
        targetAudience: ['عملاء حاليين'],
        createdBy: staffUsers[0]?.id,
        branchId: branches[0]?.id,
        settings: {
          sendTime: '10:00',
          timezone: 'Africa/Cairo',
          frequency: 'monthly'
        }
      }
    ]

    for (const campaign of campaigns) {
      await prisma.marketingCampaign.create({
        data: campaign
      })
    }
    console.log('✓ Campaigns created')

    // 5. Marketing Metrics
    console.log('Creating Marketing Metrics...')
    
    const marketingMetrics = [
      {
        date: new Date('2024-01-01'),
        period: 'MONTHLY',
        totalSent: 5000,
        totalDelivered: 4850,
        totalOpened: 1940,
        totalClicked: 290,
        totalBounced: 150,
        totalUnsubscribed: 25,
        smsSent: 2000,
        smsDelivered: 1950,
        leadsGenerated: 145,
        leadsConverted: 18,
        conversionRate: 12.4,
        costPerLead: 344.8,
        costPerAcquisition: 2777.8,
        revenueGenerated: 50000,
        roi: 150.0,
        topCampaigns: ['حملة ترويج تاتا نكسون 2024'],
        branchId: branches[0]?.id,
        metadata: {
          platform: 'Email & SMS',
          targetRegion: 'القاهرة الكبرى'
        }
      },
      {
        date: new Date('2023-12-01'),
        period: 'MONTHLY',
        totalSent: 4500,
        totalDelivered: 4320,
        totalOpened: 1728,
        totalClicked: 259,
        totalBounced: 180,
        totalUnsubscribed: 20,
        smsSent: 1500,
        smsDelivered: 1425,
        leadsGenerated: 120,
        leadsConverted: 15,
        conversionRate: 12.5,
        costPerLead: 312.5,
        costPerAcquisition: 2500,
        revenueGenerated: 37500,
        roi: 140.0,
        topCampaigns: ['حملة الصيانة الشتوية'],
        branchId: branches[0]?.id,
        metadata: {
          platform: 'Email & SMS',
          targetRegion: 'جميع أنحاء مصر'
        }
      }
    ]

    for (const metric of marketingMetrics) {
      await prisma.marketingMetric.create({
        data: metric
      })
    }
    console.log('✓ Marketing Metrics created')

    // 6. CRM Interactions
    console.log('Creating CRM Interactions...')
    
    const interactions = [
      {
        customerId: users[0]?.id,
        type: 'CALL',
        date: new Date('2024-01-10'),
        duration: 15,
        notes: 'اتصال هاتفي للاستفسار عن سيارة تاتا نكسون',
        outcome: 'INTERESTED',
        followUpRequired: true,
        followUpDate: new Date('2024-01-15'),
        metadata: {
          callDirection: 'inbound',
          callQuality: 'good'
        }
      },
      {
        customerId: users[1]?.id,
        type: 'EMAIL',
        date: new Date('2024-01-12'),
        duration: null,
        notes: 'إرسال كتالوج سيارات تاتا بيك أب',
        outcome: 'SENT',
        followUpRequired: true,
        followUpDate: new Date('2024-01-17'),
        metadata: {
          emailSubject: 'كتالوج سيارات تاتا التجارية',
          emailOpened: true
        }
      },
      {
        customerId: users[2]?.id,
        type: 'MEETING',
        date: new Date('2024-01-14'),
        duration: 45,
        notes: 'زيارة العميل للمعرض وعرض سيارات تاتا بانش',
        outcome: 'NEGOTIATING',
        followUpRequired: true,
        followUpDate: new Date('2024-01-20'),
        metadata: {
          meetingLocation: 'المعرض الرئيسي',
          meetingType: 'showroom_tour'
        }
      }
    ]

    for (const interaction of interactions) {
      if (interaction.customerId) {
        await prisma.cRMInteraction.create({
          data: interaction
        })
      }
    }
    console.log('✓ CRM Interactions created')

    console.log('🎉 CRM data seed completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding CRM data:', error)
    throw error
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })