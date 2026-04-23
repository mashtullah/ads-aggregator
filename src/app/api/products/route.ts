import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { name, price, brand, description, imageUrl, isDigital } = body;

    // Get the user's store
    const store = await db.store.findUnique({
      where: { userId: session.user.id }
    });

    if (!store) {
      return NextResponse.json({ message: 'Store not found' }, { status: 404 });
    }

    const product = await db.product.create({
      data: {
        storeId: store.id,
        name,
        price: parseFloat(price),
        brand,
        description,
        imageUrl,
        isDigital: Boolean(isDigital),
      }
    });

    return NextResponse.json({ success: true, product }, { status: 201 });
  } catch (error) {
    console.error('Product Creation Error:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    const products = await db.product.findMany({
      where: storeId ? { storeId } : undefined,
      include: {
        store: true,
      },
      orderBy: { createdAt: 'desc' }
    });

    return NextResponse.json({ products });
  } catch (error) {
    return NextResponse.json({ message: 'Error fetching products' }, { status: 500 });
  }
}
