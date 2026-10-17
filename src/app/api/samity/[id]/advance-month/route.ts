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

    const admin = await db.samityMember.findFirst({
      where: {
        samityId,
        userId: session.userId,
        role: 'ADMIN',
      },
    });

    if (!admin) {
      return NextResponse.json({ error: 'Only the Samity Admin can advance cycle months' }, { status: 403 });
    }

    const samity = await db.samity.findUnique({
      where: { id: samityId },
      include: { members: true },
    });

    if (!samity) {
      return NextResponse.json({ error: 'Samity not found' }, { status: 404 });
    }

    const months = JSON.parse(samity.monthsList || '[]');
    const nextIndex = samity.currentMonthIndex + 1;

    if (nextIndex >= months.length) {
      return NextResponse.json({ error: 'All scheduled months in this cycle have already concluded.' }, { status: 400 });
    }

    // Check if all members have won; if so, reset hasWonInCurrentCycle for new cycle
    const eligibleCount = samity.members.filter((m) => !m.hasWonInCurrentCycle).length;
    let cycleReset = false;
    if (eligibleCount === 0) {
      await db.samityMember.updateMany({
        where: { samityId },
        data: { hasWonInCurrentCycle: false },
      });
      cycleReset = true;
    }

    const updated = await db.samity.update({
      where: { id: samityId },
      data: { currentMonthIndex: nextIndex },
    });

    return NextResponse.json({
      success: true,
      currentMonthIndex: nextIndex,
      currentMonth: months[nextIndex],
      cycleReset,
    });
  } catch (error) {
    console.error('Error advancing month:', error);
    return NextResponse.json({ error: 'Failed to advance cycle month' }, { status: 500 });
  }
}
