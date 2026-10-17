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
      return NextResponse.json({ error: 'Only the Samity Admin can verify payments' }, { status: 403 });
    }

    const { paymentId } = await req.json();

    const updated = await db.payment.update({
      where: { id: paymentId },
      data: {
        status: 'VERIFIED',
        verifiedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true, payment: updated });
  } catch (error) {
    console.error('Error verifying payment:', error);
    return NextResponse.json({ error: 'Failed to verify payment' }, { status: 500 });
  }
}
