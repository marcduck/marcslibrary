// Book metadata from free, key-free APIs: Open Library first, Google Books as a
// fallback when Open Library is unreachable or finds nothing.
//
// The base URLs are overridable so tests can point at a local stub.

import { cleanISBN, looksLikeISBN } from './statuses.ts';

const OPENLIBRARY = process.env.OPENLIBRARY_BASE || 'https://openlibrary.org';
const COVERS = process.env.OPENLIBRARY_COVERS_BASE || 'https://covers.openlibrary.org';
const GOOGLE_BOOKS = process.env.GOOGLE_BOOKS_BASE || 'https://www.googleapis.com/books/v1';
const TIMEOUT_MS = Number(process.env.LOOKUP_TIMEOUT_MS || 8000);

export type CatalogueBook = {
  title: string;
  author: string;
  isbn: string;
  published: string;
  pages: number | null;
  summary: string;
  coverUrl: string;
  source: 'openlibrary' | 'googlebooks';
};

export type LookupResult = {
  results: CatalogueBook[];
  source: 'openlibrary' | 'googlebooks' | null;
};

async function getJSON(url: string): Promise<unknown> {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      // Open Library asks that clients identify themselves.
      'User-Agent': 'marcslibrary/1.0 (self-hosted personal library)',
      Accept: 'application/json',
    },
    cache: 'no-store',
  });
  if (!response.ok) throw new Error(`${new URL(url).host} replied ${response.status}`);
  return response.json();
}

function tidy(book: Partial<CatalogueBook>): CatalogueBook {
  return {
    title: String(book.title ?? '').trim(),
    author: String(book.author ?? '').trim(),
    isbn: cleanISBN(book.isbn),
    published: String(book.published ?? '').trim(),
    pages: book.pages || null,
    summary: String(book.summary ?? '').trim().slice(0, 2000),
    coverUrl: String(book.coverUrl ?? '').trim(),
    source: book.source ?? 'openlibrary',
  };
}

/* ------------------------------------------------------- pure transforms */

type OpenLibraryDoc = {
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
  isbn?: string[];
  cover_i?: number;
  number_of_pages_median?: number;
};

export function fromOpenLibrarySearch(payload: unknown): CatalogueBook[] {
  const docs = (payload as { docs?: OpenLibraryDoc[] })?.docs;
  if (!Array.isArray(docs)) return [];
  return docs.map((doc) => {
    const isbn = Array.isArray(doc.isbn) ? doc.isbn[0] : '';
    return tidy({
      title: doc.title,
      author: Array.isArray(doc.author_name) ? doc.author_name.join(', ') : '',
      isbn,
      published: doc.first_publish_year ? String(doc.first_publish_year) : '',
      pages: doc.number_of_pages_median || null,
      coverUrl: doc.cover_i
        ? `${COVERS}/b/id/${doc.cover_i}-M.jpg`
        : (isbn ? `${COVERS}/b/isbn/${cleanISBN(isbn)}-M.jpg` : ''),
      source: 'openlibrary',
    });
  });
}

type GoogleVolume = {
  volumeInfo?: {
    title?: string;
    subtitle?: string;
    authors?: string[];
    publishedDate?: string;
    pageCount?: number;
    description?: string;
    industryIdentifiers?: { type: string; identifier: string }[];
    imageLinks?: { thumbnail?: string; smallThumbnail?: string };
  };
};

export function fromGoogleBooks(payload: unknown): CatalogueBook[] {
  const items = (payload as { items?: GoogleVolume[] })?.items;
  if (!Array.isArray(items)) return [];
  return items.map((item) => {
    const info = item.volumeInfo ?? {};
    const ids = Array.isArray(info.industryIdentifiers) ? info.industryIdentifiers : [];
    const isbn = ids.find((i) => i.type === 'ISBN_13') ?? ids.find((i) => i.type === 'ISBN_10');
    // Google serves http thumbnails; upgrade so they load on an https page.
    const thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
    return tidy({
      title: (info.title ?? '') + (info.subtitle ? `: ${info.subtitle}` : ''),
      author: Array.isArray(info.authors) ? info.authors.join(', ') : '',
      isbn: isbn?.identifier ?? '',
      published: info.publishedDate ? String(info.publishedDate).slice(0, 4) : '',
      pages: info.pageCount || null,
      summary: info.description ?? '',
      coverUrl: thumb.replace(/^http:/, 'https:'),
      source: 'googlebooks',
    });
  });
}

type OpenLibraryRecord = {
  title?: string;
  authors?: { name: string }[];
  publish_date?: string;
  number_of_pages?: number;
  cover?: { medium?: string };
};

export function fromOpenLibraryISBN(payload: unknown, isbn: string): CatalogueBook[] {
  const record = (payload as Record<string, OpenLibraryRecord>)?.[`ISBN:${isbn}`];
  if (!record) return [];
  return [tidy({
    title: record.title,
    author: Array.isArray(record.authors) ? record.authors.map((a) => a.name).join(', ') : '',
    isbn,
    published: record.publish_date ? (String(record.publish_date).match(/\d{4}/)?.[0] ?? '') : '',
    pages: record.number_of_pages || null,
    coverUrl: record.cover?.medium || `${COVERS}/b/isbn/${isbn}-M.jpg`,
    source: 'openlibrary',
  })];
}

/* ------------------------------------------------------------- lookups */

export async function searchByTitle(query: string, limit = 10): Promise<LookupResult> {
  const q = String(query ?? '').trim();
  if (!q) return { results: [], source: null };

  try {
    const url = `${OPENLIBRARY}/search.json?q=${encodeURIComponent(q)}&limit=${limit}` +
      '&fields=title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median';
    const results = fromOpenLibrarySearch(await getJSON(url));
    if (results.length) return { results, source: 'openlibrary' };
  } catch {
    // Fall through to Google Books.
  }

  const url = `${GOOGLE_BOOKS}/volumes?q=${encodeURIComponent(q)}&maxResults=${limit}`;
  return { results: fromGoogleBooks(await getJSON(url)), source: 'googlebooks' };
}

export async function searchByISBN(value: string): Promise<LookupResult> {
  const isbn = cleanISBN(value);
  if (!isbn) return { results: [], source: null };

  try {
    const url = `${OPENLIBRARY}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const results = fromOpenLibraryISBN(await getJSON(url), isbn);
    if (results.length) return { results, source: 'openlibrary' };
  } catch {
    // Fall through to Google Books.
  }

  const url = `${GOOGLE_BOOKS}/volumes?q=isbn:${encodeURIComponent(isbn)}`;
  return { results: fromGoogleBooks(await getJSON(url)), source: 'googlebooks' };
}

export async function lookup({ q = '', isbn = '' }: { q?: string; isbn?: string }): Promise<LookupResult> {
  if (isbn || looksLikeISBN(q)) return searchByISBN(isbn || q);
  return searchByTitle(q);
}
