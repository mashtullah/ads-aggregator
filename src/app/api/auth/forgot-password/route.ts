import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import { v4 as uuidv4 } from 'uuid';
import { resend, EMAIL_FROM } from '@/lib/resend';

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await db.user.findUnique({
      where: { email }
    });

    if (!user) {
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

    const resetLink = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;
    
    // SEND ACTUAL EMAIL VIA RESEND
    await resend.emails.send({
      from: EMAIL_FROM,
      to: email,
      subject: 'Reset Your Oskido Password',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #39FF14;">Oskido.</h2>
          <p>Hello,</p>
          <p>We received a request to reset your password. Click the button below to set a new one:</p>
          <a href="${resetLink}" style="display: inline-block; padding: 12px 24px; background-color: #39FF14; color: black; text-decoration: none; border-radius: 5px; font-weight: bold; margin: 20px 0;">Reset Password</a>
          <p style="font-size: 0.8rem; color: #666;">This link will expire in 1 hour. If you didn't request this, you can safely ignore this email.</p>
        </div>
      `
    });

    return NextResponse.json({ message: 'A password reset link has been sent to your email.' });
  } catch (error: any) {
    console.error('Resend Error:', error);
    return NextResponse.json({ message: 'Error processing request' }, { status: 500 });
  }
}
