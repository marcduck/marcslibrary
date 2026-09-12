// Every read and write of the library. Server actions and the REST API are both
// thin layers over these functions.

import 'server-only';
import { db } from './db.ts';
import { isStatus, normaliseCode, formatCode, type Status } from './statuses.ts';

export type HistoryEntry = {
  status: string;
  borrower: string;
  note: string;
  at: string;
};

export type Book = {
  id: string;
  code: string;
  title: string;
  author: string;
  isbn: string;
  coverUrl: string;
  published: string;
  pages: number | null;
  summary: string;
  status: Status;
  borrower: string;
  dueDate: string;
  notes: string;
  addedAt: string;
  updatedAt: string;
  history: HistoryEntry[];
};

export type BookInput = Partial<Omit<Book, 'id' | 'history'>> & { code?: string };

export type Counts = Record<string, number> & { all: number };

const now = () => new Date().toISOString();
const newId = () => 'bk_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

type BookRow = {
  id: string; code: string; code_key: string; title: string; author: string;
  isbn: string; cover_url: string; published: string; pages: number | null;
  summary: string; status: string; borrower: string; due_date: string;
  notes: string; added_at: string; updated_at: string;
};

function rowToBook(row: BookRow, history: HistoryEntry[] = []): Book {
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
    status: row.status as Status,
    borrower: row.borrower,
    dueDate: row.due_date,
    notes: row.notes,
    addedAt: row.added_at,
    updatedAt: row.updated_at,
    history,
  };
}

function historyFor(bookId: string, limit = 20): HistoryEntry[] {
  const rows = db()
    .prepare('SELECT status, borrower, note, at FROM history WHERE book_id = ? ORDER BY id DESC LIMIT ?')
    .all(bookId, limit) as unknown as HistoryEntry[];
  // node:sqlite hands back null-prototype objects, which React refuses to pass
  // from a server component to a client one. Copy them into plain objects.
  return rows.map((row) => ({ status: row.status, borrower: row.borrower, note: row.note, at: row.at }));
}

export class ConflictError extends Error {
  book: Book | null;
  constructor(message: string, book: Book | null = null) {
    super(message);
    this.name = 'ConflictError';
    this.book = book;
  }
}

export function listBooks({ q = '', status = 'all' }: { q?: string; status?: string } = {}): Book[] {
  const where: string[] = [];
  const params: unknown[] = [];

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
  return (db().prepare(sql).all(...(params as never[])) as unknown as BookRow[]).map((row) => rowToBook(row));
}

export function getBook(id: string): Book | null {
  const row = db().prepare('SELECT * FROM books WHERE id = ?').get(id) as unknown as BookRow | undefined;
  return row ? rowToBook(row, historyFor(id)) : null;
}

export function getBookByCode(code: string): Book | null {
  const row = db().prepare('SELECT * FROM books WHERE code_key = ?').get(normaliseCode(code)) as unknown as BookRow | undefined;
  return row ? rowToBook(row, historyFor(row.id)) : null;
}

export function counts(): Counts {
  const rows = db().prepare('SELECT status, COUNT(*) AS n FROM books GROUP BY status').all() as unknown as
    { status: string; n: number }[];
  const out: Counts = { all: 0 };
  for (const row of rows) {
    out[row.status] = row.n;
    out.all += row.n;
  }
  return out;
}

// Labels are printed in sequence (0000167, 0000168, ...), so suggest the next one.
export function nextCode(): string {
  const rows = db().prepare("SELECT code_key FROM books WHERE code_key GLOB '[0-9]*'").all() as unknown as
    { code_key: string }[];
  const highest = rows.reduce((max, row) => {
    const n = Number(row.code_key);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return formatCode(String(highest + 1));
}

export function createBook(input: BookInput): Book {
  const code = formatCode(input.code);
  const codeKey = normaliseCode(code);
  if (!codeKey) throw new Error('A barcode is required.');

  const clash = getBookByCode(codeKey);
  if (clash) throw new ConflictError(`Barcode ${clash.code} is already "${clash.title}".`, clash);

  const status: Status = isStatus(input.status) ? input.status : 'available';
  const id = newId();
  const at = now();

  db().prepare(`INSERT INTO books
      (id, code, code_key, title, author, isbn, cover_url, published, pages, summary,
       status, borrower, due_date, notes, added_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)`)
    .run(
      id, code, codeKey,
      String(input.title ?? '').trim() || 'Untitled',
      String(input.author ?? '').trim(),
      String(input.isbn ?? '').trim(),
      String(input.coverUrl ?? '').trim(),
      String(input.published ?? '').trim(),
      input.pages && Number.isFinite(Number(input.pages)) ? Number(input.pages) : null,
      String(input.summary ?? '').trim(),
      status,
      String(input.borrower ?? '').trim(),
      String(input.dueDate ?? '').trim(),
      String(input.notes ?? '').trim(),
      at, at,
    );
  db().prepare('INSERT INTO history (book_id, status, borrower, note, at) VALUES (?,?,?,?,?)')
    .run(id, status, '', 'Added to library', at);

  return getBook(id)!;
}

const EDITABLE: Record<string, string> = {
  title: 'title', author: 'author', isbn: 'isbn', coverUrl: 'cover_url',
  published: 'published', pages: 'pages', summary: 'summary', notes: 'notes',
};

export function updateBook(id: string, changes: BookInput): Book | null {
  const existing = getBook(id);
  if (!existing) return null;

  const sets: string[] = [];
  const params: unknown[] = [];

  for (const [key, column] of Object.entries(EDITABLE)) {
    const value = (changes as Record<string, unknown>)[key];
    if (value === undefined) continue;
    sets.push(`${column} = ?`);
    params.push(key === 'pages'
      ? (value && Number.isFinite(Number(value)) ? Number(value) : null)
      : String(value ?? '').trim());
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
  db().prepare(`UPDATE books SET ${sets.join(', ')} WHERE id = ?`).run(...(params as never[]));
  return getBook(id);
}

export function setStatus(
  id: string,
  status: string,
  { borrower = '', dueDate = '', note = '' }: { borrower?: string; dueDate?: string; note?: string } = {},
): Book | null {
  if (!isStatus(status)) throw new Error(`Unknown status "${status}".`);
  if (!getBook(id)) return null;

  // Only loans and holds belong to someone; only loans come back on a date.
  const who = status === 'loaned' || status === 'hold' ? String(borrower ?? '').trim() : '';
  const due = status === 'loaned' ? String(dueDate ?? '').trim() : '';
  const at = now();

  db().prepare('UPDATE books SET status = ?, borrower = ?, due_date = ?, updated_at = ? WHERE id = ?')
    .run(status, who, due, at, id);
  db().prepare('INSERT INTO history (book_id, status, borrower, note, at) VALUES (?,?,?,?,?)')
    .run(id, status, who, String(note ?? '').trim(), at);

  return getBook(id);
}

export function deleteBook(id: string): boolean {
  return db().prepare('DELETE FROM books WHERE id = ?').run(id).changes > 0;
}

export function getSetting(key: string, fallback = ''): string {
  const row = db().prepare('SELECT value FROM settings WHERE key = ?').get(key) as unknown as { value: string } | undefined;
  return row ? row.value : fallback;
}

export function setSetting(key: string, value: string): string {
  db().prepare('INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value')
    .run(key, String(value));
  return value;
}

export const DEFAULT_LIBRARY_NAME = "MARC'S LIBRARY";
export const libraryName = () => getSetting('libraryName', DEFAULT_LIBRARY_NAME);

export function exportAll() {
  const rows = db().prepare('SELECT * FROM books ORDER BY code_key').all() as unknown as BookRow[];
  return {
    name: libraryName(),
    exportedAt: now(),
    books: rows.map((row) => rowToBook(row, historyFor(row.id, 100))),
  };
}

// Import merges by barcode so re-importing a backup does not duplicate shelves.
export function importBooks(books: BookInput[], { replace = false } = {}) {
  let added = 0;
  let updated = 0;

  db().prepare('BEGIN').run();
  try {
    if (replace) db().prepare('DELETE FROM books').run();
    for (const raw of books) {
      const existing = replace ? null : getBookByCode(String(raw.code ?? ''));
      if (existing) {
        updateBook(existing.id, raw);
        if (isStatus(raw.status) && raw.status !== existing.status) {
          setStatus(existing.id, raw.status, raw as { borrower?: string; dueDate?: string });
        }
        updated++;
      } else {
        createBook(raw);
        added++;
      }
    }
    db().prepare('COMMIT').run();
  } catch (err) {
    db().prepare('ROLLBACK').run();
    throw err;
  }

  return { added, updated };
}

export function meta() {
  return { name: libraryName(), counts: counts(), nextCode: nextCode() };
}
