import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

async function checkAdmin() {
  const session = await getServerSession(authOptions);
  return session && (session.user as any).role === 'ADMIN';
}

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await checkAdmin()) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
  const store = await db.store.findUnique({
    where: { id },
    include: { user: true }
  });

  return NextResponse.json({ store });
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!await checkAdmin()) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

  const { name, isVerified, newPassword } = await req.json();

  const store = await db.store.findUnique({ where: { id } });
  if (!store) return NextResponse.json({ message: 'Not found' }, { status: 404 });

  const data: any = { name, isVerified };
  
  if (newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await db.user.update({
      where: { id: store.userId },
      data: { password: hashedPassword }
    });
  }

  const updated = await db.store.update({
    where: { id },
    data
  });

  return NextResponse.json({ success: true, store: updated });
}
