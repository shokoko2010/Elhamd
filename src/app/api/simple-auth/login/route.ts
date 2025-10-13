import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Login attempt:', { email: body.email, hasPassword: !!body.password });
    
    const { email, password } = body;

    if (!email || !password) {
      console.log('Missing credentials');
      return NextResponse.json(
        { error: 'البريد الإلكتروني وكلمة المرور مطلوبان' },
        { status: 400 }
      );
    }

    // البحث عن المستخدم في قاعدة البيانات
    const user = await db.user.findUnique({
      where: { email }
    });

    console.log('User found:', !!user, user?.role, user?.isActive);

    if (!user) {
      console.log('User not found:', email);
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من كلمة المرور
    const isPasswordValid = await bcrypt.compare(password, user.password || '');
    console.log('Password valid:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('Invalid password for:', email);
      return NextResponse.json(
        { error: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' },
        { status: 401 }
      );
    }

    // التحقق من أن المستخدم نشط
    if (!user.isActive) {
      console.log('User not active:', email);
      return NextResponse.json(
        { error: 'الحساب غير نشط' },
        { status: 401 }
      );
    }

    // تحديث آخر تسجيل دخول
    await db.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    // إعداد جلسة المستخدم
    const responseData = {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branchId: user.branchId
      },
      message: 'تم تسجيل الدخول بنجاح'
    };

    console.log('Login successful for:', email);

    const response = NextResponse.json(responseData);

    // تعيين الكوكيز مع إعدادات مناسبة لـ Vercel و HTTPS
    const isProduction = process.env.NODE_ENV === 'production';
    response.cookies.set('userId', user.id, {
      httpOnly: true,
      secure: isProduction, // ضروري لـ HTTPS
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 أيام
      path: '/',
      // لا نحدد domain للسماح بالعمل على النطاق الرئيسي
    });

    return response;

  } catch (error) {
    console.error('Login error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      env: process.env.NODE_ENV,
      dbUrl: process.env.DATABASE_URL ? 'Set' : 'Not set'
    });
    
    return NextResponse.json(
      { error: 'حدث خطأ في تسجيل الدخول' },
      { status: 500 }
    );
  }
}

// دعم طلبات OPTIONS لـ CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}