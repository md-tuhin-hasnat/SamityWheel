import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSessionCookie } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { phone, password } = await req.json();

    if (!phone || !password) {
      return NextResponse.json({ error: 'Phone and password are required' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const user = await db.user.findFirst({
      where: {
        OR: [
          { phone: cleanPhone },
          { name: { equals: cleanPhone } },
        ],
      },
      include: {
        memberships: {
          include: {
            samity: true,
          },
        },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return NextResponse.json({ error: 'Invalid phone or password' }, { status: 401 });
    }

    // Set HTTP-only JWT cookie
    await createSessionCookie({
      userId: user.id,
      name: user.name,
      phone: user.phone,
    });

    return NextResponse.json({
      success: true,
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
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Internal server error during login' }, { status: 500 });
  }
}
