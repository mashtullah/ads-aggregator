import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'fake-mock-key',
});

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });

    const { adId } = await req.json();

    const ad = await db.advertisement.findUnique({
      where: { id: adId },
      include: { product: true }
    });

    if (!ad) return NextResponse.json({ message: 'Ad not found' }, { status: 404 });

    let targeting;
    if (process.env.OPENAI_API_KEY) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
           { role: "system", content: "You are a Meta Ads Targeting specialist. Given a product and ad, output a strict JSON summarizing the optimal audience: { ageRange: string, locations: string[], interests: string[] }" },
           { role: "user", content: `Product: ${ad.product.name}. Description: ${ad.product.description}. Script: ${ad.script}` }
        ],
        response_format: { type: "json_object" }
      });
      targeting = JSON.parse(completion.choices[0].message.content || '{}');
    } else {
      targeting = {
        ageRange: "18-35",
        locations: ["Nairobi", "Mombasa", "Kisumu"],
        interests: ["Online Shopping", "Technology", ad.product.brand || "General Retail"]
      };
    }

    return NextResponse.json({ success: true, targeting });
  } catch (error: any) {
    return NextResponse.json({ message: 'Error', error: error.message }, { status: 500 });
  }
}
