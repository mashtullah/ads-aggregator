import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get('key');
  
  if (key !== 'OSKIDO_SETUP_ALPHA_99') {
     return NextResponse.json({ message: 'Forbidden' }, { status: 403 });
  }

  const email = 'dmusuda@gmail.com';
  
  try {
    const user = await db.user.update({
        where: { email },
        data: { role: 'ADMIN' }
    });
    return NextResponse.json({ message: `Successfully promoted ${user.email} to ADMIN. PLEASE DELETE THIS FILE IMMEDIATELY.` });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
