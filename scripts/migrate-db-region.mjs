/**
 * scripts/migrate-db-region.mjs — one-time copy of every row from the old
 * (Mumbai) Supabase project to the new (us-east-1) one, run when moving the
 * database region. Run this yourself, in your own terminal — never through
 * an AI tool session — since it needs both connection strings at once and
 * those must never be pasted into chat.
 *
 * Usage (PowerShell):
 *   $env:OLD_POSTGRES_URL="postgresql://...mumbai project, non-pooling, port 5432 URL..."
 *   $env:NEW_POSTGRES_URL="postgresql://...us-east-1 project, non-pooling, port 5432 URL..."
 *   node scripts/migrate-db-region.mjs
 *
 * Usage (bash):
 *   OLD_POSTGRES_URL="..." NEW_POSTGRES_URL="..." node scripts/migrate-db-region.mjs
 *
 * Use each project's POSTGRES_URL_NON_POOLING (direct connection, port
 * 5432) from Supabase's dashboard — Project Settings -> Database ->
 * Connection string -> URI, "Session" mode. The pooled (port 6543) URL
 * can reject the bulk inserts this script does.
 *
 * Safe to re-run: every insert uses ON CONFLICT DO NOTHING, so running it
 * twice just skips rows that already made it across.
 */

import postgres from 'postgres';

const oldUrl = process.env.OLD_POSTGRES_URL;
const newUrl = process.env.NEW_POSTGRES_URL;

if (!oldUrl || !newUrl) {
  console.error('Set OLD_POSTGRES_URL and NEW_POSTGRES_URL environment variables first. See the comment at the top of this file for exact commands.');
  process.exit(1);
}

const oldDb = postgres(oldUrl, { prepare: false });
const newDb = postgres(newUrl, { prepare: false });

const TABLES = [
  { name: 'scores', columns: ['id', 'user_id', 'date', 'data', 'created_at'] },
  { name: 'goals', columns: ['id', 'user_id', 'type', 'label', 'target', 'current', 'start_value', 'start_date', 'target_date', 'last_updated', 'paused', 'history'] },
  { name: 'net_worth_snapshots', columns: ['id', 'user_id', 'date', 'assets', 'liabilities', 'net_worth'] },
  { name: 'roadmap_checks', columns: ['user_id', 'checks', 'updated_at'] },
  { name: 'score_inputs', columns: ['user_id', 'body', 'finance', 'age', 'updated_at'] },
  { name: 'onboarding', columns: ['user_id', 'plan', 'email', 'answers', 'submitted_at'] },
];

async function migrateTable({ name, columns }) {
  const rows = await oldDb.unsafe(`SELECT * FROM ${name}`);
  if (rows.length === 0) {
    console.log(`${name}: nothing to copy`);
    return;
  }

  let copied = 0;
  for (const row of rows) {
    const values = columns.map(c => row[c]);
    const placeholders = columns.map((_, i) => `$${i + 1}`).join(', ');
    const result = await newDb.unsafe(
      `INSERT INTO ${name} (${columns.join(', ')}) VALUES (${placeholders}) ON CONFLICT DO NOTHING`,
      values
    );
    copied += result.count;
  }
  console.log(`${name}: copied ${copied} of ${rows.length} row(s)`);
}

for (const table of TABLES) {
  await migrateTable(table);
}

await oldDb.end();
await newDb.end();
console.log('Done.');
