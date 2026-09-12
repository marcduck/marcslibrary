// SQLite connection. node:sqlite ships with Node, so the app needs no database
// dependency at all.
//
// Next reloads modules on every edit in development, so the handle is cached on
// globalThis to avoid opening the file over and over.

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';

const DB_FILE = process.env.DB_FILE || join(process.cwd(), 'data', 'library.db');

declare global {
  // eslint-disable-next-line no-var
  var __libraryDb: DatabaseSync | undefined;
}

function connect(): DatabaseSync {
  mkdirSync(dirname(DB_FILE), { recursive: true });
  const db = new DatabaseSync(DB_FILE);
  db.exec('PRAGMA journal_mode = WAL');
  db.exec('PRAGMA foreign_keys = ON');
  db.exec(`
    CREATE TABLE IF NOT EXISTS books (
      id          TEXT PRIMARY KEY,
      code        TEXT NOT NULL,
      code_key    TEXT NOT NULL UNIQUE,
      title       TEXT NOT NULL,
      author      TEXT NOT NULL DEFAULT '',
      isbn        TEXT NOT NULL DEFAULT '',
      status      TEXT NOT NULL DEFAULT 'available',
      added_at    TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS history (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id  TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      status   TEXT NOT NULL,
      at       TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS history_book ON history (book_id, id DESC);
  `);
  return db;
}

export function db(): DatabaseSync {
  if (!globalThis.__libraryDb) globalThis.__libraryDb = connect();
  return globalThis.__libraryDb;
}

// Windows keeps the WAL/SHM files locked for as long as the handle stays open,
// so tests must close it before they delete their throwaway database.
export function closeDb(): void {
  globalThis.__libraryDb?.close();
  globalThis.__libraryDb = undefined;
}

export const dbFile = DB_FILE;
