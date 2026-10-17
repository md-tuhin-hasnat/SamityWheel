import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import bcrypt from 'bcryptjs';
import { createSessionCookie } from '@/lib/session';

export async function POST(req: Request) {
  try {
    const { name, phone, password } = await req.json();

    if (!name?.trim() || !phone?.trim() || !password) {
      return NextResponse.json({ error: 'Name, mobile number, and password are required' }, { status: 400 });
    }

    const cleanPhone = phone.trim();
    const existing = await db.user.findUnique({
      where: { phone: cleanPhone },
    });

    if (existing) {
      return NextResponse.json({ error: 'An account with this mobile number already exists' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await db.user.create({
      data: {
        name: name.trim(),
        phone: cleanPhone,
        password: passwordHash,
      },
    });

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
        memberships: [],
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Failed to create account' }, { status: 500 });
  }
}
