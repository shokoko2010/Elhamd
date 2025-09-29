interface RouteParams {
  params: Promise<{ id: string }>
}

import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getUnifiedUser, createAuthHandler, UserRole } from '@/lib/unified-auth'

const authHandler = createAuthHandler([UserRole.ADMIN, UserRole.SUPER_ADMIN])

export async function GET(request: NextRequest) {
  const auth = await authHandler(request)
  if (auth.error) return auth.error
  
  try {

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    // Build where clause
    let whereClause: any = {}
    if (type && type !== 'all') {
      whereClause.type = type
    }

    // Get notification templates
    const templates = await db.emailTemplate.findMany({
      where: whereClause,
      orderBy: { name: 'asc' }
    })

    // Transform templates data
    const transformedTemplates = templates.map(template => ({
      id: template.id,
      name: template.name,
      type: template.type.toLowerCase(),
      category: template.type,
      subject: template.subject,
      content: template.content,
      variables: extractVariables(template.content),
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      usageCount: Math.floor(Math.random() * 1000) + 1 // Mock usage count
    }))

    return NextResponse.json(transformedTemplates)

  } catch (error) {
    console.error('Error fetching notification templates:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const auth = await authHandler(request)
  if (auth.error) return auth.error
  
  try {

    const body = await request.json()
    const { name, type, category, subject, content, isActive } = body

    // Validate required fields
    if (!name || !type || !subject || !content) {
      return NextResponse.json(
        { error: 'Name, type, subject, and content are required' },
        { status: 400 }
      )
    }

    // Create new template
    const template = await db.emailTemplate.create({
      data: {
        name,
        subject,
        content,
        type: type.toUpperCase() as any,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json({
      id: template.id,
      name: template.name,
      type: template.type.toLowerCase(),
      category: template.type,
      subject: template.subject,
      content: template.content,
      variables: extractVariables(template.content),
      isActive: template.isActive,
      createdAt: template.createdAt.toISOString(),
      usageCount: 0
    })

  } catch (error) {
    console.error('Error creating notification template:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

function extractVariables(content: string): string[] {
  const variables: string[] = []
  const regex = /\{\{(\w+)\}\}/g
  let match
  
  while ((match = regex.exec(content)) !== null) {
    variables.push(match[1])
  }
  
  return [...new Set(variables)]
}