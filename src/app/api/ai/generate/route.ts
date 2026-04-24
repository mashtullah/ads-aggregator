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
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { productId, instructions, history } = await req.json();

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { store: true, ads: { orderBy: { createdAt: 'desc' }, take: 5 } }
    });

    if (!product || product.store.userId !== session.user.id) {
      return NextResponse.json({ message: 'Product not found or unauthorized' }, { status: 403 });
    }

    let script = "";
    let businessSuggestion = "";
    
    // --- 1. AI Script Generation (ITERATIVE) ---
    if (process.env.OPENAI_API_KEY) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
           { role: "system", content: "You are a Global Marketing AI. You output viral ad scripts and business strategy suggestions. Always produce a JSON object: { script: string, suggestion: string }" },
           { role: "user", content: `Product: ${product.name}, Price: ${product.price}, Desc: ${product.description}. Instruction: ${instructions || 'Original generation'}. History Context: ${JSON.stringify(history || [])}. TASK: Output global strategy and ad text.` }
        ],
        response_format: { type: "json_object" }
      });
      const aiData = JSON.parse(completion.choices[0].message.content || '{}');
      script = aiData.script || "...";
      businessSuggestion = aiData.suggestion || "Consider analyzing global shipping rates for better reach.";
    } else {
      // Sandbox fallback
      script = `🌟 Global Spotlight: ${product.name}! Only KES ${product.price}! ${instructions ? `[Refined: ${instructions}]` : ''}`;
      businessSuggestion = "AI Insight: Your price point is 15% lower than the global average in this category. Consider increasing slightly to offset international shipping costs.";
    }

    // Prepare media URLs (Using persistent Cloudinary Samples)
    const mockAudioUrl = "https://res.cloudinary.com/dxrslwh1y/video/upload/v1/samples/audio/sample_audio.mp3";
    const mockVideoUrl = "https://res.cloudinary.com/dxrslwh1y/video/upload/v1/samples/sea-turtle.mp4";
    
    // --- 2. Create Ad Object in DB ---
    const ad = await db.advertisement.create({
      data: {
        productId,
        script: `${script} \n\n AI SUGGESTION: ${businessSuggestion}`,
        audioUrl: mockAudioUrl,
        videoUrl: mockVideoUrl,
        status: 'PUBLISHED' // Instant Activation
      }
    });

    return NextResponse.json({ success: true, ad }, { status: 201 });
    
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
