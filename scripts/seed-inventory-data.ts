import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    console.log('Starting inventory seeding...')

    // Get admin user
    const adminUser = await prisma.user.findFirst({
      where: { email: 'admin@elhamd.com' }
    })

    if (!adminUser) {
      throw new Error('Admin user not found')
    }

    // Get main branch
    const mainBranch = await prisma.branch.findFirst({
      where: { code: 'MAIN' }
    })

    if (!mainBranch) {
      throw new Error('Main branch not found')
    }

    // Create warehouses
    const warehouseCount = await prisma.warehouse.count()
    if (warehouseCount === 0) {
      console.log('Creating warehouses...')
      const warehouses = [
        {
          name: 'المستودع الرئيسي',
          location: 'القاهرة - الجيزة',
          capacity: 1000,
          manager: adminUser.id,
          branchId: mainBranch.id
        },
        {
          name: 'مستودع قطع الغيار',
          location: 'القاهرة - المعادي',
          capacity: 500,
          manager: adminUser.id,
          branchId: mainBranch.id
        }
      ]

      for (const warehouseData of warehouses) {
        const warehouse = await prisma.warehouse.create({
          data: warehouseData
        })
        console.log('Warehouse created:', warehouse.name)
      }
    }

    // Get warehouses
    const warehouses = await prisma.warehouse.findMany({
      where: { status: 'active' }
    })

    // Create suppliers
    const supplierCount = await prisma.supplier.count()
    if (supplierCount === 0) {
      console.log('Creating suppliers...')
      const suppliers = [
        {
          name: 'تاتا موتورز',
          contact: 'أحمد محمد',
          email: 'supplier@tata.com',
          phone: '+20 2 12345678',
          address: 'القاهرة، مصر',
          rating: 5.0,
          status: 'active'
        },
        {
          name: 'شركة قطع الغيار المتخصصة',
          contact: 'خالد علي',
          email: 'parts@spareparts.com',
          phone: '+20 2 87654321',
          address: 'الجيزة، مصر',
          rating: 4.5,
          status: 'active'
        }
      ]

      for (const supplierData of suppliers) {
        const supplier = await prisma.supplier.create({
          data: supplierData
        })
        console.log('Supplier created:', supplier.name)
      }
    }

    // Get suppliers
    const suppliers = await prisma.supplier.findMany({
      where: { status: 'active' }
    })

    // Create inventory items
    const itemCount = await prisma.inventoryItem.count()
    if (itemCount === 0) {
      console.log('Creating inventory items...')
      const items = [
        {
          partNumber: 'TAT-NX-ACC-001',
          name: 'بطارية سيارة نيكسيون EV',
          description: 'بطارية عالية الجودة لسيارة نيكسيون الكهربائية',
          category: 'BATTERIES',
          quantity: 15,
          minStockLevel: 5,
          maxStockLevel: 50,
          unitPrice: 25000,
          supplier: suppliers[0].name,
          location: 'رف A-1',
          warehouse: warehouses[0].name,
          status: 'IN_STOCK',
          leadTime: 7,
          notes: 'بطارية أصلية من تاتا'
        },
        {
          partNumber: 'TAT-PC-TIRE-001',
          name: 'إطار سيارة بانش',
          description: 'إطار قياسي لسيارة بانش',
          category: 'TIRES',
          quantity: 8,
          minStockLevel: 10,
          maxStockLevel: 40,
          unitPrice: 1200,
          supplier: suppliers[1].name,
          location: 'رف B-2',
          warehouse: warehouses[0].name,
          status: 'LOW_STOCK',
          leadTime: 3,
          notes: 'إطار عالي الجودة'
        },
        {
          partNumber: 'TAT-TG-BRAKE-001',
          name: 'فرامل سيارة تياجو EV',
          description: 'طقم فرامل كامل لسيارة تياجو الكهربائية',
          category: 'BRAKES',
          quantity: 25,
          minStockLevel: 8,
          maxStockLevel: 60,
          unitPrice: 3500,
          supplier: suppliers[0].name,
          location: 'رف C-1',
          warehouse: warehouses[1].name,
          status: 'IN_STOCK',
          leadTime: 5,
          notes: 'فرامل أصلية مضمونة'
        },
        {
          partNumber: 'TAT-AC-FILTER-001',
          name: 'فلتر هواء مكيف',
          description: 'فلتر هواء لنظام المكيف',
          category: 'FILTERS',
          quantity: 0,
          minStockLevel: 15,
          maxStockLevel: 100,
          unitPrice: 150,
          supplier: suppliers[1].name,
          location: 'رف D-3',
          warehouse: warehouses[1].name,
          status: 'OUT_OF_STOCK',
          leadTime: 2,
          notes: 'فلتر عالي الكفاءة'
        },
        {
          partNumber: 'TAT-OIL-5W30-001',
          name: 'زيت محرك 5W30',
          description: 'زيت محرك اصطناعي عالي الجودة',
          category: 'OILS',
          quantity: 45,
          minStockLevel: 20,
          maxStockLevel: 200,
          unitPrice: 280,
          supplier: suppliers[1].name,
          location: 'رف E-1',
          warehouse: warehouses[0].name,
          status: 'IN_STOCK',
          leadTime: 1,
          notes: 'زيت معتمد من تاتا'
        }
      ]

      for (const itemData of items) {
        const item = await prisma.inventoryItem.create({
          data: itemData
        })
        console.log('Inventory item created:', item.partNumber)
      }
    }

    console.log('Inventory seeding completed successfully!')
  } catch (error) {
    console.error('Error seeding inventory:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

main()