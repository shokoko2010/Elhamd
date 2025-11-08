import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { EmployeeStatus, UserRole } from '@prisma/client'

type EmergencyContact = {
  name?: string
  phone?: string
  relationship?: string
}

function normalizeEmergencyContact(value: unknown): EmergencyContact | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return undefined
  }

  const record = value as Record<string, unknown>

  const name = typeof record.name === 'string' ? record.name : undefined
  const phone = typeof record.phone === 'string' ? record.phone : undefined
  const relationship = typeof record.relationship === 'string' ? record.relationship : undefined

  if (!name && !phone && !relationship) {
    return undefined
  }

  return { name, phone, relationship }
}

function deriveEmployeeNumber(userId: string): string {
  return `USR-${userId.slice(0, 8).toUpperCase()}`
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    const allowedRoles: UserRole[] = [
      UserRole.SUPER_ADMIN,
      UserRole.ADMIN,
      UserRole.BRANCH_MANAGER,
      UserRole.STAFF
    ]

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'صلاحيات غير كافية' }, { status: 403 })
    }

    const user = await db.user.findFirst({
      where: session.user.id
        ? { id: session.user.id }
        : { email: session.user.email ?? undefined },
      include: {
        employee: {
          include: {
            branch: { select: { id: true, name: true } },
            department: { select: { name: true } },
            position: { select: { name: true } }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    const employee = user.employee
    const emergencyContact = normalizeEmergencyContact(employee?.emergencyContact ?? undefined)

    const profile = {
      id: employee?.id ?? user.id,
      employeeNumber: employee?.employeeNumber ?? deriveEmployeeNumber(user.id),
      user: {
        id: user.id,
        name: user.name ?? 'موظف',
        email: user.email,
        phone: user.phone ?? '',
        avatar: null
      },
      department: employee?.department?.name ?? 'غير محدد',
      position: employee?.position?.name ?? user.role,
      hireDate: (employee?.hireDate ?? user.createdAt).toISOString(),
      salary: employee?.salary ?? 0,
      status: employee?.status ?? EmployeeStatus.ACTIVE,
      branch: employee?.branch
        ? { id: employee.branch.id, name: employee.branch.name }
        : undefined,
      emergencyContact,
      notes: employee?.notes ?? undefined
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Error fetching employee profile:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الموظف' },
      { status: 500 }
    )
  }
}
