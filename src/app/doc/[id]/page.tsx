'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { type Doc } from '../../../lib/database';

const DocumentDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const [document, setDocument] = useState<Doc | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  const loadDocument = useCallback(async (id: string) => {
    try {
      setLoading(true);
      const response = await fetch(`/api/document/${id}`);
      
      if (!response.ok) {
        setError('Document not found');
        return;
      }
      
      const result = await response.json();
      setDocument(result.document);
      setEditedText(result.document.extractedText);
    } catch (err) {
      console.error('Load document error:', err);
      setError('Failed to load document');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (params.id) {
      loadDocument(params.id as string);
    }
  }, [params.id, loadDocument]);

  const saveChanges = async () => {
    if (!document) return;
    
    try {
      const response = await fetch(`/api/document/${document.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          extractedText: editedText,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update document');
      }
      
      setDocument({ ...document, extractedText: editedText });
      setIsEditing(false);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save changes');
    }
  };

  const deleteDocument = async () => {
    if (!document || !confirm('Are you sure you want to delete this document?')) return;
    
    try {
      const response = await fetch(`/api/document/${document.id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete document');
      }
      
      router.push('/dashboard');
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete document');
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  if (error || !document) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <div className="text-6xl mb-4">❌</div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          {error || 'Document not found'}
        </h1>
        <button
          onClick={() => router.push('/dashboard')}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
        >
          Back to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center text-primary-600 hover:text-primary-700 mb-2"
          >
            <span className="mr-1">←</span>
            Back to Dashboard
          </button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Document Details
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Scanned on {formatDate(document.createdAt)}
          </p>
        </div>
        
        <div className="flex space-x-2">
          {!isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(true)}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Edit Text
              </button>
              <button
                onClick={() => navigator.clipboard.writeText(document.extractedText)}
                className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Copy Text
              </button>
              <button
                onClick={deleteDocument}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </>
          ) : (
            <>
              <button
                onClick={saveChanges}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors"
              >
                Save Changes
              </button>
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditedText(document.extractedText);
                }}
                className="border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Document Image */}
      {document.objectKey && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
            Original Document
          </h2>
          <div className="flex justify-center">
            <img
              src={`/api/uploads/${document.objectKey}`}
              alt="Original document"
              className="max-w-full max-h-96 object-contain rounded-lg border shadow-sm"
            />
          </div>
        </div>
      )}

      {/* Extracted Text */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Extracted Text
        </h2>
        
        {isEditing ? (
          <textarea
            value={editedText}
            onChange={(e) => setEditedText(e.target.value)}
            className="w-full h-96 p-4 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-slate-700 dark:text-white font-mono text-sm leading-relaxed"
            placeholder="Edit the extracted text..."
          />
        ) : (
          <div className="prose prose-gray dark:prose-invert max-w-none">
            <pre className="whitespace-pre-wrap bg-gray-50 dark:bg-slate-700 p-4 rounded-lg border font-mono text-sm leading-relaxed">
              {document.extractedText}
            </pre>
          </div>
        )}
      </div>

      {/* Document Metadata */}
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
          Document Information
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Document ID:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400 font-mono">
              {document.id}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Created:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {formatDate(document.createdAt)}
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Text Length:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {document.extractedText.length} characters
            </span>
          </div>
          <div>
            <span className="font-medium text-gray-700 dark:text-gray-300">Word Count:</span>
            <span className="ml-2 text-gray-600 dark:text-gray-400">
              {document.extractedText.split(/\s+/).filter(word => word.length > 0).length} words
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DocumentDetailPage;