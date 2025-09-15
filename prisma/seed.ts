import { db } from '../src/lib/db'
import { PermissionCategory, UserRole } from '@prisma/client'

async function main() {
  console.log('Seeding database...')

  // Create default permissions
  const permissions = [
    // User Management
    { name: 'users.view', description: 'عرض المستخدمين', category: PermissionCategory.USER_MANAGEMENT },
    { name: 'users.create', description: 'إنشاء مستخدمين', category: PermissionCategory.USER_MANAGEMENT },
    { name: 'users.edit', description: 'تعديل المستخدمين', category: PermissionCategory.USER_MANAGEMENT },
    { name: 'users.delete', description: 'حذف المستخدمين', category: PermissionCategory.USER_MANAGEMENT },
    { name: 'users.permissions', description: 'إدارة صلاحيات المستخدمين', category: PermissionCategory.USER_MANAGEMENT },
    
    // Vehicle Management
    { name: 'vehicles.view', description: 'عرض المركبات', category: PermissionCategory.VEHICLE_MANAGEMENT },
    { name: 'vehicles.create', description: 'إنشاء مركبات', category: PermissionCategory.VEHICLE_MANAGEMENT },
    { name: 'vehicles.edit', description: 'تعديل المركبات', category: PermissionCategory.VEHICLE_MANAGEMENT },
    { name: 'vehicles.delete', description: 'حذف المركبات', category: PermissionCategory.VEHICLE_MANAGEMENT },
    
    // Booking Management
    { name: 'bookings.view', description: 'عرض الحجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    { name: 'bookings.create', description: 'إنشاء حجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    { name: 'bookings.edit', description: 'تعديل الحجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    { name: 'bookings.delete', description: 'حذف الحجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    { name: 'bookings.confirm', description: 'تأكيد الحجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    { name: 'bookings.cancel', description: 'إلغاء الحجوزات', category: PermissionCategory.BOOKING_MANAGEMENT },
    
    // Service Management
    { name: 'services.view', description: 'عرض الخدمات', category: PermissionCategory.SERVICE_MANAGEMENT },
    { name: 'services.create', description: 'إنشاء خدمات', category: PermissionCategory.SERVICE_MANAGEMENT },
    { name: 'services.edit', description: 'تعديل الخدمات', category: PermissionCategory.SERVICE_MANAGEMENT },
    { name: 'services.delete', description: 'حذف الخدمات', category: PermissionCategory.SERVICE_MANAGEMENT },
    
    // Reporting
    { name: 'reports.view', description: 'عرض التقارير', category: PermissionCategory.REPORTING },
    { name: 'reports.export', description: 'تصدير التقارير', category: PermissionCategory.REPORTING },
    { name: 'reports.analytics', description: 'التحليلات والإحصائيات', category: PermissionCategory.REPORTING },
    
    // System Settings
    { name: 'settings.view', description: 'عرض الإعدادات', category: PermissionCategory.SYSTEM_SETTINGS },
    { name: 'settings.edit', description: 'تعديل الإعدادات', category: PermissionCategory.SYSTEM_SETTINGS },
    
    // Financial
    { name: 'financial.view', description: 'عرض البيانات المالية', category: PermissionCategory.FINANCIAL },
    { name: 'financial.edit', description: 'تعديل البيانات المالية', category: PermissionCategory.FINANCIAL },
    { name: 'financial.reports', description: 'تقارير مالية', category: PermissionCategory.FINANCIAL }
  ]

  for (const permission of permissions) {
    await db.permission.upsert({
      where: { name: permission.name },
      update: permission,
      create: permission
    })
  }

  // Create super admin user
  const superAdmin = await db.user.upsert({
    where: { email: 'admin@elhamd.com' },
    update: {},
    create: {
      email: 'admin@elhamd.com',
      name: 'Super Admin',
      role: UserRole.SUPER_ADMIN,
      phone: '+20 100 000 0000'
    }
  })

  // Assign all permissions to super admin
  const allPermissions = await db.permission.findMany()
  for (const permission of allPermissions) {
    await db.userPermission.upsert({
      where: {
        userId_permissionId: {
          userId: superAdmin.id,
          permissionId: permission.id
        }
      },
      update: {},
      create: {
        userId: superAdmin.id,
        permissionId: permission.id
      }
    })
  }

  // Seed service types
  await seedServiceTypes()

  console.log('Database seeded successfully!')
}

async function seedServiceTypes() {
  console.log('Seeding service types...')

  const serviceTypes = [
    // Maintenance
    { name: 'صيانة دورية', description: 'صيانة دورية للمركبة', duration: 120, price: 350, category: 'MAINTENANCE' },
    { name: 'تغيير زيت', description: 'تغيير زيت المحرك والفلتر', duration: 60, price: 150, category: 'MAINTENANCE' },
    { name: 'تناوب إطارات', description: 'تناوب الإطارات وتوازن العجلات', duration: 90, price: 200, category: 'MAINTENANCE' },
    { name: 'فحص مكابح', description: 'فحص وصيانة نظام المكابح', duration: 60, price: 180, category: 'MAINTENANCE' },
    
    // Repair
    { name: 'إصلاح محرك', description: 'إصلاح مشاكل المحرك', duration: 240, price: 800, category: 'REPAIR' },
    { name: 'إصلاح ناقل حركة', description: 'إصلاح ناقل الحركة', duration: 180, price: 600, category: 'REPAIR' },
    { name: 'إصلاح نظام كهربائي', description: 'إصلاح المشاكل الكهربائية', duration: 120, price: 400, category: 'REPAIR' },
    { name: 'إصلاح تكييف', description: 'إصلاح نظام التكييف', duration: 90, price: 300, category: 'REPAIR' },
    
    // Inspection
    { name: 'فحص سنوي', description: 'فحص سنوي شامل للمركبة', duration: 60, price: 100, category: 'INSPECTION' },
    { name: 'فحص إنبعاثات', description: 'فحص إنبعاثات العادم', duration: 30, price: 50, category: 'INSPECTION' },
    { name: 'فحص ما قبل الشراء', description: 'فحص شامل قبل شراء المركبة', duration: 120, price: 250, category: 'INSPECTION' },
    
    // Detailing
    { name: 'غسيل وتلميع', description: 'غسيل وتلميع خارجي', duration: 90, price: 120, category: 'DETAILING' },
    { name: 'تنظيف داخلي', description: 'تنظيف وتعقيم داخلي كامل', duration: 120, price: 200, category: 'DETAILING' },
    { name: 'حماية طلاء', description: 'حماية طلاء السيارة', duration: 180, price: 400, category: 'DETAILING' },
    { name: 'تلميع محرك', description: 'تنظيف وتلميع حجرة المحرك', duration: 60, price: 150, category: 'DETAILING' },
    
    // Custom
    { name: 'تركيب إكسسوارات', description: 'تركيب إكسسوارات خارجية', duration: 120, price: 300, category: 'CUSTOM' },
    { name: 'تعديل أداء', description: 'تعديلات لتحسين الأداء', duration: 240, price: 1000, category: 'CUSTOM' },
    { name: 'تركيب نظام صوت', description: 'تركيب نظام صوتي متقدم', duration: 180, price: 600, category: 'CUSTOM' }
  ]

  for (const serviceType of serviceTypes) {
    // Check if service type exists by name
    const existing = await db.serviceType.findFirst({
      where: { name: serviceType.name }
    })

    if (existing) {
      // Update existing service type
      await db.serviceType.update({
        where: { id: existing.id },
        data: serviceType
      })
    } else {
      // Create new service type
      await db.serviceType.create({
        data: serviceType
      })
    }
  }

  console.log('Service types seeded successfully!')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await db.$disconnect()
  })