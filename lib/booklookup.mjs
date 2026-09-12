// Book metadata from free, key-free APIs: Open Library first, Google Books as a
// fallback when Open Library is unreachable or finds nothing.
//
// Both base URLs are overridable so tests can point at a local stub.

const OPENLIBRARY = process.env.OPENLIBRARY_BASE || 'https://openlibrary.org';
const COVERS = process.env.OPENLIBRARY_COVERS_BASE || 'https://covers.openlibrary.org';
const GOOGLE_BOOKS = process.env.GOOGLE_BOOKS_BASE || 'https://www.googleapis.com/books/v1';

const TIMEOUT_MS = Number(process.env.LOOKUP_TIMEOUT_MS || 8000);

async function getJSON(url) {
  const response = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      // Open Library asks that clients identify themselves.
      'User-Agent': 'marcslibrary/1.0 (self-hosted personal library)',
      'Accept': 'application/json',
    },
  });
  if (!response.ok) throw new Error(`${new URL(url).host} replied ${response.status}`);
  return response.json();
}

export function cleanISBN(value) {
  return String(value || '').replace(/[^0-9Xx]/g, '').toUpperCase();
}

// EAN-13 barcodes on book covers starting 978/979 are ISBNs; so are bare 10s.
export function looksLikeISBN(value) {
  const isbn = cleanISBN(value);
  if (isbn.length === 13) return /^97[89]/.test(isbn);
  return isbn.length === 10;
}

/* ------------------------------------------------------- pure transforms */

export function fromOpenLibrarySearch(payload) {
  const docs = Array.isArray(payload?.docs) ? payload.docs : [];
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

export function fromGoogleBooks(payload) {
  const items = Array.isArray(payload?.items) ? payload.items : [];
  return items.map((item) => {
    const info = item.volumeInfo || {};
    const ids = Array.isArray(info.industryIdentifiers) ? info.industryIdentifiers : [];
    const isbn13 = ids.find((i) => i.type === 'ISBN_13');
    const isbn10 = ids.find((i) => i.type === 'ISBN_10');
    // Google serves http thumbnails; upgrade so they load on an https page.
    const thumb = info.imageLinks?.thumbnail || info.imageLinks?.smallThumbnail || '';
    return tidy({
      title: info.title + (info.subtitle ? `: ${info.subtitle}` : ''),
      author: Array.isArray(info.authors) ? info.authors.join(', ') : '',
      isbn: (isbn13 || isbn10)?.identifier || '',
      published: info.publishedDate ? String(info.publishedDate).slice(0, 4) : '',
      pages: info.pageCount || null,
      summary: info.description || '',
      coverUrl: thumb.replace(/^http:/, 'https:'),
      source: 'googlebooks',
    });
  });
}

export function fromOpenLibraryISBN(payload, isbn) {
  const key = `ISBN:${isbn}`;
  const record = payload?.[key];
  if (!record) return [];
  return [tidy({
    title: record.title,
    author: Array.isArray(record.authors) ? record.authors.map((a) => a.name).join(', ') : '',
    isbn,
    published: record.publish_date ? String(record.publish_date).match(/\d{4}/)?.[0] || '' : '',
    pages: record.number_of_pages || null,
    coverUrl: record.cover?.medium || `${COVERS}/b/isbn/${isbn}-M.jpg`,
    source: 'openlibrary',
  })];
}

function tidy(book) {
  return {
    title: String(book.title || '').trim(),
    author: String(book.author || '').trim(),
    isbn: cleanISBN(book.isbn),
    published: String(book.published || '').trim(),
    pages: book.pages || null,
    summary: String(book.summary || '').trim().slice(0, 2000),
    coverUrl: String(book.coverUrl || '').trim(),
    source: book.source,
  };
}

/* ------------------------------------------------------------- lookups */

export async function searchByTitle(query, limit = 10) {
  const q = String(query || '').trim();
  if (!q) return { results: [], source: null };

  try {
    const url = `${OPENLIBRARY}/search.json?q=${encodeURIComponent(q)}&limit=${limit}` +
      '&fields=title,author_name,first_publish_year,isbn,cover_i,number_of_pages_median';
    const results = fromOpenLibrarySearch(await getJSON(url));
    if (results.length) return { results, source: 'openlibrary' };
  } catch (err) {
    // Fall through to Google Books.
  }

  const url = `${GOOGLE_BOOKS}/volumes?q=${encodeURIComponent(q)}&maxResults=${limit}`;
  return { results: fromGoogleBooks(await getJSON(url)), source: 'googlebooks' };
}

export async function searchByISBN(value) {
  const isbn = cleanISBN(value);
  if (!isbn) return { results: [], source: null };

  try {
    const url = `${OPENLIBRARY}/api/books?bibkeys=ISBN:${isbn}&format=json&jscmd=data`;
    const results = fromOpenLibraryISBN(await getJSON(url), isbn);
    if (results.length) return { results, source: 'openlibrary' };
  } catch (err) {
    // Fall through to Google Books.
  }

  const url = `${GOOGLE_BOOKS}/volumes?q=isbn:${encodeURIComponent(isbn)}`;
  return { results: fromGoogleBooks(await getJSON(url)), source: 'googlebooks' };
}

export async function lookup({ q = '', isbn = '' } = {}) {
  if (isbn || looksLikeISBN(q)) return searchByISBN(isbn || q);
  return searchByTitle(q);
}
