import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized. You must be logged in to message.' }, { status: 401 });
    }

    const { storeId, content } = await req.json();

    if (!content || content.trim() === '') {
      return NextResponse.json({ message: 'Message cannot be empty' }, { status: 400 });
    }

    const message = await db.message.create({
      data: {
        storeId,
        senderId: session.user.id,
        content: content.trim(),
      },
    });

    // Create a notification for the store owner
    const store = await db.store.findUnique({
      where: { id: storeId },
      select: { userId: true, name: true }
    });

    if (store) {
      await db.notification.create({
        data: {
          userId: store.userId,
          title: 'New Message',
          message: `You have a new message from ${session.user.name} regarding your store ${store.name}.`,
          link: '/dashboard/inbox',
        }
      });
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    console.error('Messaging Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
