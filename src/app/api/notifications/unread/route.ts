import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ count: 0 });

    const count = await db.notification.count({
      where: { userId: session.user.id, isRead: false }
    });

    return NextResponse.json({ count });
  } catch (err) {
    return NextResponse.json({ count: 0 });
  }
}
