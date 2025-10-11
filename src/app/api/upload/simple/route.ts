import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db'
import { writeFile, mkdir } from 'fs/promises'
import { join } from 'path'
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getAuthUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('Upload request from user:', user.email, 'Role:', user.role);

    // Check if user has permission to upload images
    if (!['ADMIN', 'SUPER_ADMIN', 'STAFF', 'BRANCH_MANAGER'].includes(user.role)) {
      console.log('Access denied for role:', user.role);
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const vehicleId = formData.get('vehicleId') as string
    const isPrimary = formData.get('isPrimary') === 'true'

    if (!file || !vehicleId) {
      return NextResponse.json({ error: 'Missing file or vehicleId' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Create upload directory
    const uploadDir = join(process.cwd(), 'public', 'uploads', 'vehicles')
    await mkdir(uploadDir, { recursive: true })

    // Generate unique filename
    const timestamp = Date.now()
    const randomId = Math.random().toString(36).substring(2, 15)
    const extension = file.name.split('.').pop()
    const filename = `${vehicleId}_${timestamp}_${randomId}.${extension}`

    // Save file
    const buffer = Buffer.from(await file.arrayBuffer())
    const filepath = join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Save to database
    const vehicleImage = await db.vehicleImage.create({
      data: {
        vehicleId,
        imageUrl: `/uploads/vehicles/${filename}`,
        altText: `${file.name}`,
        isPrimary,
        order: 0
      }
    })

    // If this is primary, unset other primary images
    if (isPrimary) {
      await db.vehicleImage.updateMany({
        where: {
          vehicleId,
          id: { not: vehicleImage.id }
        },
        data: {
          isPrimary: false
        }
      })
    }

    return NextResponse.json({
      success: true,
      image: vehicleImage,
      url: vehicleImage.imageUrl
    })

  } catch (error) {
    console.error('Error uploading image:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to upload image' },
      { status: 500 }
    )
  }
}