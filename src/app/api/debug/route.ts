
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const models = Object.keys(db).filter(key => key !== 'CONFIG' && key !== 'on' && key !== 'connect' && key !== 'disconnect')

        // Check specific models
        const hasContactInfo = !!db.contactInfo
        const hasServiceType = !!db.serviceType

        // Test DB connection
        let dbStatus = 'Unknown'
        let dbError = null
        try {
            await db.$queryRaw`SELECT 1`
            dbStatus = 'Connected'
        } catch (e) {
            dbStatus = 'Error'
            dbError = e instanceof Error ? e.message : String(e)
        }

        return NextResponse.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            nodeEnv: process.env.NODE_ENV,
            dbStatus,
            dbError,
            modelsFound: models.length,
            modelContactInfo: hasContactInfo,
            modelServiceType: hasServiceType,
            modelsList: models
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to run debug', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}
