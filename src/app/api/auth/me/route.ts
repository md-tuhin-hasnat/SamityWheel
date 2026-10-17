import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getCurrentUserSession } from '@/lib/session';


export async function GET() {
  try {
    const session = await getCurrentUserSession();
    if (!session) {
      return NextResponse.json({ user: null });
    }

    const user = await db.user.findUnique({
      where: { id: session.userId },
      include: {
        memberships: {
          include: {
            samity: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ user: null });
    }

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        phone: user.phone,
        memberships: user.memberships.map((m) => ({
          id: m.id,
          samityId: m.samityId,
          samityName: m.samity.name,
          role: m.role,
        })),
      },
    });
  } catch (error) {
    console.error('Error fetching session user:', error);
    return NextResponse.json({ user: null });
  }
}
