import { PrismaClient, UserRole } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function createProductionAdmin() {
  try {
    // البحث عن مستخدم مدير موجود
    const existingAdmin = await prisma.user.findFirst({
      where: { 
        role: UserRole.ADMIN 
      }
    })

    if (existingAdmin) {
      console.log('✅ مستخدم مدير موجود بالفعل:', existingAdmin.email)
      return
    }

    // إنشاء مستخدم مدير جديد
    const hashedPassword = await bcrypt.hash('admin123', 12)
    
    const admin = await prisma.user.create({
      data: {
        name: 'مدير النظام',
        email: 'admin@elhamd.com',
        password: hashedPassword,
        phone: '+966501234567',
        isActive: true,
        role: UserRole.ADMIN,
        emailVerified: true
      }
    })
    
    console.log('✅ تم إنشاء مستخدم مدير جديد بنجاح:')
    console.log('📧 البريد الإلكتروني:', admin.email)
    console.log('🔑 كلمة المرور: admin123')
    console.log('👤 الاسم:', admin.name)
    console.log('🎭 الدور:', admin.role)

  } catch (error) {
    console.error('❌ خطأ في إنشاء مستخدم مدير:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createProductionAdmin()