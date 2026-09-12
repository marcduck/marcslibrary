// SQLite storage. Uses node:sqlite, which ships with Node, so the server has
// no npm dependencies at all.

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { isStatus, normaliseCode, formatCode } from '../shared/statuses.mjs';

let db;

export function open(file) {
  mkdirSync(dirname(file), { recursive: true });
  db = new DatabaseSync(file);
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

export function close() {
  if (db) db.close();
  db = null;
}

const now = () => new Date().toISOString();
const newId = () => 'bk_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

function rowToBook(row, history = []) {
  if (!row) return null;
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    author: row.author,
    isbn: row.isbn,
    coverUrl: row.cover_url,
    published: row.published,
    pages: row.pages,
    summary: row.summary,
    status: row.status,
    borrower: row.borrower,
    dueDate: row.due_date,
    notes: row.notes,
    addedAt: row.added_at,
    updatedAt: row.updated_at,
    history,
  };
}

function historyFor(bookId, limit = 20) {
  return db.prepare('SELECT status, borrower, note, at FROM history WHERE book_id = ? ORDER BY id DESC LIMIT ?')
    .all(bookId, limit);
}

export function listBooks({ q = '', status = 'all' } = {}) {
  const where = [];
  const params = [];
  if (status !== 'all') {
    where.push('status = ?');
    params.push(status);
  }
  if (q) {
    const like = `%${q.toLowerCase()}%`;
    const clauses = ['LOWER(title) LIKE ?', 'LOWER(author) LIKE ?', 'LOWER(borrower) LIKE ?', 'code_key LIKE ?'];
    params.push(like, like, like, `%${normaliseCode(q)}%`);
    // Only match ISBNs when the query has digits to match: an empty digit
    // string would turn into LIKE '%%' and quietly match every book.
    const digits = q.replace(/[^0-9Xx]/g, '');
    if (digits) {
      clauses.push('isbn LIKE ?');
      params.push(`%${digits}%`);
    }
    where.push(`(${clauses.join(' OR ')})`);
  }
  const sql = `SELECT * FROM books ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY title COLLATE NOCASE`;
  return db.prepare(sql).all(...params).map((row) => rowToBook(row));
}

export function getBook(id) {
  const row = db.prepare('SELECT * FROM books WHERE id = ?').get(id);
  return row ? rowToBook(row, historyFor(id)) : null;
}

export function getBookByCode(code) {
  const row = db.prepare('SELECT * FROM books WHERE code_key = ?').get(normaliseCode(code));
  return row ? rowToBook(row, historyFor(row.id)) : null;
}

export function counts() {
  const rows = db.prepare('SELECT status, COUNT(*) AS n FROM books GROUP BY status').all();
  const out = { all: 0 };
  for (const s of rows) {
    out[s.status] = s.n;
    out.all += s.n;
  }
  return out;
}

// Labels are printed in sequence (0000167, 0000168, ...), so suggest the next one.
export function nextCode() {
  const rows = db.prepare("SELECT code_key FROM books WHERE code_key GLOB '[0-9]*'").all();
  const highest = rows.reduce((max, r) => {
    const n = Number(r.code_key);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return formatCode(String(highest + 1));
}

export class ConflictError extends Error {
  constructor(message, book) {
    super(message);
    this.name = 'ConflictError';
    this.book = book;
  }
}

export function createBook(input) {
  const code = formatCode(input.code);
  const codeKey = normaliseCode(code);
  if (!codeKey) throw new Error('A barcode is required.');
  const clash = getBookByCode(codeKey);
  if (clash) throw new ConflictError(`Barcode ${clash.code} is already "${clash.title}".`, clash);

  const status = isStatus(input.status) ? input.status : 'available';
  const id = newId();
  const at = now();
  db.prepare(`INSERT INTO books
      (id, code, code_key, title, author, isbn, cover_url, published, pages, summary,
       status, borrower, due_date, notes, added_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(
      id, code, codeKey,
      String(input.title || '').trim() || 'Untitled',
      String(input.author || '').trim(),
      String(input.isbn || '').trim(),
      String(input.coverUrl || '').trim(),
      String(input.published || '').trim(),
      Number.isFinite(Number(input.pages)) && input.pages ? Number(input.pages) : null,
      String(input.summary || '').trim(),
      status,
      String(input.borrower || '').trim(),
      String(input.dueDate || '').trim(),
      String(input.notes || '').trim(),
      at, at,
    );
  db.prepare('INSERT INTO history (book_id, status, borrower, note, at) VALUES (?,?,?,?,?)')
    .run(id, status, '', 'Added to library', at);
  return getBook(id);
}

const EDITABLE = {
  title: 'title', author: 'author', isbn: 'isbn', coverUrl: 'cover_url',
  published: 'published', pages: 'pages', summary: 'summary', notes: 'notes',
};

export function updateBook(id, changes) {
  const existing = getBook(id);
  if (!existing) return null;

  const sets = [];
  const params = [];
  for (const [key, column] of Object.entries(EDITABLE)) {
    if (changes[key] === undefined) continue;
    sets.push(`${column} = ?`);
    params.push(key === 'pages'
      ? (Number.isFinite(Number(changes.pages)) && changes.pages ? Number(changes.pages) : null)
      : String(changes[key] ?? '').trim());
  }
  if (changes.code !== undefined) {
    const code = formatCode(changes.code);
    const codeKey = normaliseCode(code);
    if (!codeKey) throw new Error('A barcode is required.');
    const clash = getBookByCode(codeKey);
    if (clash && clash.id !== id) throw new ConflictError(`Barcode ${clash.code} is already "${clash.title}".`, clash);
    sets.push('code = ?', 'code_key = ?');
    params.push(code, codeKey);
  }
  if (!sets.length) return existing;

  sets.push('updated_at = ?');
  params.push(now(), id);
  db.prepare(`UPDATE books SET ${sets.join(', ')} WHERE id = ?`).run(...params);
  return getBook(id);
}

export function setStatus(id, status, { borrower = '', dueDate = '', note = '' } = {}) {
  if (!isStatus(status)) throw new Error(`Unknown status "${status}".`);
  const existing = getBook(id);
  if (!existing) return null;

  // Only loans and holds belong to someone; only loans come back on a date.
  const who = status === 'loaned' || status === 'hold' ? String(borrower || '').trim() : '';
  const due = status === 'loaned' ? String(dueDate || '').trim() : '';
  const at = now();
  db.prepare('UPDATE books SET status = ?, borrower = ?, due_date = ?, updated_at = ? WHERE id = ?')
    .run(status, who, due, at, id);
  db.prepare('INSERT INTO history (book_id, status, borrower, note, at) VALUES (?,?,?,?,?)')
    .run(id, status, who, String(note || '').trim(), at);
  return getBook(id);
}

export function deleteBook(id) {
  const result = db.prepare('DELETE FROM books WHERE id = ?').run(id);
  return result.changes > 0;
}

export function getSetting(key, fallback = '') {
  const row = db.prepare('SELECT value FROM settings WHERE key = ?').get(key);
  return row ? row.value : fallback;
}

export function setSetting(key, value) {
  db.prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, String(value));
  return value;
}

export function exportAll() {
  const books = db.prepare('SELECT * FROM books ORDER BY code_key').all()
    .map((row) => rowToBook(row, historyFor(row.id, 100)));
  return { name: getSetting('libraryName', "MARC'S LIBRARY"), exportedAt: now(), books };
}

// Import merges by barcode so re-importing a backup does not duplicate shelves.
export function importBooks(books, { replace = false } = {}) {
  let added = 0;
  let updated = 0;
  const run = db.prepare('BEGIN');
  run.run();
  try {
    if (replace) db.prepare('DELETE FROM books').run();
    for (const raw of books) {
      const existing = replace ? null : getBookByCode(raw.code);
      if (existing) {
        updateBook(existing.id, raw);
        if (isStatus(raw.status) && raw.status !== existing.status) setStatus(existing.id, raw.status, raw);
        updated++;
      } else {
        createBook(raw);
        added++;
      }
    }
    db.prepare('COMMIT').run();
  } catch (err) {
    db.prepare('ROLLBACK').run();
    throw err;
  }
  return { added, updated };
}
