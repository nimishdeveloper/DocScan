'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { type Doc } from '../../lib/database';

// Type for documents with signed URLs from API
type DocumentWithUrl = Doc & { fileUrl?: string };

const DashboardPage = () => {
  const [documents, setDocuments] = useState<DocumentWithUrl[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleScanNew = () => {
    setIsNavigating(true);
    router.push('/scan');
  };

  useEffect(() => {
    loadDocuments();
  }, []);

  const loadDocuments = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/document?userId=temp-user');
      
      if (!response.ok) {
        throw new Error('Failed to fetch documents');
      }
      
      const result = await response.json();
      setDocuments(result.documents);
    } catch (err) {
      console.error('Load documents error:', err);
      setError('Failed to load documents');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const truncateText = (text: string, maxLength = 100) => {
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Document Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-300 mt-1">
            Manage your scanned documents and extracted text
          </p>
        </div>
        
        <button
          onClick={handleScanNew}
          disabled={isNavigating}
          className="bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors flex items-center disabled:opacity-70"
        >
          {isNavigating ? (
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span className="mr-2">📸</span>
          )}
          {isNavigating ? 'Loading...' : 'Scan New Document'}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Documents Grid */}
      {documents.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📄</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No documents yet
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Start by scanning your first document to see it here
          </p>
          <Link
            href="/scan"
            className="inline-flex items-center bg-primary-600 text-white px-6 py-3 rounded-lg hover:bg-primary-700 transition-colors"
          >
            <span className="mr-2">📸</span>
            Scan Your First Document
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="bg-white dark:bg-slate-800 rounded-xl shadow-md hover:shadow-lg transition-shadow overflow-hidden"
            >
              {/* Document Image */}
              <div className="aspect-video bg-gray-100 dark:bg-slate-700 flex items-center justify-center">
                {doc.fileUrl ? (
                  <img
                    src={doc.fileUrl}
                    alt="Document thumbnail"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-4xl text-gray-400">📄</div>
                )}
              </div>

              {/* Document Info */}
              <div className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900 dark:text-white text-sm">
                    Document {doc.id.slice(0, 8)}...
                  </h3>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {formatDate(doc.createdAt)}
                  </span>
                </div>

                <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 leading-relaxed">
                  {truncateText(doc.extractedText)}
                </p>

                <div className="flex space-x-2">
                  <Link
                    href={`/doc/${doc.id}`}
                    className="flex-1 bg-blue-600 text-white text-sm py-2 px-3 rounded text-center hover:bg-blue-700 transition-colors"
                  >
                    View Full
                  </Link>
                  <button
                    onClick={() => navigator.clipboard.writeText(doc.extractedText)}
                    className="flex-1 border border-gray-300 dark:border-slate-600 text-gray-700 dark:text-gray-300 text-sm py-2 px-3 rounded hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                  >
                    Copy Text
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Stats */}
      {documents.length > 0 && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <h2 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
            Statistics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600">
                {documents.length}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Total Documents
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {documents.reduce((acc, doc) => acc + doc.extractedText.length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Characters Extracted
              </div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {documents.reduce((acc, doc) => acc + doc.extractedText.split(' ').length, 0)}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-300">
                Words Extracted
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DashboardPage;