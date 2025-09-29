interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'
import { ReviewStatus } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const productId = searchParams.get('productId')
    const customerId = searchParams.get('customerId')
    const status = searchParams.get('status')
    const rating = searchParams.get('rating')

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (productId) {
      where.productId = productId
    }
    
    if (customerId) {
      where.customerId = customerId
    }
    
    if (status) {
      where.status = status
    }
    
    if (rating) {
      where.rating = parseInt(rating)
    }

    // Get reviews with pagination
    const [reviews, total] = await Promise.all([
      db.productReview.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
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
              name: true
            }
          },
          approver: {
            select: {
              id: true,
              name: true
            }
          }
        }
      }),
      db.productReview.count({ where })
    ])

    return NextResponse.json({
      reviews,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    return NextResponse.json({ error: 'Failed to fetch reviews' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const {
      productId,
      rating,
      title,
      review,
      images,
      isAnonymous
    } = body

    // Validate required fields
    if (!productId || !rating || !review) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Validate rating range
    if (rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating must be between 1 and 5' }, { status: 400 })
    }

    // Check if product exists
    const product = await db.product.findUnique({
      where: { id: productId }
    })

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 })
    }

    // Check if user has already reviewed this product
    const existingReview = await db.productReview.findFirst({
      where: {
        productId,
        customerId: user.id
      }
    })

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this product' }, { status: 400 })
    }

    // Get commerce settings to check if reviews require approval
    const commerceSettings = await db.commerceSettings.findFirst()
    const settings = commerceSettings?.settings || {}
    const requireApproval = settings.reviews?.requireApproval ?? true
    const autoPublish = settings.reviews?.autoPublish ?? false

    // Create review
    const newReview = await db.productReview.create({
      data: {
        productId,
        customerId: user.id,
        rating: parseInt(rating),
        title,
        review,
        images: images || [],
        isAnonymous: isAnonymous || false,
        status: requireApproval && !autoPublish ? ReviewStatus.PENDING : ReviewStatus.APPROVED,
        approvedBy: !requireApproval || autoPublish ? user.id : null,
        approvedAt: !requireApproval || autoPublish ? new Date() : null
      },
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
            name: true
          }
        }
      }
    })

    // Update product rating (calculate average)
    await updateProductRating(productId)

    return NextResponse.json(newReview)
  } catch (error) {
    console.error('Error creating review:', error)
    return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
  }
}

async function updateProductRating(productId: string) {
  try {
    // Get all approved reviews for the product
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

    // Calculate average rating
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0)
    const averageRating = totalRating / reviews.length

    // Update product with average rating (you might need to add a rating field to the Product model)
    // For now, we'll just log it
    console.log(`Product ${productId} average rating: ${averageRating} (${reviews.length} reviews)`)
  } catch (error) {
    console.error('Error updating product rating:', error)
  }
}