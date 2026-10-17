import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const {
      name,
      description,
      fixedDepositAmount,
      bKashNumber,
      nagadNumber,
      bankDetails,
      cashInstructions,
    } = await req.json();

    if (!name?.trim()) {
      return NextResponse.json({ error: 'Samity name is required' }, { status: 400 });
    }

    const amount = Number(fixedDepositAmount) || 5000;

    // Create Samity and add creator as ADMIN (and Member #1)
    const samity = await db.samity.create({
      data: {
        name: name.trim(),
        description: description?.trim() || null,
        fixedDepositAmount: amount,
        bKashNumber: bKashNumber?.trim() || null,
        nagadNumber: nagadNumber?.trim() || null,
        bankDetails: bankDetails?.trim() || null,
        cashInstructions: cashInstructions?.trim() || null,
        creatorId: session.userId,
        currentMonthIndex: 0,
        monthsList: JSON.stringify([
          'Month 1',
          'Month 2',
          'Month 3',
          'Month 4',
          'Month 5',
          'Month 6',
        ]),
        members: {
          create: {
            userId: session.userId,
            role: 'ADMIN', // Admin is ALSO a member!
            hasWonInCurrentCycle: false,
          },
        },
      },
      include: {
        members: true,
      },
    });

    return NextResponse.json({ success: true, samity });
  } catch (error) {
    console.error('Error creating samity:', error);
    return NextResponse.json({ error: 'Failed to create Samity' }, { status: 500 });
  }
}
