import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function PUT(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const body = await req.json();
    const { id, name, price, brand, description, imageUrl, isDigital } = body;

    const product = await db.product.findUnique({
      where: { id },
      include: { store: true }
    });

    if (!product || product.store.userId !== session.user.id) {
       return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        name,
        price: parseFloat(price),
        brand,
        description,
        imageUrl,
        isDigital: Boolean(isDigital)
      }
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error updating product', error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
    try {
      const session = await getServerSession(authOptions);
      if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  
      const { searchParams } = new URL(req.url);
      const id = searchParams.get('id');
  
      const product = await db.product.findUnique({
        where: { id: id! },
        include: { store: true }
      });
  
      if (!product || product.store.userId !== session.user.id) {
         return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
      }
  
      await db.product.delete({ where: { id: id! } });
  
      return NextResponse.json({ success: true });
    } catch (error: any) {
      return NextResponse.json({ message: 'Error deleting product' }, { status: 500 });
    }
}
