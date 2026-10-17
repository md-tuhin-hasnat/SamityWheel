import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/session';

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: samityId } = await params;
    const session = await getCurrentUserSession();

    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify user is a member of this Samity
    const membership = await db.samityMember.findFirst({
      where: {
        samityId,
        userId: session.userId,
      },
    });

    if (!membership) {
      return NextResponse.json({ error: 'Only Samity members can play the prediction game' }, { status: 403 });
    }

    const { targetMonth, guessedMemberId } = await req.json();

    if (!targetMonth || !guessedMemberId) {
      return NextResponse.json({ error: 'Target month and candidate choice required' }, { status: 400 });
    }

    // Verify candidate is an active member in this samity who has not won yet
    const candidate = await db.samityMember.findFirst({
      where: {
        id: guessedMemberId,
        samityId,
        hasWonInCurrentCycle: false,
      },
      include: {
        user: true,
      },
    });

    if (!candidate) {
      return NextResponse.json(
        { error: 'Chosen candidate is not eligible or has already won in this cycle' },
        { status: 400 }
      );
    }

    // Upsert prediction for this user and month
    const guess = await db.guess.upsert({
      where: {
        samityId_userId_targetMonth: {
          samityId,
          userId: session.userId,
          targetMonth,
        },
      },
      update: {
        guessedMemberId,
      },
      create: {
        samityId,
        userId: session.userId,
        targetMonth,
        guessedMemberId,
      },
      include: {
        guessedMember: {
          include: {
            user: { select: { id: true, name: true } },
          },
        },
      },
    });

    return NextResponse.json({
      success: true,
      guess,
      message: `Your prediction for ${candidate.user.name} has been placed!`,
    });
  } catch (error) {
    console.error('Error recording winner guess:', error);
    return NextResponse.json({ error: 'Failed to record guess' }, { status: 500 });
  }
}
