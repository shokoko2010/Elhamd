import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/db';
import { UserRole } from '@prisma/client';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user
    const session = await getServerSession(authOptions);
    
    if (!session?.user || (session.user.role !== UserRole.ADMIN && session.user.role !== UserRole.SUPER_ADMIN)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check database connection and get basic stats
    const stats = await Promise.allSettled([
      db.user.count(),
      db.branch.count(),
      db.vehicle.count(),
      db.booking.count(),
      db.serviceBooking.count(),
      db.testDriveBooking.count()
    ]);
    
    const [users, branches, vehicles, bookings, serviceBookings, testDrives] = stats;
    
    return NextResponse.json({
      status: 'success',
      data: {
        database: {
          connected: true,
          tables: {
            users: users.status === 'fulfilled' ? users.value : 0,
            branches: branches.status === 'fulfilled' ? branches.value : 0,
            vehicles: vehicles.status === 'fulfilled' ? vehicles.value : 0,
            bookings: bookings.status === 'fulfilled' ? bookings.value : 0,
            serviceBookings: serviceBookings.status === 'fulfilled' ? serviceBookings.value : 0,
            testDrives: testDrives.status === 'fulfilled' ? testDrives.value : 0
          }
        },
        user: {
          id: session.user.id,
          email: session.user.email,
          role: session.user.role
        }
      }
    });
  } catch (error) {
    console.error('Database status check failed:', error);
    return NextResponse.json({
      status: 'error',
      error: error instanceof Error ? error.message : 'Authentication failed'
    }, { status: 401 });
  }
}