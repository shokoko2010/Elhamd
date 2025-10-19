interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth-server';
import { db } from '@/lib/db';

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const taxRecord = await db.taxRecord.findUnique({
      where: { id },
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

    if (!taxRecord) {
      return NextResponse.json(
        { error: 'Tax record not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(taxRecord);
  } catch (error) {
    console.error('Error fetching tax record:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tax record' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      type,
      period,
      amount,
      dueDate,
      paidDate,
      status,
      reference,
      documents,
      notes,
      branchId,
      approved,
    } = body;

    const existingRecord = await db.taxRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Tax record not found' },
        { status: 404 }
      );
    }

    const updateData: any = {};
    if (type !== undefined) updateData.type = type;
    if (period !== undefined) updateData.period = period;
    if (amount !== undefined) updateData.amount = parseFloat(amount);
    if (dueDate !== undefined) updateData.dueDate = new Date(dueDate);
    if (paidDate !== undefined) updateData.paidDate = paidDate ? new Date(paidDate) : null;
    if (status !== undefined) updateData.status = status;
    if (reference !== undefined) updateData.reference = reference;
    if (documents !== undefined) updateData.documents = documents;
    if (notes !== undefined) updateData.notes = notes;
    if (branchId !== undefined) updateData.branchId = branchId;

    // Handle approval
    if (approved && !existingRecord.approvedBy) {
      updateData.approvedBy = user.id;
    } else if (!approved && existingRecord.approvedBy) {
      updateData.approvedBy = null;
    }

    const taxRecord = await db.taxRecord.update({
      where: { id },
      data: updateData,
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

    return NextResponse.json(taxRecord);
  } catch (error) {
    console.error('Error updating tax record:', error);
    return NextResponse.json(
      { error: 'Failed to update tax record' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const existingRecord = await db.taxRecord.findUnique({
      where: { id },
    });

    if (!existingRecord) {
      return NextResponse.json(
        { error: 'Tax record not found' },
        { status: 404 }
      );
    }

    // Check if record can be deleted (only pending or cancelled records)
    if (!['PENDING', 'CANCELLED'].includes(existingRecord.status)) {
      return NextResponse.json(
        { error: 'Cannot delete tax record with status: ' + existingRecord.status },
        { status: 400 }
      );
    }

    await db.taxRecord.delete({
      where: { id },
    });

    return NextResponse.json({ message: 'Tax record deleted successfully' });
  } catch (error) {
    console.error('Error deleting tax record:', error);
    return NextResponse.json(
      { error: 'Failed to delete tax record' },
      { status: 500 }
    );
  }
}