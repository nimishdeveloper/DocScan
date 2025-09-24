'use client';

import React, { useState, useRef, useEffect } from 'react';

interface CameraDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageData: string) => void;
}

const CameraDialog: React.FC<CameraDialogProps> = ({ isOpen, onClose, onCapture }) => {
  const [isCamera, setIsCamera] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [error, setError] = useState('');
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const startCamera = async () => {
    try {
      setIsStartingCamera(true);
      setError('');

      // Check if mediaDevices is supported
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera not supported in this browser');
      }

      // Check camera permissions first
      try {
        const permissionStatus = await navigator.permissions.query({ name: 'camera' as PermissionName });
        console.log('Camera permission status:', permissionStatus.state);
      } catch (permErr) {
        console.log('Permission query not supported, trying direct access');
      }

      const constraints = {
        video: {
          facingMode: { ideal: 'environment' }, // Prefer rear camera
          width: { ideal: 1280, max: 1920 },
          height: { ideal: 720, max: 1080 }
        }
      };

      console.log('Requesting camera access with constraints:', constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        
        // Wait for video to be ready
        await new Promise((resolve) => {
          videoRef.current!.onloadedmetadata = () => {
            resolve(true);
          };
        });
        
        await videoRef.current.play();
        setIsCamera(true);
        console.log('Camera started successfully');
      }
    } catch (err: any) {
      console.error('Camera access error details:', {
        name: err.name,
        message: err.message,
        constraint: err.constraint,
        stack: err.stack
      });
      
      let errorMessage = 'Unable to access camera. ';
      
      if (err.name === 'NotAllowedError') {
        errorMessage += 'Please allow camera permissions and try again.';
      } else if (err.name === 'NotFoundError') {
        errorMessage += 'No camera found on this device.';
      } else if (err.name === 'NotSupportedError') {
        errorMessage += 'Camera not supported in this browser.';
      } else if (err.name === 'NotReadableError') {
        errorMessage += 'Camera is already in use or unavailable. Please close other apps using the camera and try again.';
        
        // For NotReadableError, also try with very basic constraints
        try {
          console.log('Attempting basic camera access for NotReadableError...');
          const basicStream = await navigator.mediaDevices.getUserMedia({ 
            video: { 
              width: { ideal: 640 },
              height: { ideal: 480 }
            } 
          });
          streamRef.current = basicStream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = basicStream;
            
            // Wait for video to be ready 
            await new Promise((resolve) => {
              videoRef.current!.onloadedmetadata = () => {
                resolve(true);
              };
            });
            
            await videoRef.current.play();
            setIsCamera(true);
            console.log('Camera started with basic constraints after NotReadableError');
            return;
          }
        } catch (basicErr) {
          console.error('Basic camera access also failed:', basicErr);
        }
      } else if (err.name === 'OverconstrainedError') {
        errorMessage += 'Camera constraints not supported. Trying with basic settings...';
        
        // Try with simpler constraints
        try {
          const simpleStream = await navigator.mediaDevices.getUserMedia({ video: true });
          streamRef.current = simpleStream;
          
          if (videoRef.current) {
            videoRef.current.srcObject = simpleStream;
            
            // Wait for video to be ready (mirror metadata-await logic)
            await new Promise((resolve) => {
              videoRef.current!.onloadedmetadata = () => {
                resolve(true);
              };
            });
            
            await videoRef.current.play();
            setIsCamera(true);
            console.log('Camera started with simple constraints');
            return;
          }
        } catch (simpleErr) {
          console.error('Simple camera access also failed:', simpleErr);
        }
      } else {
        errorMessage += `Error: ${err.message || 'Unknown camera error'}`;
      }
      
      setError(errorMessage);
    } finally {
      setIsStartingCamera(false);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCamera(false);
  };

  const captureImage = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    
    if (video && canvas) {
      const context = canvas.getContext('2d');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      if (context) {
        context.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL('image/jpeg', 0.8);
        setCapturedImage(imageData);
        stopCamera();
      }
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
    startCamera();
  };

  const usePhoto = () => {
    if (capturedImage) {
      onCapture(capturedImage);
      handleClose();
    }
  };

  const handleClose = () => {
    stopCamera();
    setCapturedImage(null);
    setError('');
    onClose();
  };

  // Start camera when dialog opens
  useEffect(() => {
    if (isOpen && !isCamera && !capturedImage) {
      startCamera();
    }
  }, [isOpen]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, []);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-slate-600">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            📷 Camera
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              <p className="mb-3">{error}</p>
              <button
                onClick={startCamera}
                className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors text-sm"
              >
                Retry Camera
              </button>
            </div>
          )}

          {/* Camera Loading State */}
          {isStartingCamera && (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-300">Starting camera...</p>
            </div>
          )}

          {/* Live Camera Feed */}
          {isCamera && !capturedImage && (
            <div className="space-y-4">
              <div className="relative">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg border-2 border-primary-300"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
                  <p className="text-white bg-black bg-opacity-50 px-3 py-2 rounded text-sm">
                    📄 Position your document in the frame
                  </p>
                </div>
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={captureImage}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center font-semibold"
                >
                  <span className="mr-2 text-lg">📸</span>
                  Capture
                </button>
                <button
                  onClick={handleClose}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {/* Captured Image Preview */}
          {capturedImage && (
            <div className="space-y-4">
              <div className="flex justify-center">
                <img
                  src={capturedImage}
                  alt="Captured document"
                  className="max-w-full max-h-96 object-contain rounded-lg border"
                />
              </div>
              
              <div className="flex justify-center space-x-4">
                <button
                  onClick={usePhoto}
                  className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center font-semibold"
                >
                  <span className="mr-2">✓</span>
                  Use Photo
                </button>
                <button
                  onClick={retakePhoto}
                  className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
                >
                  <span className="mr-2">↻</span>
                  Retake
                </button>
                <button
                  onClick={handleClose}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          <canvas ref={canvasRef} className="hidden" />
        </div>
      </div>
    </div>
  );
};

export default CameraDialog;