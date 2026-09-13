import 'server-only';
import { LibsqlError } from '@libsql/client';
import { db, ready } from './db.ts';
import { isStatus, normaliseCode, formatCode, type Status } from './statuses.ts';
import { copy } from './copy.ts';

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

async function historyFor(bookId: string, limit = 20): Promise<HistoryEntry[]> {
  const result = await db().execute({
    sql: 'SELECT status, at FROM history WHERE book_id = ? ORDER BY id DESC LIMIT ?',
    args: [bookId, limit],
  });
  return result.rows.map((row) => ({ status: String(row.status), at: String(row.at) }));
}

export class ConflictError extends Error {
  book: Book | null;
  constructor(message: string, book: Book | null = null) {
    super(message);
    this.name = 'ConflictError';
    this.book = book;
  }
}

export async function listBooks({ q = '', status = 'all' }: { q?: string; status?: string } = {}): Promise<Book[]> {
  await ready();
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
    const digits = q.replace(/[^0-9Xx]/g, '');
    if (digits) {
      clauses.push('isbn LIKE ?');
      params.push(`%${digits}%`);
    }
    where.push(`(${clauses.join(' OR ')})`);
  }

  const sql = `SELECT * FROM books ${where.length ? 'WHERE ' + where.join(' AND ') : ''} ORDER BY title COLLATE NOCASE`;
  const result = await db().execute({ sql, args: params as (string | number)[] });
  return result.rows.map((row) => rowToBook(row as unknown as BookRow));
}

export async function getBook(id: string): Promise<Book | null> {
  await ready();
  const result = await db().execute({ sql: 'SELECT * FROM books WHERE id = ?', args: [id] });
  const row = result.rows[0] as unknown as BookRow | undefined;
  return row ? rowToBook(row, await historyFor(id)) : null;
}

export async function getBookByCode(code: string): Promise<Book | null> {
  await ready();
  const result = await db().execute({ sql: 'SELECT * FROM books WHERE code_key = ?', args: [normaliseCode(code)] });
  const row = result.rows[0] as unknown as BookRow | undefined;
  return row ? rowToBook(row, await historyFor(row.id)) : null;
}

export async function counts(): Promise<Counts> {
  await ready();
  const result = await db().execute('SELECT status, COUNT(*) AS n FROM books GROUP BY status');
  const out: Counts = { all: 0 };
  for (const row of result.rows) {
    const status = String(row.status);
    const n = Number(row.n);
    out[status] = n;
    out.all += n;
  }
  return out;
}

export async function nextCode(): Promise<string> {
  await ready();
  const result = await db().execute("SELECT code_key FROM books WHERE code_key GLOB '[0-9]*'");
  const highest = result.rows.reduce((max, row) => {
    const n = Number(row.code_key);
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return formatCode(String(highest > 0 ? highest + 1 : START_CODE));
}

export async function createBook(input: BookInput): Promise<Book> {
  await ready();
  const code = formatCode(input.code);
  const codeKey = normaliseCode(code);
  if (!codeKey) throw new Error(copy.errors.barcodeRequired);

  const clash = await getBookByCode(codeKey);
  if (clash) throw new ConflictError(copy.errors.barcodeTaken(clash.code, clash.title), clash);

  const status: Status = isStatus(input.status) ? input.status : 'available';
  const id = newId();
  const at = now();

  try {
    await db().batch(
      [
        {
          sql: `INSERT INTO books
            (id, code, code_key, title, author, isbn, status, added_at, updated_at)
            VALUES (?,?,?,?,?,?,?,?,?)`,
          args: [
            id, code, codeKey,
            String(input.title ?? '').trim() || copy.defaults.untitled,
            String(input.author ?? '').trim(),
            String(input.isbn ?? '').trim(),
            status,
            at, at,
          ],
        },
        { sql: 'INSERT INTO history (book_id, status, at) VALUES (?,?,?)', args: [id, status, at] },
      ],
      'write',
    );
  } catch (err) {
    if (err instanceof LibsqlError && err.code === 'SQLITE_CONSTRAINT') {
      const raceClash = await getBookByCode(codeKey);
      if (raceClash) throw new ConflictError(copy.errors.barcodeTaken(raceClash.code, raceClash.title), raceClash);
    }
    throw err;
  }

  return (await getBook(id))!;
}

const EDITABLE = ['title', 'author', 'isbn'] as const;

export async function updateBook(id: string, changes: BookInput): Promise<Book | null> {
  await ready();
  const existing = await getBook(id);
  if (!existing) return null;

  const sets: string[] = [];
  const params: unknown[] = [];

  for (const key of EDITABLE) {
    const value = changes[key];
    if (value === undefined) continue;
    sets.push(`${key} = ?`);
    params.push(String(value ?? '').trim());
  }

  if (changes.code !== undefined) {
    const code = formatCode(changes.code);
    const codeKey = normaliseCode(code);
    if (!codeKey) throw new Error(copy.errors.barcodeRequired);
    const clash = await getBookByCode(codeKey);
    if (clash && clash.id !== id) throw new ConflictError(copy.errors.barcodeTaken(clash.code, clash.title), clash);
    sets.push('code = ?', 'code_key = ?');
    params.push(code, codeKey);
  }

  if (!sets.length) return existing;

  sets.push('updated_at = ?');
  params.push(now(), id);
  await db().execute({ sql: `UPDATE books SET ${sets.join(', ')} WHERE id = ?`, args: params as (string | number)[] });
  return getBook(id);
}

export async function setStatus(id: string, status: string): Promise<Book | null> {
  await ready();
  if (!isStatus(status)) throw new Error(copy.errors.unknownStatus(status));
  if (!(await getBook(id))) return null;

  const at = now();
  await db().batch(
    [
      { sql: 'UPDATE books SET status = ?, updated_at = ? WHERE id = ?', args: [status, at, id] },
      { sql: 'INSERT INTO history (book_id, status, at) VALUES (?,?,?)', args: [id, status, at] },
    ],
    'write',
  );

  return getBook(id);
}

export async function deleteBook(id: string): Promise<boolean> {
  await ready();
  const result = await db().execute({ sql: 'DELETE FROM books WHERE id = ?', args: [id] });
  return result.rowsAffected > 0;
}
