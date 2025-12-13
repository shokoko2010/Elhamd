import { NextResponse } from 'next/server'
import { getSliders } from '@/services/home-data'

export async function GET() {
    try {
        const sliders = await getSliders(false) // Get all sliders including inactive

        const data = sliders.map((s: any) => ({
            id: s.id,
            title: s.title,
            imageUrl: s.imageUrl, // This is the PROCESSED URL after stripLargeData
            imageUrlLength: s.imageUrl?.length || 0,
            imageUrlStart: s.imageUrl?.substring(0, 100) || 'NULL',
        }))

        return NextResponse.json({
            count: sliders.length,
            sliders: data
        })
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 })
    }
}
