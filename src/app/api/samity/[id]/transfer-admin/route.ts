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

    // Verify current user is ADMIN of this Samity
    const currentAdmin = await db.samityMember.findFirst({
      where: {
        samityId,
        userId: session.userId,
        role: 'ADMIN',
      },
    });

    if (!currentAdmin) {
      return NextResponse.json({ error: 'Only the current Samity Admin can transfer administrative access' }, { status: 403 });
    }

    const { targetMemberId } = await req.json();

    if (!targetMemberId) {
      return NextResponse.json({ error: 'Target member ID is required' }, { status: 400 });
    }

    if (currentAdmin.id === targetMemberId || currentAdmin.userId === targetMemberId) {
      return NextResponse.json({ error: 'You are already the Admin' }, { status: 400 });
    }

    // Verify target member belongs to this Samity (support matching by member ID or user ID)
    const targetMember = await db.samityMember.findFirst({
      where: {
        samityId,
        OR: [
          { id: targetMemberId },
          { userId: targetMemberId },
        ],
      },
      include: {
        user: true,
      },
    });

    if (!targetMember) {
      return NextResponse.json({ error: 'Target member not found in this Samity' }, { status: 404 });
    }

    // Atomic transaction: demote current admin to MEMBER, promote target to ADMIN, and update samity creator/instructions
    await db.$transaction([
      db.samityMember.update({
        where: { id: currentAdmin.id },
        data: { role: 'MEMBER' },
      }),
      db.samityMember.update({
        where: { id: targetMember.id },
        data: { role: 'ADMIN' },
      }),
      db.samity.update({
        where: { id: samityId },
        data: {
          creatorId: targetMember.userId,
          cashInstructions: `Handover cash directly to Samity Admin (${targetMember.user.name})`,
        },
      }),
    ]);

    return NextResponse.json({
      success: true,
      message: `Admin access successfully transferred to ${targetMember.user.name}`,
      newAdminName: targetMember.user.name,
      newAdminMemberId: targetMember.id,
      newAdminUserId: targetMember.userId,
      newAdminPhone: targetMember.user.phone,
    });
  } catch (error) {
    console.error('Error transferring admin access:', error);
    return NextResponse.json({ error: 'Failed to transfer admin access' }, { status: 500 });
  }
}
