# Document Scanner - OCR Web App

A modern document scanning web application with OCR (Optical Character Recognition) functionality built with Next.js, TailwindCSS, Tesseract.js, and Supabase.

## Features

- 📷 **Camera Capture** - Use device camera to capture documents
- 📁 **File Upload** - Upload existing images for text extraction
- 🤖 **OCR Processing** - Extract text from images using Tesseract.js
- 💾 **Cloud Storage** - Store documents in Supabase Storage
- 📊 **Dashboard** - View and manage all scanned documents
- 🌙 **Dark Mode** - Beautiful UI with dark mode support

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS
- **OCR**: Tesseract.js
- **Database**: PostgreSQL (via Drizzle ORM)
- **Storage**: Supabase Storage
- **Deployment**: Vercel

## Prerequisites

Before running this project, ensure you have:

- Node.js 18+ installed
- A Supabase account and project
- npm or yarn package manager

## Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
DATABASE_URL=your_supabase_database_url_here
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

### Getting Supabase Credentials

1. Go to [Supabase Dashboard](https://app.supabase.com/)
2. Create a new project or select existing one
3. Navigate to **Project Settings** → **API**
4. Copy the following:
   - `NEXT_PUBLIC_SUPABASE_URL`: Project URL
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: anon/public key
   - `SUPABASE_SERVICE_ROLE_KEY`: service_role key (keep secret!)
5. Navigate to **Project Settings** → **Database**
6. Copy the connection string for `DATABASE_URL`

### Setting up Supabase Storage

1. In Supabase Dashboard, go to **Storage**
2. Create a new bucket named `documents`
3. Set the bucket to **Public** or configure appropriate policies

### Setting up Database

Run the following commands to set up your database schema:

```bash
# Generate migration files
npm run db:generate

# Push schema to database
npm run db:push
```

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd DocScan
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables (see above)

4. Run database migrations:
```bash
npm run db:push
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:5000](http://localhost:5000) in your browser

## Available Scripts

- `npm run dev` - Start development server on port 5000
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run db:generate` - Generate Drizzle migration files
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio (database GUI)

## Deployment to Vercel

### Quick Deploy

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/yourusername/docscan)

### Manual Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Login to Vercel:
```bash
vercel login
```

3. Deploy:
```bash
vercel
```

4. Set environment variables in Vercel Dashboard:
   - Go to your project settings
   - Navigate to **Environment Variables**
   - Add all variables from `.env.local`

5. Redeploy to apply environment variables:
```bash
vercel --prod
```

### Important Vercel Configuration

The app is configured for Vercel deployment with:
- Supabase Storage for file uploads (serverless-compatible)
- PostgreSQL database connection
- Optimized Next.js build settings

## Project Structure

```
DocScan/
├── src/
│   ├── app/              # Next.js App Router pages
│   │   ├── api/          # API routes
│   │   │   ├── document/ # Document CRUD operations
│   │   │   ├── upload/   # File upload handler
│   │   │   └── uploads/  # (Legacy - not used in production)
│   │   ├── dashboard/    # Dashboard page
│   │   ├── doc/          # Individual document view
│   │   ├── scan/         # Scan page
│   │   └── layout.tsx    # Root layout
│   ├── components/       # React components
│   │   ├── CameraDialog.tsx
│   │   └── Navigation.tsx
│   ├── lib/              # Utilities and configurations
│   │   ├── database.ts   # Drizzle ORM schema
│   │   ├── supabase.ts   # Supabase client
│   │   └── tesseract.ts  # OCR configuration
│   └── server/           # Server-only code
│       └── supabase.ts   # Server-side Supabase client
├── drizzle/              # Database migrations
├── public/               # Static assets
└── uploads/              # (Local dev only - not used in production)
```

## Usage

1. **Scan a Document**:
   - Click "Start Scanning Documents" on homepage
   - Choose to use camera or upload a file
   - Capture/select your document image

2. **Extract Text**:
   - Click "Extract Text" to run OCR
   - Wait for processing to complete
   - Edit extracted text if needed

3. **Save Document**:
   - Click "Save Document" to store in database
   - View saved documents in Dashboard

4. **Manage Documents**:
   - Navigate to Dashboard to see all documents
   - View full document details
   - Copy extracted text to clipboard

## Troubleshooting

### Camera Not Working
- Ensure HTTPS is enabled (required for camera access)
- Check browser permissions for camera access
- Try using file upload as alternative

### Database Connection Issues
- Verify `DATABASE_URL` is correct
- Ensure Supabase project is active
- Check database migrations are applied

### File Upload Errors
- Verify Supabase Storage bucket `documents` exists
- Check `SUPABASE_SERVICE_ROLE_KEY` is set correctly
- Ensure bucket has appropriate access policies

## License

ISC

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
