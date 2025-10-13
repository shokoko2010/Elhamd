import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const userId = request.cookies.get('userId')?.value;

    if (!userId) {
      return NextResponse.json(
        { error: 'غير مصدق' },
        { status: 401 }
      );
    }

    // جلب بيانات المستخدم
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        branch: true
      }
    });

    if (!user || !user.isActive) {
      return NextResponse.json(
        { error: 'المستخدم غير موجود أو غير نشط' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        role: user.role,
        branch: user.branch ? {
          id: user.branch.id,
          name: user.branch.name,
          code: user.branch.code
        } : null,
        branchId: user.branchId
      }
    });

  } catch (error) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في التحقق من المستخدم' },
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