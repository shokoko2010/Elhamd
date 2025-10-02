import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get media statistics
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
  } catch (error) {
    console.error('Error fetching media stats:', error);
    return NextResponse.json(
      { error: 'Failed to fetch media statistics' },
      { status: 500 }
    );
  }
}