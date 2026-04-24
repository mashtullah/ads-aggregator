import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { token, password } = await req.json();

    const resetToken = await db.resetToken.findUnique({
      where: { token },
      include: { user: true }
    });

    if (!resetToken || resetToken.expires < new Date()) {
      return NextResponse.json({ message: 'Invalid or expired token' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Use a transaction since we ARE using a transactional DB
    await db.$transaction([
      db.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      }),
      db.resetToken.delete({
        where: { id: resetToken.id }
      })
    ]);

    return NextResponse.json({ success: true, message: 'Password reset successful' });
  } catch (error) {
    return NextResponse.json({ message: 'Error resetting password' }, { status: 500 });
  }
}
