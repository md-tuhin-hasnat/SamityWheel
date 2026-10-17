import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/session';
import bcrypt from 'bcryptjs';

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
    const adminMembership = await db.samityMember.findFirst({
      where: {
        samityId,
        userId: session.userId,
        role: 'ADMIN',
      },
    });

    if (!adminMembership) {
      return NextResponse.json({ error: 'Only the Samity Admin can add members' }, { status: 403 });
    }

    const { name, phone } = await req.json();

    if (!phone?.trim()) {
      return NextResponse.json({ error: 'Mobile number is required' }, { status: 400 });
    }

    const cleanPhone = phone.trim();

    // Find or create user
    let user = await db.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (!user) {
      const defaultPasswordHash = await bcrypt.hash('password123', 10);
      user = await db.user.create({
        data: {
          name: name?.trim() || `Member (${cleanPhone.slice(-4)})`,
          phone: cleanPhone,
          password: defaultPasswordHash,
        },
      });
    }

    // Check if already a member
    const existingMember = await db.samityMember.findUnique({
      where: {
        samityId_userId: {
          samityId,
          userId: user.id,
        },
      },
    });

    if (existingMember) {
      return NextResponse.json({ error: 'This user is already a member of this Samity' }, { status: 409 });
    }

    // Add to Samity as MEMBER
    const newMember = await db.samityMember.create({
      data: {
        samityId,
        userId: user.id,
        role: 'MEMBER',
        hasWonInCurrentCycle: false,
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

    return NextResponse.json({ success: true, member: newMember });
  } catch (error) {
    console.error('Error adding member:', error);
    return NextResponse.json({ error: 'Failed to add member' }, { status: 500 });
  }
}
