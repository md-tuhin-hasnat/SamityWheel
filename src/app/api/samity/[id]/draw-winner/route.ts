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
      return NextResponse.json({ error: 'Only the Samity Admin can finalize lottery wheel winners' }, { status: 403 });
    }

    const { memberId, month, amount } = await req.json();

    if (!memberId || !month || !amount) {
      return NextResponse.json({ error: 'Missing winner details' }, { status: 400 });
    }

    // Check if month already has a winner
    const existing = await db.winner.findFirst({
      where: { samityId, month },
    });

    if (existing) {
      return NextResponse.json({ error: `A winner has already been recorded for ${month}` }, { status: 409 });
    }

    // Atomic update: mark member as won and record winner
    const [winnerRecord, updatedMember] = await db.$transaction([
      db.winner.create({
        data: {
          samityId,
          memberId,
          month,
          amount: Number(amount),
        },
      }),
      db.samityMember.update({
        where: { id: memberId },
        data: {
          hasWonInCurrentCycle: true,
          wonMonth: month,
          wonAmount: Number(amount),
        },
        include: {
          user: true,
        },
      }),
    ]);

    return NextResponse.json({ success: true, winner: winnerRecord, member: updatedMember });
  } catch (error) {
    console.error('Error recording winner:', error);
    return NextResponse.json({ error: 'Failed to record lottery winner' }, { status: 500 });
  }
}
