import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'
import { UserRole } from '@prisma/client'
import { generateQuotationPDF } from '@/lib/electronic-invoicing-service'

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const authenticatedUser = await requireUnifiedAuth(request)
    
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: authenticatedUser.id },
      include: { role: true }
    })

    if (!user || ![UserRole.ADMIN, UserRole.SUPER_ADMIN, UserRole.STAFF, UserRole.BRANCH_MANAGER].includes(user.role.name as UserRole)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    // Check if quotation exists and user has access
    const quotation = await db.quotation.findUnique({
      where: { id: params.id },
      include: {
        customer: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            company: true,
            address: true
          }
        },
        items: true,
        createdBy: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!quotation) {
      return NextResponse.json({ error: 'Quotation not found' }, { status: 404 })
    }

    // Check branch permissions
    if (user.role.name === UserRole.BRANCH_MANAGER && user.branchId && quotation.customer.branchId !== user.branchId) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Generate PDF
    const pdfBuffer = await generateQuotationPDF(quotation)

    if (!pdfBuffer) {
      return NextResponse.json({ 
        error: 'Failed to generate quotation PDF' 
      }, { status: 500 })
    }

    // Log activity
    await db.activityLog.create({
      data: {
        action: 'DOWNLOAD_QUOTATION',
        entityType: 'QUOTATION',
        entityId: quotation.id,
        userId: user.id,
        details: {
          quotationNumber: quotation.quotationNumber,
          totalAmount: quotation.totalAmount
        }
      }
    })

    // Return PDF file
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="quotation-${quotation.quotationNumber}.pdf"`
      }
    })
  } catch (error) {
    console.error('Error downloading quotation:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}