import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import { resend, EMAIL_FROM } from '@/lib/resend';

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

    // Notify the store owner
    const store = await db.store.findUnique({
      where: { id: storeId },
      include: { user: { select: { email: true, id: true } } }
    });

    if (store && store.user.email) {
      // 1. In-app Notification
      await db.notification.create({
        data: {
          userId: store.user.id,
          title: 'New Inquiry 📩',
          message: `${session.user.name} sent a message about ${store.name}`,
          link: '/dashboard/inbox',
        }
      });

      // 2. Real Email Notification via Resend
      await resend.emails.send({
        from: EMAIL_FROM,
        to: store.user.email,
        subject: `[Oskido] New Inquiry from ${session.user.name}`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #333; background: #000; color: white; border-radius: 10px;">
            <h2 style="color: #39FF14;">New Inquiry</h2>
            <p><strong>From:</strong> ${session.user.name} (${session.user.email})</p>
            <p style="background: #111; padding: 15px; border-radius: 8px; border-left: 4px solid #39FF14;">
              "${content.trim()}"
            </p>
            <a href="${process.env.NEXTAUTH_URL}/dashboard/inbox" style="display: inline-block; padding: 12px 24px; background-color: #39FF14; color: black; text-decoration: none; border-radius: 5px; font-weight: bold; margin-top: 20px;">Reply in Dashboard</a>
          </div>
        `
      });
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    console.error('Messaging Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
