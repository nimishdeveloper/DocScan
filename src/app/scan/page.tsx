'use client';

import React, { useState, useRef, useCallback } from 'react';
import { createTesseractWorker } from '../../lib/tesseract';
import { useRouter } from 'next/navigation';
import CameraDialog from '../../components/CameraDialog';

const ScanPage = () => {
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedText, setExtractedText] = useState('');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isCameraDialogOpen, setIsCameraDialogOpen] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleCameraCapture = (imageData: string) => {
    setCapturedImage(imageData);
    setIsCameraDialogOpen(false);
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setCapturedImage(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const processOCR = useCallback(async () => {
    if (!capturedImage) return;
    
    setIsProcessing(true);
    setProgress(0);
    setError('');
    
    try {
      const worker = await createTesseractWorker('eng');
      
      // Set up progress tracking
      const progressHandler = (m: any) => {
        if (m.status === 'recognizing text') {
          setProgress(Math.round(m.progress * 100));
        }
      };

      // Override the logger temporarily
      const { data: { text } } = await worker.recognize(capturedImage);
      
      if (!text.trim()) {
        setError('No text found in the image. Try a clearer image with better lighting.');
        return;
      }

      setExtractedText(text);
      await worker.terminate();
    } catch (err) {
      console.error('OCR processing error:', err);
      setError('Failed to extract text from image. Please try again.');
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  }, [capturedImage]);

  const saveDocument = async () => {
    if (!capturedImage || !extractedText) return;
    
    try {
      setIsSaving(true);
      
      // Convert base64 to blob
      const base64Data = capturedImage.split(',')[1];
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: 'image/jpeg' });
      
      // Create file
      const fileName = `document_${Date.now()}.jpg`;
      const file = new File([blob], fileName, { type: 'image/jpeg' });
      
      // Upload file using API
      const formData = new FormData();
      formData.append('file', file);
      
      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file');
      }
      
      const uploadResult = await uploadResponse.json();
      
      // Save document to database using API
      const saveResponse = await fetch('/api/document', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'temp-user', // TODO: Replace with actual user ID from auth
          objectKey: uploadResult.fileName,
          extractedText,
        }),
      });
      
      if (!saveResponse.ok) {
        throw new Error('Failed to save document');
      }
      
      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save document. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const resetScan = () => {
    setCapturedImage(null);
    setExtractedText('');
    setError('');
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Scan Document
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Capture or upload a document to extract text using OCR
        </p>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {!capturedImage && (
        <div className="grid md:grid-cols-2 gap-6">
          {/* Camera Option */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">📷</span>
              Use Camera
            </h2>
            
            <button
              onClick={() => setIsCameraDialogOpen(true)}
              className="w-full bg-primary-600 text-white py-3 px-4 rounded-lg hover:bg-primary-700 transition-colors flex items-center justify-center"
            >
              <span className="mr-2 text-lg">📷</span>
              Open Camera
            </button>
          </div>

          {/* File Upload Option */}
          <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              <span className="mr-2">📁</span>
              Upload File
            </h2>
            
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
              />
              <label
                htmlFor="file-upload"
                className="cursor-pointer flex flex-col items-center"
              >
                <span className="text-4xl mb-2">📄</span>
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Click to select an image file
                </span>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Captured Image Preview */}
      {capturedImage && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Captured Document</h2>
            <button
              onClick={resetScan}
              className="text-red-600 hover:text-red-700 px-3 py-1 border border-red-600 rounded hover:bg-red-50"
            >
              Reset
            </button>
          </div>
          
          <div className="flex justify-center mb-4">
            <img
              src={capturedImage}
              alt="Captured document"
              className="max-w-full max-h-96 object-contain rounded-lg border"
            />
          </div>

          {!extractedText && !isProcessing && (
            <button
              onClick={processOCR}
              disabled={isProcessing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isProcessing ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Extracting...
                </>
              ) : (
                'Extract Text'
              )}
            </button>
          )}
        </div>
      )}

      {/* Processing Progress */}
      {isProcessing && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-medium text-blue-700">Processing...</span>
            <span className="text-sm font-medium text-blue-700">{progress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-blue-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Extracted Text */}
      {extractedText && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-md">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-semibold">Extracted Text</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => navigator.clipboard.writeText(extractedText)}
                className="text-blue-600 hover:text-blue-700 px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
              >
                Copy
              </button>
              <button
                onClick={saveDocument}
                disabled={isSaving || isProcessing}
                className="bg-green-600 text-white px-4 py-1 rounded hover:bg-green-700 disabled:bg-green-300 transition-colors flex items-center"
              >
                {isSaving ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 714 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Saving...
                  </>
                ) : (
                  'Save Document'
                )}
              </button>
            </div>
          </div>
          
          <textarea
            value={extractedText}
            onChange={(e) => setExtractedText(e.target.value)}
            className="w-full h-40 p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none dark:bg-slate-700 dark:border-slate-600 dark:text-white"
            placeholder="Extracted text will appear here..."
          />
        </div>
      )}

      <CameraDialog 
        isOpen={isCameraDialogOpen}
        onClose={() => setIsCameraDialogOpen(false)}
        onCapture={handleCameraCapture}
      />
    </div>
  );
};

export default ScanPage;