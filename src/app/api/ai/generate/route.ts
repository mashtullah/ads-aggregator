import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { db } from '@/lib/prisma';
import OpenAI from 'openai';
import ffmpeg from 'fluent-ffmpeg';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY || 'fake-mock-key', // Defaults for sandbox
});

// Helper to spawn a dummy .mp4 file since ffmpeg might not be installed on host system
async function createMockVideo(pathUrl: string) {
  // Just writes an empty text buffer renamed to .mp4 to prevent crashing the "sandbox".
  await writeFile(pathUrl, Buffer.from('Mock Video Content'));
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
    }

    const { productId, instructions } = await req.json();

    const product = await db.product.findUnique({
      where: { id: productId },
      include: { store: true }
    });

    if (!product || product.store.userId !== session.user.id) {
      return NextResponse.json({ message: 'Product not found or unauthorized' }, { status: 403 });
    }

    let script = "";
    
    // --- 1. AI Script Generation ---
    if (process.env.OPENAI_API_KEY) {
      const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
           { role: "system", content: "You are an expert marketing copywriter producing concise, viral social media video ads." },
           { role: "user", content: `Create a 15-second ad script for my product named '${product.name}' priced at ${product.price}. Description: ${product.description}. Extra instructions: ${instructions || 'Make it exciting!'}` }
        ]
      });
      script = completion.choices[0].message.content || "...";
      
      // Realistically we would pipe OpenAI TTS -> DALL-E 3 -> Fluent-ffmpeg here!
    } else {
      // Sandbox fallback
      script = `🌟 Check out ${product.name}! Only KES ${product.price}! ${instructions ? `[Refined: ${instructions}]` : ''} Get yours today!`;
    }

    // Prepare media directories
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

    const mediaId = uuidv4();
    const mockAudioUrl = `/uploads/audio-${mediaId}.mp3`;
    const mockVideoUrl = `/uploads/ad-${mediaId}.mp4`;
    
    const audioPathDesktop = join(uploadDir, `audio-${mediaId}.mp3`);
    const videoPathDesktop = join(uploadDir, `ad-${mediaId}.mp4`);

    // --- 2. Create Ad Object in DB ---
    const ad = await db.advertisement.create({
      data: {
        productId,
        script,
        audioUrl: mockAudioUrl,
        videoUrl: mockVideoUrl,
        status: 'GENERATED'
      }
    });

    // --- 3. Dummy Media Placement for Sandbox UI ---
    // Instead of completely hanging if fluent-ffmpeg crashes on host PC due to missing binaries, we write stubs reliably
    await writeFile(audioPathDesktop, Buffer.from('mock audio buffer'));
    await createMockVideo(videoPathDesktop);

    return NextResponse.json({ success: true, ad }, { status: 201 });
    
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    return NextResponse.json({ message: 'Internal Server Error', error: error.message }, { status: 500 });
  }
}
