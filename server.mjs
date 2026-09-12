// Static file server + JSON API for the library. Standard library only:
// node:http for serving, node:sqlite for storage.

import { createServer } from 'node:http';
import { createServer as createSecureServer } from 'node:https';
import { readFileSync } from 'node:fs';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import * as db from './lib/db.mjs';
import { lookup, looksLikeISBN } from './lib/booklookup.mjs';
import { STATUSES } from './shared/statuses.mjs';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const PORT = Number(process.env.PORT || 3000);
const HOST = process.env.HOST || '0.0.0.0';
const DB_FILE = process.env.DB_FILE || join(ROOT, 'data', 'library.db');
const MAX_BODY = 5 * 1024 * 1024; // generous enough for an import, small enough to be safe

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.ico': 'image/x-icon',
};

db.open(DB_FILE);

/* ------------------------------------------------------------- plumbing */

function sendJSON(res, status, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'content-length': Buffer.byteLength(body),
    'cache-control': 'no-store',
  });
  res.end(body);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    let size = 0;
    req.on('data', (chunk) => {
      size += chunk.length;
      if (size > MAX_BODY) {
        reject(Object.assign(new Error('Request body too large.'), { status: 413 }));
        req.destroy();
        return;
      }
      chunks.push(chunk);
    });
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString('utf8');
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (err) {
        reject(Object.assign(new Error('Request body is not valid JSON.'), { status: 400 }));
      }
    });
    req.on('error', reject);
  });
}

async function serveStatic(req, res, pathname) {
  const relative = pathname === '/' ? 'index.html' : decodeURIComponent(pathname).slice(1);
  // Keep the served path inside the project directory.
  const target = normalize(join(ROOT, relative));
  if (!target.startsWith(ROOT) || relative.split(/[\\/]/).includes('..')) {
    return sendJSON(res, 403, { error: 'Forbidden' });
  }
  if (target.startsWith(join(ROOT, 'data') + sep)) {
    return sendJSON(res, 403, { error: 'Forbidden' });
  }

  try {
    const info = await stat(target);
    if (info.isDirectory()) return serveStatic(req, res, join(pathname, 'index.html'));
    const body = await readFile(target);
    res.writeHead(200, {
      'content-type': MIME[extname(target)] || 'application/octet-stream',
      'content-length': body.length,
      'cache-control': 'no-cache',
    });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch (err) {
    sendJSON(res, 404, { error: 'Not found' });
  }
}

/* ----------------------------------------------------------------- API */

async function handleAPI(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean).slice(1); // drop "api"
  const [resource, id, action] = parts;
  const method = req.method;

  if (resource === 'meta' && method === 'GET') {
    return sendJSON(res, 200, {
      name: db.getSetting('libraryName', "MARC'S LIBRARY"),
      statuses: STATUSES,
      counts: db.counts(),
      nextCode: db.nextCode(),
    });
  }

  if (resource === 'meta' && method === 'PUT') {
    const body = await readBody(req);
    if (typeof body.name === 'string') {
      db.setSetting('libraryName', body.name.trim() || "MARC'S LIBRARY");
    }
    return sendJSON(res, 200, { name: db.getSetting('libraryName', "MARC'S LIBRARY") });
  }

  if (resource === 'lookup' && method === 'GET') {
    const q = url.searchParams.get('q') || '';
    const isbn = url.searchParams.get('isbn') || '';
    if (!q && !isbn) return sendJSON(res, 400, { error: 'Pass ?q= or ?isbn=' });
    try {
      const found = await lookup({ q, isbn });
      return sendJSON(res, 200, found);
    } catch (err) {
      const reason = err.name === 'TimeoutError' || err.name === 'AbortError'
        ? 'the catalogue did not respond in time'
        : err.message;
      return sendJSON(res, 502, { error: `Book lookup failed: ${reason}.` });
    }
  }

  if (resource === 'export' && method === 'GET') {
    return sendJSON(res, 200, db.exportAll());
  }

  if (resource === 'import' && method === 'POST') {
    const body = await readBody(req);
    const books = Array.isArray(body) ? body : body.books;
    if (!Array.isArray(books)) return sendJSON(res, 400, { error: 'No "books" array found in that file.' });
    if (typeof body.name === 'string' && body.name.trim()) db.setSetting('libraryName', body.name.trim());
    try {
      return sendJSON(res, 200, db.importBooks(books, { replace: Boolean(body.replace) }));
    } catch (err) {
      return sendJSON(res, 400, { error: err.message });
    }
  }

  if (resource === 'books') {
    // /api/books/by-code/0000167
    if (id === 'by-code' && method === 'GET') {
      const book = db.getBookByCode(parts.slice(2).join('/'));
      if (!book) return sendJSON(res, 404, { error: 'No book with that barcode.' });
      return sendJSON(res, 200, book);
    }

    if (!id && method === 'GET') {
      return sendJSON(res, 200, {
        books: db.listBooks({ q: url.searchParams.get('q') || '', status: url.searchParams.get('status') || 'all' }),
        counts: db.counts(),
      });
    }

    if (!id && method === 'POST') {
      const body = await readBody(req);
      if (!String(body.title || '').trim()) return sendJSON(res, 400, { error: 'A title is required.' });
      try {
        return sendJSON(res, 201, db.createBook(body));
      } catch (err) {
        return sendJSON(res, err.name === 'ConflictError' ? 409 : 400, { error: err.message, book: err.book });
      }
    }

    if (id && !action && method === 'GET') {
      const book = db.getBook(id);
      return book ? sendJSON(res, 200, book) : sendJSON(res, 404, { error: 'Book not found.' });
    }

    if (id && !action && method === 'PATCH') {
      const body = await readBody(req);
      try {
        const book = db.updateBook(id, body);
        return book ? sendJSON(res, 200, book) : sendJSON(res, 404, { error: 'Book not found.' });
      } catch (err) {
        return sendJSON(res, err.name === 'ConflictError' ? 409 : 400, { error: err.message, book: err.book });
      }
    }

    if (id && !action && method === 'DELETE') {
      return db.deleteBook(id)
        ? sendJSON(res, 200, { deleted: true })
        : sendJSON(res, 404, { error: 'Book not found.' });
    }

    if (id && action === 'status' && method === 'POST') {
      const body = await readBody(req);
      try {
        const book = db.setStatus(id, body.status, body);
        return book ? sendJSON(res, 200, book) : sendJSON(res, 404, { error: 'Book not found.' });
      } catch (err) {
        return sendJSON(res, 400, { error: err.message });
      }
    }
  }

  return sendJSON(res, 404, { error: 'Unknown endpoint.' });
}

/* -------------------------------------------------------------- server */

// Browsers only hand out the camera in a secure context, so serving over
// https is what makes scanning work from a phone on the local network.
// Point TLS_CERT and TLS_KEY at a certificate to switch it on (see the README).
const tlsCert = process.env.TLS_CERT;
const tlsKey = process.env.TLS_KEY;
const tls = tlsCert && tlsKey
  ? { cert: readFileSync(tlsCert), key: readFileSync(tlsKey) }
  : null;

const handler = async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  try {
    if (url.pathname.startsWith('/api/')) return await handleAPI(req, res, url);
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      return sendJSON(res, 405, { error: 'Method not allowed' });
    }
    return await serveStatic(req, res, url.pathname);
  } catch (err) {
    if (res.headersSent) return res.end();
    sendJSON(res, err.status || 500, { error: err.message || 'Server error' });
  }
};

const server = tls ? createSecureServer(tls, handler) : createServer(handler);

server.listen(PORT, HOST, () => {
  const scheme = tls ? 'https' : 'http';
  console.log(`Marc's Library running at ${scheme}://localhost:${PORT}  (database: ${DB_FILE})`);
  if (!tls) {
    console.log('Serving over http: the camera will work on this machine, but phones on the');
    console.log('network need https to open it. See "Scanning from your phone" in the README.');
  }
});

for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => {
    server.close();
    db.close();
    process.exit(0);
  });
}
