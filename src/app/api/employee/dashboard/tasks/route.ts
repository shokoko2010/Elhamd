import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth-server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const userId = session.user.id

    // Check if user is staff or admin
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { role: true }
    })

    if (!user || !['STAFF', 'ADMIN', 'MANAGER', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // For now, return mock tasks since we don't have a tasks table in the schema
    // In a real implementation, you would fetch from a tasks table
    const mockTasks = [
      {
        id: '1',
        title: 'Follow up with customer about test drive',
        description: 'Contact the customer who took a test drive yesterday to get their feedback',
        priority: 'high' as const,
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        assignedBy: 'System',
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
          phone: '+1234567890'
        },
        booking: {
          id: 'td-001',
          type: 'test_drive',
          date: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          timeSlot: '10:00 AM'
        }
      },
      {
        id: '2',
        title: 'Prepare service quote for customer',
        description: 'Create a detailed service quote for the customer\'s vehicle maintenance',
        priority: 'medium' as const,
        status: 'in_progress' as const,
        dueDate: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
        assignedBy: 'Service Manager',
        customer: {
          name: 'Jane Smith',
          email: 'jane@example.com',
          phone: '+1234567891'
        },
        booking: {
          id: 'svc-001',
          type: 'service',
          date: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString(),
          timeSlot: '2:00 PM'
        }
      },
      {
        id: '3',
        title: 'Update vehicle inventory',
        description: 'Update the vehicle inventory with new stock information',
        priority: 'low' as const,
        status: 'pending' as const,
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        assignedBy: 'Inventory Manager'
      }
    ]

    return NextResponse.json(mockTasks)
  } catch (error) {
    console.error('Error fetching employee tasks:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}