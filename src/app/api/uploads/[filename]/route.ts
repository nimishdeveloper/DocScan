import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { existsSync } from 'fs';

export async function GET(
  request: NextRequest,
  { params }: { params: { filename: string } }
) {
  try {
    const { filename } = params;
    
    // Sanitize filename to prevent directory traversal (preserve underscores for nanoid)
    const sanitizedFilename = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    
    const filePath = join(process.cwd(), 'uploads', sanitizedFilename);
    
    if (!existsSync(filePath)) {
      return new NextResponse('File not found', { status: 404 });
    }

    const fileBuffer = await readFile(filePath);
    
    // Determine content type based on file extension
    const extension = sanitizedFilename.split('.').pop()?.toLowerCase();
    let contentType = 'application/octet-stream';
    
    switch (extension) {
      case 'jpg':
      case 'jpeg':
        contentType = 'image/jpeg';
        break;
      case 'png':
        contentType = 'image/png';
        break;
      case 'gif':
        contentType = 'image/gif';
        break;
      case 'webp':
        contentType = 'image/webp';
        break;
    }

    return new NextResponse(fileBuffer as unknown as BodyInit, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000'
      }
    });

  } catch (error) {
    console.error('File serve error:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
}