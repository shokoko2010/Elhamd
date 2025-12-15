
import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET() {
    try {
        const models = Object.keys(db).filter(key => key !== 'CONFIG' && key !== 'on' && key !== 'connect' && key !== 'disconnect')

        // Check specific models
        const hasContactInfo = !!db.contactInfo
        const hasServiceType = !!db.serviceType

        // Test Data Access
        let contactInfoData: any = null
        let contactInfoError: string | null = null
        try {
            contactInfoData = await db.contactInfo.findFirst({ select: { id: true, isActive: true } })
        } catch (e) {
            contactInfoError = e instanceof Error ? e.message : String(e)
        }

        let serviceTypeCount = 0
        let serviceTypeError: string | null = null
        try {
            serviceTypeCount = await db.serviceType.count()
        } catch (e) {
            serviceTypeError = e instanceof Error ? e.message : String(e)
        }

        // Test DB connection
        let dbStatus = 'Unknown'
        let dbError: string | null = null
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
            contactInfoData,
            contactInfoError,
            serviceTypeCount,
            serviceTypeError,
            modelsList: models
        })
    } catch (error) {
        return NextResponse.json({ error: 'Failed to run debug', details: error instanceof Error ? error.message : String(error) }, { status: 500 })
    }
}
