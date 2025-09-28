import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagePath = searchParams.get('pagePath')

    if (pagePath) {
      // Get SEO for specific page
      const pageSEO = await db.pageSEO.findUnique({
        where: { pagePath }
      })

      if (!pageSEO) {
        return NextResponse.json({ error: 'Page SEO not found' }, { status: 404 })
      }

      return NextResponse.json(pageSEO)
    } else {
      // Get all page SEO settings
      const allPageSEO = await db.pageSEO.findMany({
        orderBy: { pagePath: 'asc' }
      })

      return NextResponse.json(allPageSEO)
    }
  } catch (error) {
    console.error('Error fetching page SEO:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const data = await request.json()

    // Check if page SEO already exists
    const existingSEO = await db.pageSEO.findUnique({
      where: { pagePath: data.pagePath }
    })

    let pageSEO

    if (existingSEO) {
      // Update existing SEO
      pageSEO = await db.pageSEO.update({
        where: { pagePath: data.pagePath },
        data: {
          ...data,
          updatedAt: new Date()
        }
      })
    } else {
      // Create new SEO
      pageSEO = await db.pageSEO.create({
        data: {
          ...data,
          lastMod: new Date()
        }
      })
    }

    return NextResponse.json(pageSEO)
  } catch (error) {
    console.error('Error creating/updating page SEO:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagePath = searchParams.get('pagePath')
    const data = await request.json()

    if (!pagePath) {
      return NextResponse.json({ error: 'Page path is required' }, { status: 400 })
    }

    const pageSEO = await db.pageSEO.update({
      where: { pagePath },
      data: {
        ...data,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(pageSEO)
  } catch (error) {
    console.error('Error updating page SEO:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const pagePath = searchParams.get('pagePath')

    if (!pagePath) {
      return NextResponse.json({ error: 'Page path is required' }, { status: 400 })
    }

    await db.pageSEO.delete({
      where: { pagePath }
    })

    return NextResponse.json({ success: true, message: 'Page SEO deleted successfully' })
  } catch (error) {
    console.error('Error deleting page SEO:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}