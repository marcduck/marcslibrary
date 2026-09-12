// Data layer: books live in localStorage. No backend, no build step.

const KEY = 'marcslibrary.books.v1';
const META_KEY = 'marcslibrary.meta.v1';

export const STATUSES = [
  { id: 'available', label: 'Available', hint: 'On the shelf' },
  { id: 'loaned',    label: 'Loaned',    hint: 'Someone has it' },
  { id: 'hold',      label: 'On hold',   hint: 'Reserved for someone' },
  { id: 'reading',   label: 'Reading',   hint: 'Currently being read' },
  { id: 'missing',   label: 'Missing',   hint: 'Lost or unaccounted for' },
];

export function statusLabel(id) {
  const s = STATUSES.find((s) => s.id === id);
  return s ? s.label : id;
}

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch (err) {
    console.error('Could not read storage', err);
    return fallback;
  }
}

function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function allBooks() {
  return read(KEY, []);
}

function saveAll(books) {
  write(KEY, books);
  return books;
}

export function getBook(id) {
  return allBooks().find((b) => b.id === id) || null;
}

export function findByCode(code) {
  const wanted = normaliseCode(code);
  return allBooks().find((b) => normaliseCode(b.code) === wanted) || null;
}

// Barcodes get typed, scanned and printed with different amounts of padding,
// so compare them loosely: "167", "0000167" and " 0000167 " are the same book.
export function normaliseCode(code) {
  const trimmed = String(code || '').trim().toUpperCase();
  return /^\d+$/.test(trimmed) ? String(Number(trimmed)) : trimmed;
}

export function formatCode(code) {
  const trimmed = String(code || '').trim();
  return /^\d+$/.test(trimmed) ? trimmed.padStart(7, '0') : trimmed.toUpperCase();
}

// Labels are printed in sequence (0000167, 0000168, ...), so suggest the next one.
export function nextCode() {
  const highest = allBooks().reduce((max, book) => {
    const n = Number(normaliseCode(book.code));
    return Number.isFinite(n) && n > max ? n : max;
  }, 0);
  return formatCode(String(highest + 1));
}

function now() {
  return new Date().toISOString();
}

function newId() {
  return 'bk_' + Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

export function addBook({ code, title, author, status = 'available', notes = '' }) {
  const books = allBooks();
  const book = {
    id: newId(),
    code: formatCode(code),
    title: String(title || '').trim() || 'Untitled',
    author: String(author || '').trim(),
    status,
    borrower: '',
    dueDate: '',
    notes: String(notes || '').trim(),
    addedAt: now(),
    updatedAt: now(),
    history: [{ at: now(), status, note: 'Added to library' }],
  };
  books.push(book);
  saveAll(books);
  return book;
}

export function updateBook(id, changes) {
  const books = allBooks();
  const book = books.find((b) => b.id === id);
  if (!book) return null;
  Object.assign(book, changes, { updatedAt: now() });
  if (changes.code !== undefined) book.code = formatCode(changes.code);
  saveAll(books);
  return book;
}

export function setStatus(id, status, { borrower = '', dueDate = '', note = '' } = {}) {
  const books = allBooks();
  const book = books.find((b) => b.id === id);
  if (!book) return null;
  book.status = status;
  book.borrower = status === 'loaned' || status === 'hold' ? borrower : '';
  book.dueDate = status === 'loaned' ? dueDate : '';
  book.updatedAt = now();
  book.history = book.history || [];
  book.history.unshift({ at: now(), status, borrower: book.borrower, note });
  book.history = book.history.slice(0, 50);
  saveAll(books);
  return book;
}

export function deleteBook(id) {
  saveAll(allBooks().filter((b) => b.id !== id));
}

export function search(query, statusFilter = 'all') {
  const q = String(query || '').trim().toLowerCase();
  return allBooks()
    .filter((b) => statusFilter === 'all' || b.status === statusFilter)
    .filter((b) => {
      if (!q) return true;
      return (
        b.title.toLowerCase().includes(q) ||
        (b.author || '').toLowerCase().includes(q) ||
        (b.borrower || '').toLowerCase().includes(q) ||
        normaliseCode(b.code).includes(normaliseCode(q))
      );
    })
    .sort((a, b) => a.title.localeCompare(b.title));
}

export function counts() {
  const books = allBooks();
  const out = { all: books.length };
  for (const s of STATUSES) out[s.id] = books.filter((b) => b.status === s.id).length;
  return out;
}

export function libraryName() {
  return read(META_KEY, {}).name || "MARC'S LIBRARY";
}

export function setLibraryName(name) {
  const meta = read(META_KEY, {});
  meta.name = String(name || '').trim() || "MARC'S LIBRARY";
  write(META_KEY, meta);
  return meta.name;
}

export function exportJSON() {
  return JSON.stringify({ name: libraryName(), exportedAt: now(), books: allBooks() }, null, 2);
}

// Import merges by barcode so re-importing a backup does not duplicate shelves.
export function importJSON(text, { replace = false } = {}) {
  const data = JSON.parse(text);
  const incoming = Array.isArray(data) ? data : data.books;
  if (!Array.isArray(incoming)) throw new Error('No "books" array found in that file.');
  if (data.name) setLibraryName(data.name);

  if (replace) {
    saveAll(incoming.map(normaliseBook));
    return { added: incoming.length, updated: 0 };
  }

  const books = allBooks();
  let added = 0;
  let updated = 0;
  for (const raw of incoming) {
    const book = normaliseBook(raw);
    const existing = books.find((b) => normaliseCode(b.code) === normaliseCode(book.code));
    if (existing) {
      Object.assign(existing, book, { id: existing.id });
      updated++;
    } else {
      books.push(book);
      added++;
    }
  }
  saveAll(books);
  return { added, updated };
}

function normaliseBook(raw) {
  return {
    id: raw.id || newId(),
    code: formatCode(raw.code),
    title: String(raw.title || 'Untitled'),
    author: String(raw.author || ''),
    status: STATUSES.some((s) => s.id === raw.status) ? raw.status : 'available',
    borrower: String(raw.borrower || ''),
    dueDate: String(raw.dueDate || ''),
    notes: String(raw.notes || ''),
    addedAt: raw.addedAt || now(),
    updatedAt: raw.updatedAt || now(),
    history: Array.isArray(raw.history) ? raw.history : [],
  };
}
