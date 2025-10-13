import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { UserRole } from '@prisma/client';

export async function POST(request: NextRequest) {
  try {
    // التحقق من أننا في بيئة الإنتاج
    if (process.env.NODE_ENV !== 'production') {
      return NextResponse.json(
        { error: 'هذا الـ API متاح فقط في بيئة الإنتاج' },
        { status: 403 }
      );
    }

    // البحث عن مستخدم مدير موجود
    const existingAdmin = await db.user.findFirst({
      where: { 
        role: UserRole.ADMIN 
      }
    });

    if (existingAdmin) {
      return NextResponse.json({
        message: 'مستخدم مدير موجود بالفعل',
        admin: {
          email: existingAdmin.email,
          name: existingAdmin.name,
          role: existingAdmin.role
        }
      });
    }

    // إنشاء مستخدم مدير جديد
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    const admin = await db.user.create({
      data: {
        name: 'مدير النظام',
        email: 'admin@elhamd.com',
        password: hashedPassword,
        phone: '+966501234567',
        isActive: true,
        role: UserRole.ADMIN,
        emailVerified: true
      }
    });
    
    return NextResponse.json({
      message: 'تم إنشاء مستخدم مدير جديد بنجاح',
      admin: {
        email: admin.email,
        name: admin.name,
        role: admin.role,
        password: 'admin123' // فقط للعرض الأولي
      }
    });

  } catch (error) {
    console.error('Setup admin error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إعداد المستخدم المدير' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const adminCount = await db.user.count({
      where: { role: UserRole.ADMIN }
    });

    return NextResponse.json({
      adminCount,
      hasAdmin: adminCount > 0
    });
  } catch (error) {
    console.error('Check admin error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في التحقق من المستخدم المدير' },
      { status: 500 }
    );
  }
}