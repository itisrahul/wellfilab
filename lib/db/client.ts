/**
 * lib/db/client.ts — Drizzle runtime client.
 *
 * Uses POSTGRES_URL (Supabase's pooled, port-6543 connection string, wired
 * in by the Vercel↔Supabase marketplace integration) — the right choice for
 * serverless route handlers, which open a fresh connection per invocation.
 * `prepare: false` is required for Supabase's transaction-mode pgbouncer:
 * prepared statements can't be reused across pooled connections.
 *
 * Migrations use the separate direct connection (POSTGRES_URL_NON_POOLING)
 * instead — see drizzle.config.ts.
 *
 * The client is built lazily on first use, not at module load. Next.js
 * evaluates every route module during `next build`'s page-data collection
 * pass — importing this file is enough to run it, with no request and no
 * guarantee the environment (a fresh preview deploy, a local build without
 * .env.local) has POSTGRES_URL yet. Constructing eagerly would fail the
 * build itself over a var that's only actually needed once a request
 * touches the database.
 */

import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from './schema';

type DrizzleDb = ReturnType<typeof drizzle<typeof schema>>;

let cached: DrizzleDb | null = null;

function getDb(): DrizzleDb {
  if (cached) return cached;
  const connectionString = process.env.POSTGRES_URL;
  if (!connectionString) throw new Error('POSTGRES_URL is not set');
  const client = postgres(connectionString, { prepare: false });
  cached = drizzle(client, { schema });
  return cached;
}

export const db: DrizzleDb = new Proxy({} as DrizzleDb, {
  get(_target, prop, receiver) {
    const real = getDb();
    const value = Reflect.get(real as object, prop, receiver);
    return typeof value === 'function' ? value.bind(real) : value;
  },
});
