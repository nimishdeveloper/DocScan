import { NextRequest, NextResponse } from 'next/server';
import { db, docs } from '@/lib/database';
import { getDocumentSignedUrl, deleteDocument as deleteFromStorage } from '@/server/supabase';
import { eq } from 'drizzle-orm';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get document from database
    const result = await db.select().from(docs)
      .where(eq(docs.id, id))
      .limit(1);
    
    if (result.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = result[0];

    // Generate signed URL for document access
    const fileUrl = await getDocumentSignedUrl(document.objectKey);

    return NextResponse.json({
      document: {
        ...document,
        fileUrl
      }
    });

  } catch (error) {
    console.error('Document fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch document' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { extractedText } = await request.json();
    
    if (!extractedText) {
      return NextResponse.json({ error: 'Extracted text is required' }, { status: 400 });
    }

    // Update document in database
    const result = await db.update(docs)
      .set({ extractedText })
      .where(eq(docs.id, id))
      .returning();

    if (result.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    return NextResponse.json({
      document: result[0],
      message: 'Document updated successfully'
    });

  } catch (error) {
    console.error('Document update error:', error);
    return NextResponse.json({ error: 'Failed to update document' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Get document first to retrieve objectKey
    const docResult = await db.select().from(docs)
      .where(eq(docs.id, id))
      .limit(1);

    if (docResult.length === 0) {
      return NextResponse.json({ error: 'Document not found' }, { status: 404 });
    }

    const document = docResult[0];

    // Delete file from Supabase storage
    try {
      await deleteFromStorage(document.objectKey);
    } catch (storageError) {
      console.error('Storage deletion error:', storageError);
      // Continue with database deletion even if storage fails
    }
    
    // Delete document from database
    await db.delete(docs).where(eq(docs.id, id));
    
    return NextResponse.json({
      message: 'Document deleted successfully'
    });

  } catch (error) {
    console.error('Document delete error:', error);
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 });
  }
}