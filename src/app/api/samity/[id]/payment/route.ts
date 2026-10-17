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
    const member = await db.samityMember.findUnique({
      where: {
        samityId_userId: {
          samityId,
          userId: session.userId,
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'You are not a member of this Samity' }, { status: 403 });
    }

    const { month, amount, method, trxId, screenshot } = await req.json();

    if (!month || !amount || !method || !trxId) {
      return NextResponse.json({ error: 'Missing required payment details' }, { status: 400 });
    }

    const payment = await db.payment.create({
      data: {
        samityId,
        memberId: member.id,
        userId: session.userId,
        month,
        amount: Number(amount),
        method,
        trxId,
        screenshot: screenshot || '',
        status: 'PENDING',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            phone: true,
          },
        },
      },
    });

    return NextResponse.json({ success: true, payment });
  } catch (error) {
    console.error('Error submitting payment:', error);
    return NextResponse.json({ error: 'Failed to submit payment' }, { status: 500 });
  }
}
