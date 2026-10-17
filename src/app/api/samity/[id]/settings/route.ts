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
      return NextResponse.json({ error: 'Only the Samity Admin can update settings' }, { status: 403 });
    }

    const { fixedDepositAmount, bKashNumber, nagadNumber, bankDetails, cashInstructions } =
      await req.json();

    const updated = await db.samity.update({
      where: { id: samityId },
      data: {
        fixedDepositAmount: Number(fixedDepositAmount) || undefined,
        bKashNumber: bKashNumber !== undefined ? bKashNumber : undefined,
        nagadNumber: nagadNumber !== undefined ? nagadNumber : undefined,
        bankDetails: bankDetails !== undefined ? bankDetails : undefined,
        cashInstructions: cashInstructions !== undefined ? cashInstructions : undefined,
      },
    });

    return NextResponse.json({ success: true, samity: updated });
  } catch (error) {
    console.error('Error updating samity settings:', error);
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
  }
}
