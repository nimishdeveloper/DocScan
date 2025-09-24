import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, uuid, text, timestamp, varchar } from 'drizzle-orm/pg-core';

// Database connection
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is not set');
}

const client = postgres(connectionString, { prepare: false });
export const db = drizzle(client);

// Schema for documents table
export const docs = pgTable('docs', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: varchar('user_id', { length: 255 }).notNull(),
  objectKey: text('object_key').notNull(), // Store storage object key instead of signed URL
  extractedText: text('extracted_text').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Types
export type Doc = typeof docs.$inferSelect;
export type NewDoc = typeof docs.$inferInsert;