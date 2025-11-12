import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { authorize, UserRole } from '@/lib/auth-server'

const authHandler = (request: NextRequest) =>
  authorize(request, { roles: [UserRole.ADMIN, UserRole.SUPER_ADMIN] })

export async function POST(request: NextRequest) {
  try {
    const auth = await authHandler(request)
    if ('error' in auth) {
      return auth.error
    }

    // Get warehouses
    const warehouses = await db.warehouse.findMany()
    if (warehouses.length === 0) {
      return NextResponse.json({ error: 'No warehouses found. Please initialize warehouses first.' }, { status: 400 })
    }

    // Check if inventory items already exist
    const existingItems = await db.inventoryItem.count()
    if (existingItems > 0) {
      return NextResponse.json({ error: 'Inventory items already exist' }, { status: 400 })
    }

    // Create default inventory items
    const defaultItems = [
      {
        partNumber: 'TATA-ENGINE-001',
        name: 'محرك تاتا 1.2 لتر',
        description: 'محرك سيارة تاتا جديد بضمان 3 سنوات',
        category: 'محركات',
        quantity: 5,
        minStockLevel: 2,
        maxStockLevel: 10,
        unitPrice: 25000,
        supplier: 'شركة المحركات المتخصصة',
        location: 'المستودع الرئيسي',
        warehouse: 'المستودع الرئيسي',
        status: 'IN_STOCK',
        leadTime: 5,
        notes: 'محرك أصلي بضمان الشركة المصنعة'
      },
      {
        partNumber: 'TATA-BRAKE-001',
        name: 'طقم مكابح أمامي تاتا',
        description: 'طقم مكابح أمامي لسيارات تاتا بجميع موديلاتها',
        category: 'مكابح',
        quantity: 15,
        minStockLevel: 5,
        maxStockLevel: 30,
        unitPrice: 1200,
        supplier: 'شركة الأجزاء المتقدمة',
        location: 'مستودع قطع الغيار',
        warehouse: 'مستودع قطع الغيار',
        status: 'IN_STOCK',
        leadTime: 3,
        notes: 'متوافق مع جميع موديلات تاتا'
      },
      {
        partNumber: 'TATA-FILTER-001',
        name: 'فلتر زيت تاتا',
        description: 'فلتر زيت عالي الجودة لسيارات تاتا',
        category: 'فلاتر',
        quantity: 50,
        minStockLevel: 20,
        maxStockLevel: 100,
        unitPrice: 85,
        supplier: 'مورد الإطارات الموثوق',
        location: 'مستودع قطع الغيار',
        warehouse: 'مستودع قطع الغيار',
        status: 'IN_STOCK',
        leadTime: 2,
        notes: 'يتم التغيير كل 10000 كم'
      },
      {
        partNumber: 'TATA-BATTERY-001',
        name: 'بطارية سيارة تاتا',
        description: 'بطارية 12 فولت عالية الأداء',
        category: 'بطاريات',
        quantity: 8,
        minStockLevel: 3,
        maxStockLevel: 15,
        unitPrice: 850,
        supplier: 'شركة الكهرباء والأنظمة',
        location: 'مستودع قطع الغيار',
        warehouse: 'مستودع قطع الغيار',
        status: 'IN_STOCK',
        leadTime: 4,
        notes: 'ضمان سنتان'
      },
      {
        partNumber: 'TATA-TIRE-001',
        name: 'إطار سيارة تاتا أمامي',
        description: 'إطار قياس 175/65R14',
        category: 'إطارات',
        quantity: 25,
        minStockLevel: 10,
        maxStockLevel: 50,
        unitPrice: 320,
        supplier: 'مورد الإطارات الموثوق',
        location: 'مستودع قطع الغيار',
        warehouse: 'مستودع قطع الغيار',
        status: 'IN_STOCK',
        leadTime: 2,
        notes: 'مناسب لجميع فصول السنة'
      },
      {
        partNumber: 'TATA-HEADLIGHT-001',
        name: 'مصباح أمامي تاتا',
        description: 'مصباح أمامي LED عالي الكفاءة',
        category: 'إضاءة',
        quantity: 3,
        minStockLevel: 2,
        maxStockLevel: 8,
        unitPrice: 450,
        supplier: 'شركة الكهرباء والأنظمة',
        location: 'مستودع قطع الغيار',
        warehouse: 'مستودع قطع الغيار',
        status: 'LOW_STOCK',
        leadTime: 4,
        notes: 'LED عالي الكفاءة'
      },
      {
        partNumber: 'TATA-CLUTCH-001',
        name: 'طقم قابض تاتا',
        description: 'طقم قابض كامل للسيارات اليدوية',
        category: 'ناقل حركة',
        quantity: 0,
        minStockLevel: 2,
        maxStockLevel: 6,
        unitPrice: 1800,
        supplier: 'مستوردات السيارات العالمية',
        location: 'مستودع قطع الغيار',
        warehouse: 'مستودع قطع الغيار',
        status: 'OUT_OF_STOCK',
        leadTime: 7,
        notes: 'متوافق مع ناقل الحركة اليدوي'
      },
      {
        partNumber: 'TATA-SPARK-001',
        name: 'بوجيهات تاتا',
        description: 'مجموعة بوجيهات عالية الجودة',
        category: 'إشعال',
        quantity: 30,
        minStockLevel: 10,
        maxStockLevel: 60,
        unitPrice: 120,
        supplier: 'شركة الأجزاء المتقدمة',
        location: 'مستودع قطع الغيار',
        warehouse: 'مستودع قطع الغيار',
        status: 'IN_STOCK',
        leadTime: 3,
        notes: 'مجموعة 4 قطع'
      }
    ]

    let itemsCreated = 0
    for (const item of defaultItems) {
      await db.inventoryItem.create({
        data: item
      })
      itemsCreated++
    }

    return NextResponse.json({
      message: 'Default inventory items created successfully',
      itemsCreated,
      totalItems: itemsCreated
    })

  } catch (error) {
    console.error('Error creating default inventory items:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}