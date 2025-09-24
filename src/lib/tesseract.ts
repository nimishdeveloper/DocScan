import { createWorker } from 'tesseract.js';

// Configure Tesseract worker paths for production builds
export const createTesseractWorker = async (language = 'eng') => {
  const worker = await createWorker(language, 1, {
    workerPath: 'https://cdn.jsdelivr.net/npm/tesseract.js@6/dist/worker.min.js',
    langPath: 'https://tessdata.projectnaptha.com/4.0.0',
    corePath: 'https://cdn.jsdelivr.net/npm/tesseract.js-core@6/tesseract-core.wasm.js',
    logger: (m) => {
      if (process.env.NODE_ENV === 'development') {
        console.log('Tesseract:', m);
      }
    },
  });

  return worker;
};

// Helper function for common OCR operations
export const extractTextFromImage = async (image: File | string, language = 'eng') => {
  const worker = await createTesseractWorker(language);
  
  try {
    const { data: { text } } = await worker.recognize(image);
    return text;
  } finally {
    await worker.terminate();
  }
};