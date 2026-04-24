import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Security best practice: don't reveal if user exists
      return NextResponse.json({ message: 'If an account exists with that email, a password reset link has been sent.' });
    }

    const token = uuidv4();
    const expires = new Date(Date.now() + 3600000); // 1 hour expiration

    await db.resetToken.create({
      data: {
        userId: user.id,
        token,
        expires
      }
    });

    // In a real app, send email here. Log to console for now so user can see it in logs.
    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    console.log(`[PASSWORD RESET] For ${email}: ${resetLink}`);

    return NextResponse.json({ message: 'A password reset link has been sent to your email.' });
  } catch (error) {
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
