import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { EmployeeStatus, Prisma, UserRole } from '@prisma/client'
import { z } from 'zod'

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

const allowedRoles: UserRole[] = [
  UserRole.SUPER_ADMIN,
  UserRole.ADMIN,
  UserRole.BRANCH_MANAGER,
  UserRole.STAFF
]

const updateProfileSchema = z
  .object({
    phone: z.string().max(32).optional(),
    emergencyContactName: z.string().max(120).optional(),
    emergencyContactPhone: z.string().max(32).optional(),
    emergencyContactRelationship: z.string().max(120).optional(),
    notes: z.string().max(1000).optional()
  })
  .strict()

async function fetchUserWithEmployee(userId?: string | null, email?: string | null) {
  if (!userId && !email) {
    return null
  }

  const where = userId
    ? { id: userId }
    : { email: email ?? undefined }

  return db.user.findFirst({
    where,
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
}

type UserWithEmployee = NonNullable<Awaited<ReturnType<typeof fetchUserWithEmployee>>>

function buildProfilePayload(user: UserWithEmployee) {
  const employee = user.employee
  const emergencyContact = normalizeEmergencyContact(employee?.emergencyContact ?? undefined)

  return {
    id: employee?.id ?? user.id,
    employeeNumber: employee?.employeeNumber ?? deriveEmployeeNumber(user.id),
    user: {
      id: user.id,
      name: user.name ?? 'موظف',
      email: user.email,
      phone: user.phone ?? '',
      avatar: null as string | null
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
}

export async function GET(_request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'صلاحيات غير كافية' }, { status: 403 })
    }

    const user = await fetchUserWithEmployee(session.user.id, session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    return NextResponse.json(buildProfilePayload(user))
  } catch (error) {
    console.error('Error fetching employee profile:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء جلب بيانات الموظف' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json({ error: 'غير مصرح بالوصول' }, { status: 401 })
    }

    if (!allowedRoles.includes(session.user.role)) {
      return NextResponse.json({ error: 'صلاحيات غير كافية' }, { status: 403 })
    }

    const rawBody = await request.json().catch(() => null)

    if (!rawBody || typeof rawBody !== 'object' || Array.isArray(rawBody)) {
      return NextResponse.json({ error: 'بيانات غير صالحة' }, { status: 400 })
    }

    const parsedResult = updateProfileSchema.safeParse(rawBody)

    if (!parsedResult.success) {
      return NextResponse.json(
        { error: 'بيانات غير صالحة', details: parsedResult.error.flatten() },
        { status: 400 }
      )
    }

    const data = parsedResult.data
    const providedKeys = new Set(Object.keys(rawBody))

    const sanitizeField = (key: keyof typeof data) => {
      if (!providedKeys.has(key)) {
        return undefined
      }

      const value = data[key]
      if (typeof value !== 'string') {
        return null
      }

      const trimmed = value.trim()
      return trimmed.length > 0 ? trimmed : null
    }

    const phoneValue = sanitizeField('phone')
    const emergencyName = sanitizeField('emergencyContactName')
    const emergencyPhone = sanitizeField('emergencyContactPhone')
    const emergencyRelationship = sanitizeField('emergencyContactRelationship')
    const notesValue = sanitizeField('notes')

    const shouldUpdateEmployee =
      emergencyName !== undefined ||
      emergencyPhone !== undefined ||
      emergencyRelationship !== undefined ||
      notesValue !== undefined

    if (phoneValue === undefined && !shouldUpdateEmployee) {
      return NextResponse.json({ error: 'لا توجد بيانات لتحديثها' }, { status: 400 })
    }

    const user = await fetchUserWithEmployee(session.user.id, session.user.email)

    if (!user) {
      return NextResponse.json({ error: 'المستخدم غير موجود' }, { status: 404 })
    }

    const operations: Promise<unknown>[] = []

    if (phoneValue !== undefined) {
      operations.push(
        db.user.update({
          where: { id: user.id },
          data: { phone: phoneValue }
        })
      )
    }

    if (shouldUpdateEmployee) {
      let emergencyContactUpdate:
        | Prisma.NullableJsonNullValueInput
        | Prisma.InputJsonValue
        | undefined
      if (
        emergencyName === undefined &&
        emergencyPhone === undefined &&
        emergencyRelationship === undefined
      ) {
        emergencyContactUpdate = undefined
      } else if (
        (emergencyName === null || emergencyName === undefined) &&
        (emergencyPhone === null || emergencyPhone === undefined) &&
        (emergencyRelationship === null || emergencyRelationship === undefined)
      ) {
        emergencyContactUpdate = Prisma.JsonNull
      } else {
        const contactPayload: Record<string, string> = {}
        if (emergencyName) {
          contactPayload.name = emergencyName
        }
        if (emergencyPhone) {
          contactPayload.phone = emergencyPhone
        }
        if (emergencyRelationship) {
          contactPayload.relationship = emergencyRelationship
        }
        emergencyContactUpdate = contactPayload
      }

      const notesUpdate = notesValue !== undefined ? notesValue : undefined

      if (user.employee) {
        const employeeData: Record<string, unknown> = {}

        if (emergencyContactUpdate !== undefined) {
          employeeData.emergencyContact = emergencyContactUpdate
        }

        if (notesUpdate !== undefined) {
          employeeData.notes = notesUpdate
        }

        if (Object.keys(employeeData).length > 0) {
          operations.push(
            db.employee.update({
              where: { userId: user.id },
              data: employeeData
            })
          )
        }
      } else {
        const employeeData: Record<string, unknown> = {
          userId: user.id,
          employeeNumber: deriveEmployeeNumber(user.id),
          hireDate: user.createdAt,
          salary: 0,
          status: EmployeeStatus.ACTIVE
        }

        if (user.branchId) {
          employeeData.branch = { connect: { id: user.branchId } }
        }

        if (emergencyContactUpdate !== undefined) {
          employeeData.emergencyContact = emergencyContactUpdate
        }

        if (notesUpdate !== undefined) {
          employeeData.notes = notesUpdate
        }

        operations.push(db.employee.create({ data: employeeData }))
      }
    }

    if (operations.length === 0) {
      return NextResponse.json(buildProfilePayload(user))
    }

    await db.$transaction(operations)

    const refreshedUser = await fetchUserWithEmployee(user.id, user.email)

    if (!refreshedUser) {
      return NextResponse.json({ error: 'حدث خطأ بعد تحديث البيانات' }, { status: 500 })
    }

    return NextResponse.json(buildProfilePayload(refreshedUser))
  } catch (error) {
    console.error('Error updating employee profile:', error)
    return NextResponse.json(
      { error: 'حدث خطأ أثناء تحديث بيانات الموظف' },
      { status: 500 }
    )
  }
}
