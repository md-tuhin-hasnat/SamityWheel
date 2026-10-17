import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/session';

export async function GET(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getCurrentUserSession();

    const samity = await db.samity.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { joinedAt: 'asc' },
        },
        payments: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                phone: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
        winners: {
          include: {
            member: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true,
                  },
                },
              },
            },
          },
          orderBy: { wonAt: 'desc' },
        },
      },
    });

    if (!samity) {
      return NextResponse.json({ error: 'Samity not found' }, { status: 404 });
    }

    // Determine current user's membership and role in this Samity
    const currentMember = session
      ? samity.members.find((m) => m.userId === session.userId)
      : null;

    return NextResponse.json({
      samity: {
        ...samity,
        monthsList: JSON.parse(samity.monthsList || '[]'),
      },
      currentMember: currentMember || null,
      isAdmin: currentMember?.role === 'ADMIN',
    });
  } catch (error) {
    console.error('Error fetching samity:', error);
    return NextResponse.json({ error: 'Failed to fetch Samity details' }, { status: 500 });
  }
}
