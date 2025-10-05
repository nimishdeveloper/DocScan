import 'server-only';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl) {
  throw new Error('NEXT_PUBLIC_SUPABASE_URL environment variable is required');
}

if (!supabaseServiceKey) {
  throw new Error('SUPABASE_SERVICE_ROLE_KEY environment variable is required');
}

// Server-side client for secure operations (file uploads, etc.)
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

// Generate signed URL for secure document access
export const getDocumentSignedUrl = async (objectKey: string) => {
  const { data, error } = await supabaseAdmin.storage
    .from('documents')
    .createSignedUrl(objectKey, 3600); // 1 hour expiry

  if (error) throw error;
  return data.signedUrl;
};

// Upload file to storage
export const uploadDocument = async (file: ArrayBuffer, fileName: string, contentType: string) => {
  const { data, error } = await supabaseAdmin.storage
    .from('documents')
    .upload(fileName, file, {
      contentType,
      duplex: 'half'
    });

  if (error) throw error;
  return data;
};

// Delete file from storage
export const deleteDocument = async (objectKey: string) => {
  const { data, error } = await supabaseAdmin.storage
    .from('documents')
    .remove([objectKey]);

  if (error) throw error;
  return data;
};