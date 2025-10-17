import { NextRequest, NextResponse } from 'next/server'
import { requireUnifiedAuth } from '@/lib/unified-auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin or employee
    const dbUser = await db.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'EMPLOYEE')) {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'contact', 'service', 'testdrive', 'consultation'
    const status = searchParams.get('status') // 'PENDING', 'APPROVED', 'REJECTED'

    try {
      let submissions = []

      switch (type) {
        case 'contact':
          submissions = await db.contactSubmission.findMany({
            where: status ? { status } : {},
            orderBy: { submittedAt: 'desc' }
          })
          break
        case 'service':
          submissions = await db.serviceBookingSubmission.findMany({
            where: status ? { status } : {},
            orderBy: { submittedAt: 'desc' }
          })
          break
        case 'testdrive':
          submissions = await db.testDriveSubmission.findMany({
            where: status ? { status } : {},
            orderBy: { submittedAt: 'desc' }
          })
          break
        case 'consultation':
          submissions = await db.consultationSubmission.findMany({
            where: status ? { status } : {},
            orderBy: { submittedAt: 'desc' }
          })
          break
        default:
          // Get all submissions
          const [contact, service, testdrive, consultation] = await Promise.all([
            db.contactSubmission.findMany({
              where: status ? { status } : {},
              orderBy: { submittedAt: 'desc' }
            }),
            db.serviceBookingSubmission.findMany({
              where: status ? { status } : {},
              orderBy: { submittedAt: 'desc' }
            }),
            db.testDriveSubmission.findMany({
              where: status ? { status } : {},
              orderBy: { submittedAt: 'desc' }
            }),
            db.consultationSubmission.findMany({
              where: status ? { status } : {},
              orderBy: { submittedAt: 'desc' }
            })
          ])

          submissions = {
            contact,
            service,
            testdrive,
            consultation
          }
      }

      return NextResponse.json(submissions)
    } catch (dbError) {
      console.error('Database error:', dbError)
      return NextResponse.json(
        { error: 'Failed to fetch submissions' },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error fetching submissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const user = await requireUnifiedAuth(request)
    
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if user is admin
    const dbUser = await db.user.findUnique({
      where: { id: user.id }
    })

    if (!dbUser || dbUser.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Forbidden' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { type, id, status } = body

    if (!type || !id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields: type, id, status' },
        { status: 400 }
      )
    }

    let updatedSubmission

    switch (type) {
      case 'contact':
        updatedSubmission = await db.contactSubmission.update({
          where: { id },
          data: { status }
        })
        break
      case 'service':
        updatedSubmission = await db.serviceBookingSubmission.update({
          where: { id },
          data: { status }
        })
        break
      case 'testdrive':
        updatedSubmission = await db.testDriveSubmission.update({
          where: { id },
          data: { status }
        })
        break
      case 'consultation':
        updatedSubmission = await db.consultationSubmission.update({
          where: { id },
          data: { status }
        })
        break
      default:
        return NextResponse.json(
          { error: 'Invalid submission type' },
          { status: 400 }
        )
    }

    return NextResponse.json(updatedSubmission)

  } catch (error) {
    console.error('Error updating submission:', error)
    return NextResponse.json(
      { error: 'Failed to update submission' },
      { status: 500 }
    )
  }
}