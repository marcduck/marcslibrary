// Every read and write of the library. Server actions and the REST API are both
// thin layers over these functions.

import 'server-only';
import { db } from './db.ts';
import { isStatus, normaliseCode, formatCode, type Status } from './statuses.ts';

export type HistoryEntry = {
  status: string;
  at: string;
};

export type Book = {
  id: string;
  code: string;
  title: string;
  author: string;
  isbn: string;
  status: Status;
  addedAt: string;
  updatedAt: string;
  history: HistoryEntry[];
};

export type BookInput = Partial<Omit<Book, 'id' | 'history'>> & { code?: string };

export type Counts = Record<string, number> & { all: number };

// Shelf barcodes are printed in sequence; this library's first batch of labels
// started at 0000167, so new suggestions carry on from there.
const START_CODE = 167;

const now = () => new Date().toISOString();
const newId = () => 'bk_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

type BookRow = {
  id: string; code: string; code_key: string; title: string; author: string;
  isbn: string; status: string; added_at: string; updated_at: string;
};

function rowToBook(row: BookRow, history: HistoryEntry[] = []): Book {
  return {
    id: row.id,
    code: row.code,
    title: row.title,
    author: row.author,
    isbn: row.isbn,
    status: row.status as Status,
    addedAt: row.added_at,
    updatedAt: row.updated_at,
    history,
  };
}

function historyFor(bookId: string, limit = 20): HistoryEntry[] {
  const rows = db()
    .prepare('SELECT status, at FROM history WHERE book_id = ? ORDER BY id DESC LIMIT ?')
    .all(bookId, limit) as unknown as HistoryEntry[];
  // node:sqlite hands back null-prototype objects, which React refuses to pass
  // from a server component to a client one. Copy them into plain objects.
  return rows.map((row) => ({ status: row.status, at: row.at }));
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
    const clauses = ['LOWER(title) LIKE ?', 'LOWER(author) LIKE ?', 'code_key LIKE ?'];
    params.push(like, like, `%${normaliseCode(q)}%`);
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

export function nextCode(): string {
  const rows = db().prepare("SELECT code_key FROM books WHERE code_key GLOB '[0-9]*'").all() as unknown as
    { code_key: string }[];
  const highest = rows.reduce((max, row) => {
    const n = Number(row.code_key);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return formatCode(String(highest > 0 ? highest + 1 : START_CODE));
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
      (id, code, code_key, title, author, isbn, status, added_at, updated_at)
      VALUES (?,?,?,?,?,?,?,?,?)`)
    .run(
      id, code, codeKey,
      String(input.title ?? '').trim() || 'Untitled',
      String(input.author ?? '').trim(),
      String(input.isbn ?? '').trim(),
      status,
      at, at,
    );
  db().prepare('INSERT INTO history (book_id, status, at) VALUES (?,?,?)').run(id, status, at);

  return getBook(id)!;
}

const EDITABLE: Record<string, string> = { title: 'title', author: 'author', isbn: 'isbn' };

export function updateBook(id: string, changes: BookInput): Book | null {
  const existing = getBook(id);
  if (!existing) return null;

  const sets: string[] = [];
  const params: unknown[] = [];

  for (const [key, column] of Object.entries(EDITABLE)) {
    const value = (changes as Record<string, unknown>)[key];
    if (value === undefined) continue;
    sets.push(`${column} = ?`);
    params.push(String(value ?? '').trim());
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

export function setStatus(id: string, status: string): Book | null {
  if (!isStatus(status)) throw new Error(`Unknown status "${status}".`);
  if (!getBook(id)) return null;

  const at = now();
  db().prepare('UPDATE books SET status = ?, updated_at = ? WHERE id = ?').run(status, at, id);
  db().prepare('INSERT INTO history (book_id, status, at) VALUES (?,?,?)').run(id, status, at);

  return getBook(id);
}

export function deleteBook(id: string): boolean {
  return db().prepare('DELETE FROM books WHERE id = ?').run(id).changes > 0;
}
