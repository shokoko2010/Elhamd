import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    // Test basic Vehicle query first
    const vehicles = await db.vehicle.findMany({
      take: 5,
      include: {
        images: {
          where: { isPrimary: true }
        },
        pricing: true
      }
    });

    return NextResponse.json({
      success: true,
      count: vehicles.length,
      vehicles
    });
  } catch (error) {
    console.error('Vehicle test error:', error);
    return NextResponse.json(
      { error: 'Vehicle test failed', details: error.message },
      { status: 500 }
    );
  }
}