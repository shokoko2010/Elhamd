import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('📦 Starting Inventory & HR data seed...')

  try {
    const branches = await prisma.branch.findMany()
    const staffUsers = await prisma.user.findMany({
      where: { role: { in: ['STAFF', 'ADMIN', 'BRANCH_MANAGER'] } }
    })

    // ==================== INVENTORY DATA ====================
    
    // 1. Warehouses
    console.log('Creating Warehouses...')
    
    const warehouses = [
      {
        name: 'المستودع الرئيسي',
        location: 'القنطرة غرب، الإسماعيلية',
        capacity: 1000,
        manager: 'أحمد محمد',
        contact: '+20 1012345678',
        status: 'active',
        branchId: branches[0]?.id
      },
      {
        name: 'مستودع قطع الغيار',
        location: 'القنطرة غرب، الإسماعيلية',
        capacity: 500,
        manager: 'خالد أحمد',
        contact: '+20 1023456789',
        status: 'active',
        branchId: branches[0]?.id
      },
      {
        name: 'مستودع السيارات الجديدة',
        location: 'القنطرة غرب، الإسماعيلية',
        capacity: 100,
        manager: 'محمود حسن',
        contact: '+20 1034567890',
        status: 'active',
        branchId: branches[0]?.id
      }
    ]

    for (const warehouse of warehouses) {
      await prisma.warehouse.create({
        data: warehouse
      })
    }
    console.log('✓ Warehouses created')

    const createdWarehouses = await prisma.warehouse.findMany()

    // 2. Suppliers
    console.log('Creating Suppliers...')
    
    const suppliers = [
      {
        name: 'تاتا موتورز الهند',
        contact: 'رئيس قسم المبيعات',
        email: 'exports@tatamotors.com',
        phone: '+91 22 6665 8282',
        address: 'Mumbai, India',
        rating: 5.0,
        status: 'active',
        metadata: {
          type: 'MANUFACTURER',
          paymentTerms: '30 days',
          leadTime: 90
        }
      },
      {
        name: 'شركة القطاع للمواد الأولية',
        contact: 'أحمد القطان',
        email: 'info@alqeta3.com',
        phone: '+20 2 23456789',
        address: 'القاهرة، مصر',
        rating: 4.5,
        status: 'active',
        metadata: {
          type: 'PARTS_SUPPLIER',
          paymentTerms: '15 days',
          leadTime: 7
        }
      },
      {
        name: 'المؤسسة العربية للزيوت',
        contact: 'محمد سالم',
        email: 'sales@arabianoil.com',
        phone: '+20 2 34567890',
        address: 'الإسكندرية، مصر',
        rating: 4.0,
        status: 'active',
        metadata: {
          type: 'OIL_SUPPLIER',
          paymentTerms: '30 days',
          leadTime: 3
        }
      }
    ]

    for (const supplier of suppliers) {
      await prisma.supplier.create({
        data: supplier
      })
    }
    console.log('✓ Suppliers created')

    // 3. Inventory Items
    console.log('Creating Inventory Items...')
    
    const inventoryItems = [
      // قطع غيار سيارات
      {
        partNumber: 'TATA-NEXON-ENG-001',
        name: 'فلتر زيت تاتا نكسون',
        description: 'فلتر زيت أصلي لمحرك تاتا نكسون',
        category: 'فلاتر',
        quantity: 50,
        minStockLevel: 10,
        maxStockLevel: 100,
        unitPrice: 85.50,
        supplier: 'شركة القطاع للمواد الأولية',
        location: 'رف A-1',
        warehouseId: createdWarehouses[1]?.id,
        branchId: branches[0]?.id,
        status: 'IN_STOCK',
        leadTime: 7,
        notes: 'صالح لجميع موديلات نكسون 2020-2024'
      },
      {
        partNumber: 'TATA-PUNCH-BRK-002',
        name: 'بطانات فرامل تاتا بانش',
        description: 'بطانات فرامل أمامية وخلفية',
        category: 'فرامل',
        quantity: 30,
        minStockLevel: 15,
        maxStockLevel: 60,
        unitPrice: 220.00,
        supplier: 'شركة القطاع للمواد الأولية',
        location: 'رف B-2',
        warehouseId: createdWarehouses[1]?.id,
        branchId: branches[0]?.id,
        status: 'IN_STOCK',
        leadTime: 5,
        notes: 'متوفر لجميع ألوان بانش'
      },
      {
        partNumber: 'TATA-TIAGO-OIL-003',
        name: 'زيت محرك تاتا تياجو',
        description: 'زيت محرك اصطناعي 5W-30',
        category: 'زيوت',
        quantity: 100,
        minStockLevel: 20,
        maxStockLevel: 200,
        unitPrice: 65.00,
        supplier: 'المؤسسة العربية للزيوت',
        location: 'رف C-1',
        warehouseId: createdWarehouses[1]?.id,
        branchId: branches[0]?.id,
        status: 'IN_STOCK',
        leadTime: 3,
        notes: 'مناسب لجميع الظروف المناخية'
      },
      // إطارات
      {
        partNumber: 'TIRE-175-65-R14',
        name: 'إطار سيارة 175/65 R14',
        description: 'إطار عالي الجودة للسيارات الصغيرة',
        category: 'إطارات',
        quantity: 40,
        minStockLevel: 20,
        maxStockLevel: 80,
        unitPrice: 450.00,
        supplier: 'شركة القطاع للمواد الأولية',
        location: 'رف D-1',
        warehouseId: createdWarehouses[1]?.id,
        branchId: branches[0]?.id,
        status: 'IN_STOCK',
        leadTime: 10,
        notes: 'مناسب لتاتا تياجو وبانش'
      },
      // بطاريات
      {
        partNumber: 'BATT-12V-45AH',
        name: 'بطارية سيارة 12V 45AH',
        description: 'بطارية عالية الأداء طويلة العمر',
        category: 'بطاريات',
        quantity: 25,
        minStockLevel: 10,
        maxStockLevel: 50,
        unitPrice: 550.00,
        supplier: 'شركة القطاع للمواد الأولية',
        location: 'رف E-1',
        warehouseId: createdWarehouses[1]?.id,
        branchId: branches[0]?.id,
        status: 'IN_STOCK',
        leadTime: 7,
        notes: 'ضمان سنتان'
      },
      // مواد تنظيف
      {
        partNumber: 'CLEAN-CAR-SHMP-001',
        name: 'شامبو غسيل سيارات',
        description: 'شامبو مركز لغسيل السيارات',
        category: 'مواد تنظيف',
        quantity: 20,
        minStockLevel: 5,
        maxStockLevel: 30,
        unitPrice: 35.00,
        supplier: 'شركة القطاع للمواد الأولية',
        location: 'رف F-1',
        warehouseId: createdWarehouses[1]?.id,
        branchId: branches[0]?.id,
        status: 'IN_STOCK',
        leadTime: 5,
        notes: 'تركيز 1:20'
      }
    ]

    for (const item of inventoryItems) {
      await prisma.inventoryItem.create({
        data: item
      })
    }
    console.log('✓ Inventory Items created')

    // 4. Stock Alerts
    console.log('Creating Stock Alerts...')
    
    const lowStockItems = await prisma.inventoryItem.findMany({
      where: {
        quantity: {
          lte: prisma.inventoryItem.fields.minStockLevel
        }
      }
    })

    for (const item of lowStockItems) {
      await prisma.stockAlert.create({
        data: {
          itemId: item.id,
          type: 'LOW_STOCK',
          message: `الكمية الحالية (${item.quantity}) أقل من الحد الأدنى (${item.minStockLevel})`,
          severity: 'HIGH',
          isActive: true,
          branchId: item.branchId,
          metadata: {
            currentStock: item.quantity,
            minStock: item.minStockLevel,
            suggestedOrder: item.maxStockLevel - item.quantity
          }
        }
      })
    }
    console.log('✓ Stock Alerts created')

    // ==================== HR DATA ====================
    
    // 1. Attendance Records
    console.log('Creating Attendance Records...')
    
    const attendanceRecords = []
    const today = new Date()
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Skip weekends
      if (date.getDay() === 5) continue // Friday
      
      for (const user of staffUsers.slice(0, 5)) {
        const checkIn = new Date(date)
        checkIn.setHours(8 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0)
        
        const checkOut = new Date(date)
        checkOut.setHours(17 + Math.floor(Math.random() * 2), Math.floor(Math.random() * 60), 0)
        
        attendanceRecords.push({
          userId: user.id,
          date: date,
          checkIn: checkIn,
          checkOut: Math.random() > 0.1 ? checkOut : null, // 10% chance of forgot to check out
          breakDuration: Math.floor(Math.random() * 60) + 30, // 30-90 minutes
          overtime: Math.random() > 0.7 ? Math.floor(Math.random() * 120) : 0, // 30% chance of overtime
          status: Math.random() > 0.05 ? 'PRESENT' : 'ABSENT', // 5% chance of absent
          notes: Math.random() > 0.9 ? 'عمل إضافي لمشروع عاجل' : null,
          branchId: branches[0]?.id
        })
      }
    }

    for (const record of attendanceRecords) {
      await prisma.attendance.create({
        data: record
      })
    }
    console.log('✓ Attendance Records created')

    // 2. Performance Metrics
    console.log('Creating Performance Metrics...')
    
    const performanceMetrics = [
      {
        userId: staffUsers[0]?.id,
        period: 'MONTHLY',
        date: new Date('2024-01-01'),
        salesTarget: 2000000,
        salesAchieved: 2250000,
        customerSatisfaction: 4.8,
        taskCompletionRate: 95.5,
        attendanceRate: 98.0,
        qualityScore: 4.7,
        teamworkScore: 4.9,
        innovationScore: 4.5,
        overallScore: 4.7,
        branchId: branches[0]?.id,
        metadata: {
          strengths: ['خدمة عملاء ممتازة', 'تحقيق أهداف المبيعات'],
          improvements: ['إدارة الوقت', 'التوثيق'],
          goals: ['زيادة المبيعات بنسبة 15%', 'تطوير المهارات التقنية']
        }
      },
      {
        userId: staffUsers[1]?.id,
        period: 'MONTHLY',
        date: new Date('2024-01-01'),
        salesTarget: 1500000,
        salesAchieved: 1350000,
        customerSatisfaction: 4.6,
        taskCompletionRate: 88.0,
        attendanceRate: 95.5,
        qualityScore: 4.4,
        teamworkScore: 4.8,
        innovationScore: 4.2,
        overallScore: 4.5,
        branchId: branches[0]?.id,
        metadata: {
          strengths: ['عمل جماعي ممتاز', 'معرفة فنية جيدة'],
          improvements: ['مهارات البيع', 'إدارة العملاء'],
          goals: ['تحسين مهارات التفاوض', 'زيادة قاعدة العملاء']
        }
      },
      {
        userId: staffUsers[2]?.id,
        period: 'MONTHLY',
        date: new Date('2024-01-01'),
        salesTarget: 1000000,
        salesAchieved: 1100000,
        customerSatisfaction: 4.9,
        taskCompletionRate: 92.0,
        attendanceRate: 99.0,
        qualityScore: 4.8,
        teamworkScore: 4.7,
        innovationScore: 4.6,
        overallScore: 4.8,
        branchId: branches[0]?.id,
        metadata: {
          strengths: ['مبيعات ممتازة', 'رضا عملاء عالي'],
          improvements: ['التنظيم', 'التخطيط'],
          goals: ['تطوير مهارات القيادة', 'زيادة الحصة السوقية']
        }
      }
    ]

    for (const metric of performanceMetrics) {
      if (metric.userId) {
        await prisma.performanceMetric.create({
          data: metric
        })
      }
    }
    console.log('✓ Performance Metrics created')

    // 3. Training Records
    console.log('Creating Training Records...')
    
    const trainingRecords = [
      {
        userId: staffUsers[0]?.id,
        title: 'دورة متقدمة في بيع السيارات',
        description: 'دورة شاملة حول تقنيات البيع الحديثة وتعامل مع العملاء',
        provider: 'الأكاديمية المصرية للتدريب',
        startDate: new Date('2024-01-10'),
        endDate: new Date('2024-01-12'),
        duration: 24,
        cost: 2500,
        status: 'COMPLETED',
        certificateIssued: true,
        certificateNumber: 'TR-2024-001',
        rating: 5,
        feedback: 'دورة ممتازة جداً، استفدت كثيراً من المحتوى العملي',
        branchId: branches[0]?.id,
        metadata: {
          skills: ['البيع الاستشاري', 'التعامل مع الاعتراضات', 'إغلاق الصفقات'],
          nextSteps: ['تطبيق المهارات العملية', 'متابعة التقدم']
        }
      },
      {
        userId: staffUsers[1]?.id,
        title: 'دورة الصيانة المعتمدة من تاتا',
        description: 'دورة فنية معتمدة من تاتا موتورز على صيانة جميع الموديلات',
        provider: 'تاتا موتورز التدريب',
        startDate: new Date('2024-01-15'),
        endDate: new Date('2024-01-20'),
        duration: 40,
        cost: 5000,
        status: 'IN_PROGRESS',
        certificateIssued: false,
        rating: null,
        feedback: null,
        branchId: branches[0]?.id,
        metadata: {
          skills: ['التشخيص الميكانيكي', 'الصيانة الوقائية', 'الإلكترونيات'],
          nextSteps: ['إكمال الدورة', 'الحصول على الشهادة']
        }
      },
      {
        userId: staffUsers[2]?.id,
        title: 'ورشة عمل إدارة علاقات العملاء',
        description: 'ورشة عمل مكثفة حول استخدام نظام CRM بفعالية',
        provider: 'الشركة',
        startDate: new Date('2024-01-05'),
        endDate: new Date('2024-01-05'),
        duration: 8,
        cost: 0,
        status: 'COMPLETED',
        certificateIssued: true,
        certificateNumber: 'TR-2024-002',
        rating: 4,
        feedback: 'مفيد جداً، لكن أتمنى المزيد من التطبيقات العملية',
        branchId: branches[0]?.id,
        metadata: {
          skills: ['استخدام CRM', 'تحليل البيانات', 'تقارير العملاء'],
          nextSteps: ['ممارسة يومية', 'متابعة مع المدرب']
        }
      }
    ]

    for (const training of trainingRecords) {
      if (training.userId) {
        await prisma.trainingRecord.create({
          data: training
        })
      }
    }
    console.log('✓ Training Records created')

    console.log('🎉 Inventory & HR data seed completed successfully!')

  } catch (error) {
    console.error('❌ Error seeding Inventory & HR data:', error)
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