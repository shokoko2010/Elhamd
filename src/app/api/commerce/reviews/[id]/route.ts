interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
import { ReviewStatus } from '@prisma/client'

export async function GET(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const review = await db.productReview.findUnique({
      where: { id },
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    return NextResponse.json(review)
  } catch (error) {
    console.error('Error fetching review:', error)
    return NextResponse.json({ error: 'Failed to fetch review' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to manage reviews
    if (session.session.user.role !== 'ADMIN' && session.session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const { status, action } = body

    const review = await db.productReview.findUnique({
      where: { id }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    let updatedReview
    const updateData: any = {
      updatedAt: new Date()
    }

    switch (action) {
      case 'approve':
        updateData.status = ReviewStatus.APPROVED
        updateData.approvedBy = session.session.user.id
        updateData.approvedAt = new Date()
        break
      
      case 'reject':
        updateData.status = ReviewStatus.REJECTED
        updateData.approvedBy = session.session.user.id
        updateData.approvedAt = new Date()
        break
      
      case 'publish':
        updateData.status = ReviewStatus.APPROVED
        if (!updateData.approvedBy) {
          updateData.approvedBy = session.session.user.id
          updateData.approvedAt = new Date()
        }
        break
      
      default:
        if (status) {
          updateData.status = status
        }
    }

    updatedReview = await db.productReview.update({
      where: { id },
      data: updateData,
      include: {
        product: {
          select: {
            id: true,
            name: true,
            images: true
          }
        },
        customer: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        approver: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    // Update product rating if status changed to approved
    if (updateData.status === ReviewStatus.APPROVED && review.status !== ReviewStatus.APPROVED) {
      await updateProductRating(review.productId)
    }

    // Send notification to customer if review is approved
    if (updateData.status === ReviewStatus.APPROVED && review.status !== ReviewStatus.APPROVED) {
      await sendReviewNotification(review, 'approved')
    }

    return NextResponse.json(updatedReview)
  } catch (error) {
    console.error('Error updating review:', error)
    return NextResponse.json({ error: 'Failed to update review' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  context: RouteParams
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete reviews
    if (session.session.user.role !== 'ADMIN' && session.session.user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const review = await db.productReview.findUnique({
      where: { id }
    })

    if (!review) {
      return NextResponse.json({ error: 'Review not found' }, { status: 404 })
    }

    await db.productReview.delete({
      where: { id }
    })

    // Update product rating
    await updateProductRating(review.productId)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting review:', error)
    return NextResponse.json({ error: 'Failed to delete review' }, { status: 500 })
  }
}

async function updateProductRating(productId: string) {
  try {
    const reviews = await db.productReview.findMany({
      where: {
        productId,
        status: ReviewStatus.APPROVED
      },
      select: {
        rating: true
      }
    })

    if (reviews.length === 0) {
      return
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    console.log(`Product ${productId} average rating: ${averageRating} (${reviews.length} reviews)`)
  } catch (error) {
    console.error('Error updating product rating:', error)
  }
}

async function sendReviewNotification(review: any, action: string) {
  try {
    await db.notification.create({
      data: {
        type: 'REVIEW_APPROVED',
        title: 'تمت الموافقة على تقييمك',
        message: `تمت الموافقة على تقييمك للمنتج ${review.product.name}`,
        status: 'PENDING',
        channel: 'EMAIL',
        recipient: review.customer.email,
        metadata: {
          reviewId: review.id,
          productId: review.productId,
          action
        }
      }
    })
  } catch (error) {
    console.error('Error sending review notification:', error)
  }
}