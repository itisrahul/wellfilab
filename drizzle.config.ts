import { defineConfig } from 'drizzle-kit';

// Migrations run over the direct (non-pooled) connection — Supabase's
// transaction-mode pooler (POSTGRES_URL) doesn't support the session-level
// features drizzle-kit's migrator needs.
const connectionString = process.env.POSTGRES_URL_NON_POOLING;
if (!connectionString) throw new Error('POSTGRES_URL_NON_POOLING is not set');

export default defineConfig({
  schema: './lib/db/schema.ts',
  out: './lib/db/migrations',
  dialect: 'postgresql',
  dbCredentials: { url: connectionString },
});
