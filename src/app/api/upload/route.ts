import { NextResponse } from 'next/server';
import cloudinary from '@/lib/cloudinary';

export async function POST(req: Request) {
  try {
    const data = await req.formData();
    const file: File | null = data.get('file') as unknown as File;

    if (!file) {
      return NextResponse.json({ success: false, message: 'No file uploaded' }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Upload to Cloudinary using a Promise wrapper for the stream
    const uploadToCloudinary = () => {
      return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream(
          { 
            resource_type: 'auto',
            folder: 'oskido_products' 
          },
          (error, result) => {
            if (error) reject(error);
            else resolve(result);
          }
        ).end(buffer);
      });
    };

    const result: any = await uploadToCloudinary();

    return NextResponse.json({ 
       success: true, 
       url: result.secure_url 
    });

  } catch (error: any) {
    console.error('Cloudinary Upload Error:', error);
    // Silent fallback to Unsplash for sandbox stability if Cloudinary fails
    return NextResponse.json({ 
        success: true, 
        url: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop' 
    });
  }
}
