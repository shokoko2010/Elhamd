import { NextRequest, NextResponse } from 'next/server';
import { requireUnifiedAuth } from '@/lib/unified-auth';
import { db } from '@/lib/db';
import { TaxType, TaxStatus } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const type = searchParams.get('type') as TaxType | null;
    const status = searchParams.get('status') as TaxStatus | null;
    const branchId = searchParams.get('branchId');
    const period = searchParams.get('period');
    const search = searchParams.get('search');

    const skip = (page - 1) * limit;

    const where: any = {};
    
    if (type) where.type = type;
    if (status) where.status = status;
    if (branchId) where.branchId = branchId;
    if (period) where.period = { contains: period };
    if (search) {
      where.OR = [
        { reference: { contains: search } },
        { notes: { contains: search } },
      ];
    }

    const [taxRecords, total] = await Promise.all([
      db.taxRecord.findMany({
        where,
        include: {
          creator: {
            select: { id: true, name: true, email: true },
          },
          approver: {
            select: { id: true, name: true, email: true },
          },
          branch: {
            select: { id: true, name: true, code: true },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      db.taxRecord.count({ where }),
    ]);

    // Calculate statistics
    const stats = await db.taxRecord.groupBy({
      by: ['status'],
      _sum: { amount: true },
      _count: { id: true },
      where,
    });

    const totalAmount = stats.reduce((sum, stat) => sum + (stat._sum.amount || 0), 0);
    const pendingCount = stats.find(s => s.status === 'PENDING')?._count.id || 0;
    const paidCount = stats.find(s => s.status === 'PAID')?._count.id || 0;
    const overdueCount = stats.find(s => s.status === 'OVERDUE')?._count.id || 0;

    return NextResponse.json({
      taxRecords,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
      stats: {
        totalAmount,
        pendingCount,
        paidCount,
        overdueCount,
        totalRecords: total,
      },
    });
  } catch (error) {
    console.error('Error fetching tax records:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax records' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      period,
      amount,
      dueDate,
      reference,
      documents,
      notes,
      branchId,
    } = body;

    // Validate required fields
    if (!type || !period || !amount || !dueDate) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Create tax record
    const taxRecord = await db.taxRecord.create({
      data: {
        type,
        period,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        reference,
        documents,
        notes,
        branchId,
        createdBy: user.id,
      },
      include: {
        creator: {
          select: { id: true, name: true, email: true },
        },
        approver: {
          select: { id: true, name: true, email: true },
        },
        branch: {
          select: { id: true, name: true, code: true },
        },
      },
    });

    return NextResponse.json(taxRecord, { status: 201 });
  } catch (error) {
    console.error('Error creating tax record:', error);
    return NextResponse.json(
      { error: 'Failed to create tax record' },
      { status: 500 }
    );
  }
}