interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { sendQuotationEmail } from '@/lib/email-service'

export async function POST(request: NextRequest, context: RouteParams) {
  try {
    const authUser = await requireUnifiedAuth(request)
    
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: authUser.id },
      include: { role: true }
    })

    if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role.name as UserRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if quotation exists and user has access
    const quotation = await db.quotation.findUnique({
      where: { id },
      include: {
        customer: true,
        items: true
      }
    })

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    // Check branch permissions
    if (user.role.name === UserRole.BRANCH_MANAGER && user.branchId && quotation.customer.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Check if quotation can be sent (only draft quotations)
    if (quotation.status !== 'DRAFT') {
      return NextResponse.json({ 
        error: 'Only draft quotations can be sent' 
      }, { status: 400 })
    }

    // Send email to customer
    const emailSent = await sendQuotationEmail({
      to: quotation.customer.email,
      customerName: quotation.customer.name,
      quotationNumber: quotation.quotationNumber,
      quotationData: quotation
    })

    if (!emailSent) {
      return NextResponse.json({ 
        error: 'Failed to send quotation email' 
      }, { status: 500 })
    }

    // Update quotation status
    const updatedQuotation = await db.quotation.update({
      where: { id },
      data: {
        status: 'SENT'
      },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true
          }
        },
        items: true
      }
    })

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'SEND_QUOTATION',
        entityType: 'QUOTATION',
        entityId: updatedQuotation.id,
        userId: user.id,
        details: {
          quotationNumber: updatedQuotation.quotationNumber,
          customerEmail: quotation.customer.email,
          totalAmount: updatedQuotation.totalAmount
        }
      }
    })

    return NextResponse.json({
      message: 'Quotation sent successfully',
      quotation: updatedQuotation
    })
  } catch (error) {
    console.error('Error sending quotation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}