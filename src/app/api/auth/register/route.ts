import { NextResponse } from 'next/server';
import { db } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(req: Request) {
  try {
    const { name, email, password, storeName } = await req.json();

    if (!name || !email || !password || !storeName) {
      return NextResponse.json({ message: 'Missing fields' }, { status: 400 });
    }

    const existingUser = await db.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Slugify storeName
    const slug = storeName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');

    const existingStore = await db.store.findUnique({
      where: { slug }
    });

    if (existingStore) {
      return NextResponse.json({ message: 'Store name already taken' }, { status: 400 });
    }

    const user = await db.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        store: {
          create: {
            name: storeName,
            slug,
          }
        }
      },
      include: {
        store: true
      }
    });

    return NextResponse.json({ message: 'User and Store created successfully', user: { id: user.id } }, { status: 201 });
  } catch (error) {
    console.error('Registration Error:', error);
    return NextResponse.json({ message: 'An error occurred during registration' }, { status: 500 });
  }
}
