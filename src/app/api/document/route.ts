import { NextRequest, NextResponse } from 'next/server';
import { db, docs } from '@/lib/database';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const { userId, objectKey, extractedText } = await request.json();
    
    if (!userId || !objectKey || !extractedText) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Save document record to database
    const newDoc = await db.insert(docs).values({
      userId,
      objectKey,
      extractedText
    }).returning();

    return NextResponse.json({
      document: newDoc[0],
      message: 'Document saved successfully'
    });

  } catch (error) {
    console.error('Document save error:', error);
    return NextResponse.json({ error: 'Failed to save document' }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    // Get user's documents
    const userDocs = await db.select().from(docs)
      .where(eq(docs.userId, userId))
      .orderBy(docs.createdAt);

    // Generate file URLs for local storage
    const docsWithUrls = userDocs.map((doc) => {
      return {
        ...doc,
        fileUrl: `/api/uploads/${doc.objectKey}`
      };
    });

    return NextResponse.json({ documents: docsWithUrls });

  } catch (error) {
    console.error('Documents fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 });
  }
}