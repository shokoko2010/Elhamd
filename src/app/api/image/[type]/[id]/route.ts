import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ type: string; id: string }> }
) {
    try {
        const { type, id } = await params

        let base64Data: string | null = null

        if (type === 'vehicle') {
            const image = await db.vehicleImage.findUnique({
                where: { id },
                select: { imageUrl: true }
            })
            base64Data = image?.imageUrl || null
        } else if (type === 'slider') {
            const slider = await db.slider.findUnique({
                where: { id },
                select: { imageUrl: true }
            })
            base64Data = slider?.imageUrl || null
        } else if (type === 'company-info') {
            const info = await db.companyInfo.findUnique({
                where: { id },
                select: { imageUrl: true }
            })
            base64Data = info?.imageUrl || null
        } else if (type === 'logo') {
            // Check Site Settings
            const settings = await db.siteSettings.findUnique({
                where: { id },
                select: { logoUrl: true, faviconUrl: true }
            })

            if (settings?.logoUrl?.startsWith('data:image')) {
                base64Data = settings.logoUrl
            } else if (settings?.faviconUrl?.startsWith('data:image')) {
                // If the ID matches, it might be favicon. 
                // But usually we can't distinguish by ID alone if they share ID "default".
                // Since logoUrl is primary, if it's not base64, check favicon?
                // Or if the STRIPPED url implied which one? 
                // The stripLargeData helper generates /api/image/logo/[id]. It doesn't say "favicon".
                // Assuming logo is the main use case.
                base64Data = settings.faviconUrl
            }

            // Fallback to Footer Content if not found in Site Settings
            if (!base64Data) {
                const footer = await db.footerContent.findUnique({ where: { id } })
                if (footer?.logoUrl?.startsWith('data:image')) {
                    base64Data = footer.logoUrl
                }
            }
        }

        if (!base64Data) {
            return new NextResponse('Image not found', { status: 404 })
        }

        // Check if it's actually Base64
        if (base64Data.startsWith('data:image')) {
            const matches = base64Data.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)

            if (!matches || matches.length !== 3) {
                return new NextResponse('Invalid image data', { status: 500 })
            }

            const contentType = matches[1]
            const buffer = Buffer.from(matches[2], 'base64')

            return new NextResponse(buffer, {
                headers: {
                    'Content-Type': contentType,
                    'Cache-Control': 'public, max-age=31536000, immutable'
                }
            })
        }

        // If it's a normal URL, redirect to it
        if (base64Data.startsWith('http') || base64Data.startsWith('/')) {
            return NextResponse.redirect(new URL(base64Data, request.url))
        }

        return new NextResponse('Unsupported image format', { status: 400 })

    } catch (error) {
        console.error('Error serving image:', error)
        return new NextResponse('Internal Server Error', { status: 500 })
    }
}
