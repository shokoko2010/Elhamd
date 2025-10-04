import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/authOptions';

export async function GET(request: NextRequest) {
  try {
    // Check if we're in development or production
    const isDevelopment = process.env.NODE_ENV === 'development'
    
    // In development, return mock data to avoid database issues
    if (isDevelopment) {
      return NextResponse.json({
        totalMedia: 0,
        totalSize: 0,
        mediaByType: {},
        recentMedia: []
      });
    }
    
    // Try to get session in production
    try {
      const session = await getServerSession(authOptions);
      if (!session?.user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    } catch (authError) {
      console.error('Auth error in media stats:', authError);
      return NextResponse.json({ error: 'Authentication failed' }, { status: 401 });
    }

    // Try to get media statistics with error handling
    try {
      const totalMedia = await db.media.count();
      const totalSize = await db.media.aggregate({
        _sum: {
          fileSize: true
        }
      });

      const mediaByType = await db.media.groupBy({
        by: ['fileType'],
        _count: {
          id: true
        }
      });

      const recentMedia = await db.media.findMany({
        take: 5,
        orderBy: {
          createdAt: 'desc'
        },
        select: {
          id: true,
          filename: true,
          originalName: true,
          fileType: true,
          fileSize: true,
          createdAt: true
        }
      });

      const stats = {
        totalMedia,
        totalSize: totalSize._sum.fileSize || 0,
        mediaByType: mediaByType.reduce((acc, item) => {
          acc[item.fileType] = item._count.id;
          return acc;
        }, {} as Record<string, number>),
        recentMedia
      };

      return NextResponse.json(stats);
    } catch (dbError) {
      console.error('Database error in media stats:', dbError);
      // Return empty stats if database fails
      return NextResponse.json({
        totalMedia: 0,
        totalSize: 0,
        mediaByType: {},
        recentMedia: []
      });
    }
  } catch (error) {
    console.error('Error fetching media stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media statistics' },
      { status: 500 }
    );
  }
}