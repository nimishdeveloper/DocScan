'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function HomePage() {
  const [isNavigating, setIsNavigating] = useState(false);
  const router = useRouter();

  const handleStartScanning = async () => {
    setIsNavigating(true);
    router.push('/scan');
  };

  return (
    <div className="max-w-4xl mx-auto text-center">
      {/* Hero Section */}
      <div className="mb-12">
        <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6">
          Scan Documents 
          <span className="block text-primary-600 dark:text-primary-400">
            Extract Text
          </span>
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
          Use your device camera to capture documents and automatically extract text using advanced OCR technology. 
          Perfect for digitizing receipts, notes, and important documents.
        </p>
      </div>

      {/* Features Grid */}
      <div className="grid md:grid-cols-3 gap-8 mb-12">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">📷</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Camera Capture
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Access your device camera to capture high-quality images of documents
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">🤖</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            OCR Processing
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Advanced text recognition to extract content from your scanned documents
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow">
          <div className="text-4xl mb-4">💾</div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
            Cloud Storage
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            Securely store your documents and extracted text in the cloud
          </p>
        </div>
      </div>

      {/* CTA Button */}
      <div className="space-y-4">
        <button 
          onClick={handleStartScanning}
          disabled={isNavigating}
          className="inline-flex items-center justify-center px-8 py-4 text-lg font-semibold text-white bg-primary-600 hover:bg-primary-700 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-1 disabled:opacity-70 disabled:cursor-not-allowed"
        >
          {isNavigating ? (
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          ) : (
            <span className="mr-2 text-xl">📸</span>
          )}
          {isNavigating ? 'Loading...' : 'Start Scanning Documents'}
        </button>
        
        <p className="text-sm text-gray-500 dark:text-gray-400">
          No sign-up required to try • Works on mobile and desktop
        </p>
      </div>
    </div>
  );
}