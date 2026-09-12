// Database connection, through @libsql/client.
//
// Locally, with no env vars set, this opens a plain SQLite file — same as
// before, no setup needed. On Vercel, set TURSO_DATABASE_URL and
// TURSO_AUTH_TOKEN (from a free https://turso.tech database) and the same
// code talks to that instead, over HTTP. Vercel's filesystem does not keep
// files between requests, so a real database is required in production.
//
// Next reloads modules on every edit in development, so the client is
// cached on globalThis to avoid opening the file over and over.

import { createClient, type Client } from '@libsql/client';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DB_FILE = process.env.DB_FILE || join(process.cwd(), 'data', 'library.db');
const TURSO_URL = process.env.TURSO_DATABASE_URL;

declare global {
  // eslint-disable-next-line no-var
  var __libraryDb: Client | undefined;
  // eslint-disable-next-line no-var
  var __libraryDbReady: Promise<void> | undefined;
}

function connect(): Client {
  if (TURSO_URL) {
    return createClient({ url: TURSO_URL, authToken: process.env.TURSO_AUTH_TOKEN });
  }
  mkdirSync(dirname(DB_FILE), { recursive: true });
  return createClient({ url: `file:${DB_FILE}` });
}

async function migrate(client: Client): Promise<void> {
  await client.execute('PRAGMA foreign_keys = ON');
  await client.batch(
    [
      `CREATE TABLE IF NOT EXISTS books (
        id          TEXT PRIMARY KEY,
        code        TEXT NOT NULL,
        code_key    TEXT NOT NULL UNIQUE,
        title       TEXT NOT NULL,
        author      TEXT NOT NULL DEFAULT '',
        isbn        TEXT NOT NULL DEFAULT '',
        status      TEXT NOT NULL DEFAULT 'available',
        added_at    TEXT NOT NULL,
        updated_at  TEXT NOT NULL
      )`,
      `CREATE TABLE IF NOT EXISTS history (
        id       INTEGER PRIMARY KEY AUTOINCREMENT,
        book_id  TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
        status   TEXT NOT NULL,
        at       TEXT NOT NULL
      )`,
      'CREATE INDEX IF NOT EXISTS history_book ON history (book_id, id DESC)',
    ],
    'write',
  );
}

export function db(): Client {
  if (!globalThis.__libraryDb) globalThis.__libraryDb = connect();
  if (!globalThis.__libraryDbReady) globalThis.__libraryDbReady = migrate(globalThis.__libraryDb);
  return globalThis.__libraryDb;
}

// Every call site must wait for the schema to exist before it runs a query.
export function ready(): Promise<void> {
  db();
  return globalThis.__libraryDbReady!;
}

export function closeDb(): void {
  globalThis.__libraryDb?.close();
  globalThis.__libraryDb = undefined;
  globalThis.__libraryDbReady = undefined;
}

export const dbFile = DB_FILE;
