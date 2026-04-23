import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');

    if (!id) return NextResponse.json({ message: 'Missing ID' }, { status: 400 });

    const product = await db.product.findUnique({
      where: { id },
      include: { 
          ads: { orderBy: { createdAt: 'desc' } },
          store: true
      }
    });

    if (!product || product.store.userId !== session.user.id) {
       return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    return NextResponse.json({ product });
  } catch (err: any) {
    return NextResponse.json({ message: 'Error', error: err.message }, { status: 500 });
  }
}
