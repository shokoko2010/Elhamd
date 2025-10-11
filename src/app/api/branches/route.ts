interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { db } from '@/lib/db';
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN', 'BRANCH_MANAGER'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const isActive = searchParams.get('isActive');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { code: { contains: search, mode: 'insensitive' } },
        { address: { contains: search, mode: 'insensitive' } },
      ];
    }

    if (isActive !== null) {
      where.isActive = isActive === 'true';
    }

    const [branches, total] = await Promise.all([
      db.branch.findMany({
        where,
        orderBy: [
          { isActive: 'desc' },
          { name: 'asc' },
        ],
        skip,
        take: limit,
      }),
      db.branch.count({ where }),
    ]);

    // Fetch manager data separately
    const branchesWithManagers = await Promise.all(
      branches.map(async (branch) => {
        const manager = branch.managerId ? await db.user.findUnique({
          where: { id: branch.managerId },
          select: { id: true, name: true, email: true }
        }) : null;
        return { ...branch, manager };
      })
    );

    return NextResponse.json({
      branches: branchesWithManagers,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching branches:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في جلب الفروع' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user || !['ADMIN', 'SUPER_ADMIN'].includes(user.role as any)) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      code,
      address,
      phone,
      email,
      managerId,
      currency,
      timezone,
      settings,
    } = body;

    // التحقق من عدم وجود فرع بنفس الكود
    const existingBranch = await db.branch.findUnique({
      where: { code },
    });

    if (existingBranch) {
      return NextResponse.json(
        { error: 'يوجد فرع بهذا الكود بالفعل' },
        { status: 400 }
      );
    }

    // التحقق من وجود المدير إذا تم تحديده
    if (managerId) {
      const manager = await db.user.findUnique({
        where: { id: managerId },
      });

      if (!manager) {
        return NextResponse.json(
          { error: 'المدير المحدد غير موجود' },
          { status: 400 }
        );
      }

      // التحقق من أن المدير لا يدير فرع آخر
      const existingManagerBranch = await db.branch.findUnique({
        where: { managerId },
      });

      if (existingManagerBranch) {
        return NextResponse.json(
          { error: 'هذا المستخدم يدير فرع آخر بالفعل' },
          { status: 400 }
        );
      }
    } else {
      // إذا لم يتم تحديد مدير، قم بإنشاء الفرع بدون مدير
      console.log('Creating branch without manager');
    }

    const branch = await db.branch.create({
      data: {
        name,
        code,
        address,
        phone,
        email,
        managerId: managerId || null, // Ensure managerId is null if not provided
        currency: currency || 'EGP',
        timezone: timezone || 'Africa/Cairo',
        settings: settings || {},
        openingDate: new Date(),
      },
    });

    // Fetch manager data separately
    const manager = branch.managerId ? await db.user.findUnique({
      where: { id: branch.managerId },
      select: { id: true, name: true, email: true }
    }) : null;

    const branchWithManager = { ...branch, manager };

    return NextResponse.json(branchWithManager, { status: 201 });
  } catch (error) {
    console.error('Error creating branch:', error);
    return NextResponse.json(
      { error: 'حدث خطأ في إنشاء الفرع' },
      { status: 500 }
    );
  }
}