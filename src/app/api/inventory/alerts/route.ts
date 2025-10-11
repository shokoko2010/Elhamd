interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
const authHandler = async (request: NextRequest) => {
  try {
    return await authorize(request, { roles: [UserRole.ADMIN,UserRole.SUPER_ADMIN,UserRole.BRANCH_MANAGER,] })
  } catch (error) {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const auth = await authHandler(request)
    if (auth.error) {
      return auth.error
    }

    // Get inventory alerts
    const alerts = await db.stockAlert.findMany({
      include: {
        inventoryItem: {
          select: {
            name: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    // Transform alerts data
    const transformedAlerts = alerts.map(alert => ({
      id: alert.id,
      itemId: alert.itemId,
      itemName: alert.inventoryItem.name,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      createdAt: alert.createdAt.toISOString(),
      resolved: alert.resolved,
      resolvedAt: alert.resolvedAt?.toISOString(),
      resolvedBy: alert.resolvedBy
    }))

    return NextResponse.json(transformedAlerts)

  } catch (error) {
    console.error('Error fetching stock alerts:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await authHandler(request)
    if (auth.error) {
      return auth.error
    }

    const body = await request.json()
    const { itemId, type, severity, message } = body

    // Validate required fields
    if (!itemId || !type || !severity || !message) {
      return NextResponse.json(
        { error: 'Item ID, type, severity, and message are required' },
        { status: 400 }
      )
    }

    // Check if item exists
    const item = await db.inventoryItem.findUnique({
      where: { id: itemId }
    })

    if (!item) {
      return NextResponse.json(
        { error: 'Inventory item not found' },
        { status: 404 }
      )
    }

    // Create new alert
    const alert = await db.stockAlert.create({
      data: {
        itemId,
        type,
        severity,
        message,
        resolved: false
      },
      include: {
        inventoryItem: {
          select: {
            name: true
          }
        }
      }
    })

    return NextResponse.json({
      id: alert.id,
      itemId: alert.itemId,
      itemName: alert.inventoryItem.name,
      type: alert.type,
      severity: alert.severity,
      message: alert.message,
      createdAt: alert.createdAt.toISOString(),
      resolved: alert.resolved,
      resolvedAt: alert.resolvedAt?.toISOString(),
      resolvedBy: alert.resolvedBy
    })

  } catch (error) {
    console.error('Error creating stock alert:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}