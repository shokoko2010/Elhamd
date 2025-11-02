import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
  try {
    console.log('🔍 Checking users in database...')
    
    const users = await db.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        isActive: true,
        createdAt: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    console.log(`Found ${users.length} users`)
    
    // Check if users have associated employees
    const usersWithEmployees = await db.user.findMany({
      include: {
        employee: true
      }
    })

    console.log(`Users with employees: ${usersWithEmployees.length}`)

    // Check employee table directly
    const employees = await db.employee.findMany({
      select: {
        id: true,
        employeeNumber: true,
        userId: true,
        status: true,
        createdAt: true
      }
    })

    console.log(`Direct employees count: ${employees.length}`)

    return NextResponse.json({
      success: true,
      data: {
        users: users.length,
        usersWithEmployees: usersWithEmployees.length,
        employees: employees.length,
        usersList: users.map(u => ({
          id: u.id,
          email: u.email,
          name: u.name,
          role: u.role,
          hasEmployee: !!usersWithEmployees.find(ue => ue.id === u.id)
        }))
      }
    })
  } catch (error) {
    console.error('Error checking users:', error)
    return NextResponse.json(
      { 
        error: 'Database error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}