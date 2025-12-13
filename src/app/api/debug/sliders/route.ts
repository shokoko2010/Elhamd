
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const sliders = await db.slider.findMany()
        const data = sliders.map(s => ({
            id: s.id,
            title: s.title,
            imageUrlLength: s.imageUrl?.length || 0,
            imageUrlStart: s.imageUrl?.substring(0, 50) || 'NULL',
            imageUrlIsBase64: s.imageUrl?.startsWith('data:image'),
        }))
        return NextResponse.json(data)
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
