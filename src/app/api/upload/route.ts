import { NextRequest, NextResponse } from 'next/server';
import { nanoid } from 'nanoid';
import { uploadDocument } from '@/server/supabase';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Only image files are allowed' }, { status: 400 });
    }

    // Validate file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 10MB' }, { status: 400 });
    }

    // Generate unique filename
    const fileExtension = file.name.split('.').pop();
    const fileName = `${nanoid()}.${fileExtension}`;
    
    // Upload to Supabase Storage (persistent and Vercel-compatible)
    const arrayBuffer = await file.arrayBuffer();
    const uploadRes = await uploadDocument(arrayBuffer, fileName, file.type);

    return NextResponse.json({
      fileName: fileName,
      objectKey: fileName,
      storagePath: uploadRes.path,
      message: 'File uploaded successfully'
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}