# Document Scanner Web App

## Overview

A web-based document scanning application that allows users to capture images of documents using their device camera and extract text using OCR (Optical Character Recognition) technology. The app is built with Next.js, uses Tesseract.js for OCR processing, and stores documents and extracted text in a PostgreSQL database with file storage via Supabase.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: Next.js 14 with TypeScript for type safety and modern React features
- **Styling**: Tailwind CSS with custom color scheme and dark mode support
- **UI Components**: Custom React components with responsive design
- **State Management**: React hooks for local state management
- **Navigation**: Next.js App Router with client-side navigation

### Backend Architecture
- **API Routes**: Next.js API routes for document management and file uploads
- **Database ORM**: Drizzle ORM for type-safe database operations
- **File Processing**: Server-side image processing and validation
- **Error Handling**: Comprehensive error handling with user-friendly messages

### Data Storage Solutions
- **Database**: PostgreSQL with Drizzle ORM schema
- **File Storage**: Supabase Storage for document images
- **Schema Design**: 
  - Documents table with UUID primary keys
  - User-based document organization
  - Extracted text storage alongside metadata

### Authentication and Authorization
- **User Identification**: Simple user ID based system
- **Data Isolation**: User-specific document retrieval
- **File Access**: Signed URLs for secure document access with time-based expiration

### OCR Processing
- **Engine**: Tesseract.js for client-side OCR processing
- **Configuration**: CDN-based worker and language files for production reliability
- **Processing Flow**: Image capture → OCR extraction → database storage
- **Language Support**: Configurable language detection (default: English)

### Camera Integration
- **Media Capture**: WebRTC getUserMedia API for camera access
- **Image Processing**: HTML5 Canvas for image manipulation
- **Device Support**: Responsive design for both mobile and desktop
- **Fallback Options**: File upload alternative for devices without camera access

## External Dependencies

### Core Services
- **Supabase**: Used for file storage and potentially authentication (configured for both client and server-side operations)
- **PostgreSQL**: Primary database for document metadata and extracted text storage

### OCR and Processing
- **Tesseract.js**: Client-side OCR engine with CDN-hosted workers and language data
- **Canvas API**: Browser-native image processing capabilities

### Development Tools
- **Drizzle Kit**: Database schema management and migrations
- **TypeScript**: Static type checking and enhanced developer experience
- **ESLint**: Code quality and consistency enforcement

### UI and Styling
- **Tailwind CSS**: Utility-first CSS framework with custom theme
- **Inter Font**: Google Fonts integration for consistent typography
- **Autoprefixer**: CSS vendor prefix management

### Utilities
- **nanoid**: Unique identifier generation for file naming
- **postgres**: Direct PostgreSQL client for database connections