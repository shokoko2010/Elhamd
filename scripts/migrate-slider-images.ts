import { PrismaClient } from '@prisma/client'
import { writeFileSync, mkdirSync } from 'fs'
import { join } from 'path'

const prisma = new PrismaClient()

async function migrateSliderImages() {
    console.log('🚀 Starting slider image migration...\n')

    try {
        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), 'public', 'uploads', 'sliders')
        mkdirSync(uploadsDir, { recursive: true })
        console.log('✓ Created directory:', uploadsDir)

        // Fetch all sliders with Base64 images
        const sliders = await prisma.slider.findMany({
            select: {
                id: true,
                title: true,
                imageUrl: true,
            },
        })

        console.log(`\n📊 Found ${sliders.length} sliders to process\n`)

        let processed = 0
        let skipped = 0
        let errors = 0

        for (const slider of sliders) {
            try {
                // Check if imageUrl is Base64
                if (!slider.imageUrl || !slider.imageUrl.startsWith('data:image')) {
                    console.log(`⏭️  Skipping "${slider.title}" - already a file path`)
                    skipped++
                    continue
                }

                // Extract Base64 data
                const matches = slider.imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/)
                if (!matches || matches.length !== 3) {
                    console.error(`❌ Invalid Base64 format for "${slider.title}"`)
                    errors++
                    continue
                }

                const mimeType = matches[1]
                const base64Data = matches[2]

                // Determine file extension
                const extension = mimeType.split('/')[1] || 'jpg'

                // Generate filename (use slider ID for uniqueness)
                const filename = `slider-${slider.id}.${extension}`
                const filePath = join(uploadsDir, filename)
                const publicPath = `/uploads/sliders/${filename}`

                // Convert Base64 to Buffer and save
                const imageBuffer = Buffer.from(base64Data, 'base64')
                writeFileSync(filePath, imageBuffer)

                const sizeKB = (imageBuffer.length / 1024).toFixed(2)
                console.log(`✓ Saved "${slider.title}" → ${filename} (${sizeKB} KB)`)

                // Update database with new file path
                await prisma.slider.update({
                    where: { id: slider.id },
                    data: { imageUrl: publicPath },
                })

                processed++
            } catch (error) {
                console.error(`❌ Error processing "${slider.title}":`, error)
                errors++
            }
        }

        console.log('\n' + '='.repeat(50))
        console.log('📈 Migration Summary:')
        console.log('='.repeat(50))
        console.log(`✓ Processed: ${processed}`)
        console.log(`⏭️  Skipped: ${skipped}`)
        console.log(`❌ Errors: ${errors}`)
        console.log('='.repeat(50))

        if (processed > 0) {
            console.log('\n✅ Migration completed successfully!')
            console.log('📁 Images saved to: /public/uploads/sliders/')
            console.log('💾 Database updated with file paths')
            console.log('\n⚠️  Next steps:')
            console.log('1. Verify images at http://localhost:3000/uploads/sliders/')
            console.log('2. Test the homepage slider')
            console.log('3. Deploy to production')
        }

    } catch (error) {
        console.error('\n💥 Migration failed:', error)
        process.exit(1)
    } finally {
        await prisma.$disconnect()
    }
}

// Run migration
migrateSliderImages()
    .catch((error) => {
        console.error('Fatal error:', error)
        process.exit(1)
    })
