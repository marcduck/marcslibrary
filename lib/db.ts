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
      cover_url   TEXT NOT NULL DEFAULT '',
      published   TEXT NOT NULL DEFAULT '',
      pages       INTEGER,
      summary     TEXT NOT NULL DEFAULT '',
      status      TEXT NOT NULL DEFAULT 'available',
      borrower    TEXT NOT NULL DEFAULT '',
      due_date    TEXT NOT NULL DEFAULT '',
      notes       TEXT NOT NULL DEFAULT '',
      added_at    TEXT NOT NULL,
      updated_at  TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS history (
      id       INTEGER PRIMARY KEY AUTOINCREMENT,
      book_id  TEXT NOT NULL REFERENCES books(id) ON DELETE CASCADE,
      status   TEXT NOT NULL,
      borrower TEXT NOT NULL DEFAULT '',
      note     TEXT NOT NULL DEFAULT '',
      at       TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS history_book ON history (book_id, id DESC);
    CREATE TABLE IF NOT EXISTS settings (
      key   TEXT PRIMARY KEY,
      value TEXT NOT NULL
    );
  `);
  return db;
}

export function db(): DatabaseSync {
  if (!globalThis.__libraryDb) globalThis.__libraryDb = connect();
  return globalThis.__libraryDb;
}

export const dbFile = DB_FILE;
