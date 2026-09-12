import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let child;
let base;
let tmp;
let upstream;
let upstreamState = { openLibraryDown: false, hits: [] };

function listen(server) {
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server.address().port)));
}

// Stands in for Open Library and Google Books so tests exercise the real
// fetch/parse path without touching the internet.
function startUpstream() {
  upstream = createServer((req, res) => {
    upstreamState.hits.push(req.url);
    const send = (code, body) => {
      res.writeHead(code, { 'content-type': 'application/json' });
      res.end(JSON.stringify(body));
    };
    if (req.url.startsWith('/search.json')) {
      if (upstreamState.openLibraryDown) return send(500, { error: 'down' });
      return send(200, { docs: [{ title: 'Dune', author_name: ['Frank Herbert'], first_publish_year: 1965, cover_i: 42, isbn: ['9780441013593'] }] });
    }
    if (req.url.startsWith('/api/books')) {
      if (upstreamState.openLibraryDown) return send(500, { error: 'down' });
      return send(200, { 'ISBN:9780441013593': { title: 'Dune', authors: [{ name: 'Frank Herbert' }], publish_date: '1965', number_of_pages: 535 } });
    }
    if (req.url.startsWith('/volumes')) {
      return send(200, { items: [{ volumeInfo: { title: 'Dune (Google)', authors: ['Frank Herbert'], publishedDate: '1965', imageLinks: { thumbnail: 'http://books.google.com/x.jpg' } } }] });
    }
    send(404, { error: 'nope' });
  });
  return listen(upstream);
}

before(async () => {
  tmp = await mkdtemp(join(tmpdir(), 'lib-test-'));
  const upstreamPort = await startUpstream();
  const upstreamBase = `http://127.0.0.1:${upstreamPort}`;

  // Ask the OS for a free port, then hand it to the server.
  const probe = createServer();
  const port = await listen(probe);
  await new Promise((r) => probe.close(r));
  base = `http://127.0.0.1:${port}`;

  child = spawn(process.execPath, ['server.mjs'], {
    cwd: new URL('..', import.meta.url).pathname,
    env: {
      ...process.env,
      PORT: String(port),
      HOST: '127.0.0.1',
      DB_FILE: join(tmp, 'test.db'),
      OPENLIBRARY_BASE: upstreamBase,
      OPENLIBRARY_COVERS_BASE: upstreamBase,
      GOOGLE_BOOKS_BASE: upstreamBase,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve, reject) => {
    child.stdout.on('data', (d) => { if (String(d).includes('running')) resolve(); });
    child.on('error', reject);
    setTimeout(() => reject(new Error('server did not start')), 10000);
  });
});

after(async () => {
  if (child) child.kill();
  if (upstream) upstream.close();
  if (tmp) await rm(tmp, { recursive: true, force: true });
});

const api = async (path, options) => {
  const res = await fetch(base + path, {
    ...options,
    headers: options?.body ? { 'content-type': 'application/json' } : undefined,
  });
  return { status: res.status, body: await res.json().catch(() => null) };
};
const post = (path, body) => api(path, { method: 'POST', body: JSON.stringify(body) });

test('serves the app shell and its assets', async () => {
  for (const [path, type] of [['/', 'text/html'], ['/js/app.js', 'text/javascript'], ['/css/app.css', 'text/css'], ['/shared/statuses.mjs', 'text/javascript']]) {
    const res = await fetch(base + path);
    assert.equal(res.status, 200, path);
    assert.ok(res.headers.get('content-type').startsWith(type), `${path} -> ${res.headers.get('content-type')}`);
  }
});

test('refuses to serve files outside the project or the database', async () => {
  for (const path of ['/../../etc/passwd', '/%2e%2e/%2e%2e/etc/passwd', '/data/library.db', '/data/test.db']) {
    const res = await fetch(base + path, { redirect: 'manual' });
    assert.ok(res.status === 403 || res.status === 404, `${path} returned ${res.status}`);
  }
});

test('creates, reads, updates and deletes a book', async () => {
  const created = await post('/api/books', { title: 'Le Mort Darthur', author: 'Thomas Malory', code: '0000167' });
  assert.equal(created.status, 201);
  assert.equal(created.body.code, '0000167');
  assert.equal(created.body.status, 'available');
  assert.equal(created.body.history[0].note, 'Added to library');

  const id = created.body.id;
  const fetched = await api(`/api/books/${id}`);
  assert.equal(fetched.body.title, 'Le Mort Darthur');

  const patched = await api(`/api/books/${id}`, { method: 'PATCH', body: JSON.stringify({ author: 'Sir Thomas Malory' }) });
  assert.equal(patched.body.author, 'Sir Thomas Malory');

  const gone = await api(`/api/books/${id}`, { method: 'DELETE' });
  assert.equal(gone.status, 200);
  assert.equal((await api(`/api/books/${id}`)).status, 404);
});

test('rejects a duplicate barcode with the clashing book', async () => {
  await post('/api/books', { title: 'First', code: '0000200' });
  const clash = await post('/api/books', { title: 'Second', code: '200' });
  assert.equal(clash.status, 409);
  assert.match(clash.body.error, /already "First"/);
  assert.equal(clash.body.book.title, 'First');
});

test('requires a title', async () => {
  const res = await post('/api/books', { code: '0000201' });
  assert.equal(res.status, 400);
});

test('finds a book by barcode however it is padded', async () => {
  await post('/api/books', { title: 'Padded', code: '0000300' });
  for (const code of ['0000300', '300', '00300']) {
    const res = await api(`/api/books/by-code/${code}`);
    assert.equal(res.status, 200, code);
    assert.equal(res.body.title, 'Padded');
  }
  assert.equal((await api('/api/books/by-code/999999')).status, 404);
});

test('records loans with a borrower, a due date and history', async () => {
  const { body: book } = await post('/api/books', { title: 'Loanable', code: '0000400' });
  const loaned = await post(`/api/books/${book.id}/status`, { status: 'loaned', borrower: 'Sam', dueDate: '2026-10-01' });
  assert.equal(loaned.body.status, 'loaned');
  assert.equal(loaned.body.borrower, 'Sam');
  assert.equal(loaned.body.dueDate, '2026-10-01');

  // Returning it must clear the borrower and the due date.
  const back = await post(`/api/books/${book.id}/status`, { status: 'available' });
  assert.equal(back.body.borrower, '');
  assert.equal(back.body.dueDate, '');
  assert.deepEqual(back.body.history.map((h) => h.status), ['available', 'loaned', 'available']);
});

test('rejects an unknown status', async () => {
  const { body: book } = await post('/api/books', { title: 'Statuses', code: '0000401' });
  const res = await post(`/api/books/${book.id}/status`, { status: 'eaten-by-dog' });
  assert.equal(res.status, 400);
});

test('searches and filters the list', async () => {
  const all = await api('/api/books?q=&status=all');
  assert.ok(all.body.counts.all > 0);
  const byTitle = await api('/api/books?q=' + encodeURIComponent('padded'));
  assert.equal(byTitle.body.books.length, 1);
  const byCode = await api('/api/books?q=300');
  assert.equal(byCode.body.books[0].title, 'Padded');
  const byAuthor = await api('/api/books?q=' + encodeURIComponent('malory'));
  assert.ok(byAuthor.body.books.every((b) => /malory/i.test(b.author)), 'a word query must not match every book');
  assert.equal((await api('/api/books?q=zzzznope')).body.books.length, 0, 'a miss returns nothing');
  const byIsbn = await api('/api/books?q=9780441013593');
  assert.ok(Array.isArray(byIsbn.body.books));
  const loaned = await api('/api/books?status=loaned');
  assert.ok(loaned.body.books.every((b) => b.status === 'loaned'));
});

test('suggests the next shelf barcode', async () => {
  const before = (await api('/api/meta')).body.nextCode;
  await post('/api/books', { title: 'Sequence', code: before });
  const after = (await api('/api/meta')).body.nextCode;
  assert.equal(Number(after), Number(before) + 1);
  assert.equal(after.length, 7, 'stays zero padded');
});

test('stores and returns the library name', async () => {
  await api('/api/meta', { method: 'PUT', body: JSON.stringify({ name: "Marc's Shelf" }) });
  assert.equal((await api('/api/meta')).body.name, "Marc's Shelf");
  await api('/api/meta', { method: 'PUT', body: JSON.stringify({ name: '' }) });
  assert.equal((await api('/api/meta')).body.name, "MARC'S LIBRARY", 'falls back to the default');
});

test('looks a book up by title through Open Library', async () => {
  upstreamState.openLibraryDown = false;
  const res = await api('/api/lookup?q=dune');
  assert.equal(res.status, 200);
  assert.equal(res.body.source, 'openlibrary');
  assert.equal(res.body.results[0].title, 'Dune');
  assert.equal(res.body.results[0].author, 'Frank Herbert');
});

test('looks a book up by ISBN, and treats an ISBN in q as an ISBN', async () => {
  const byIsbn = await api('/api/lookup?isbn=9780441013593');
  assert.equal(byIsbn.body.results[0].pages, 535);
  const byQ = await api('/api/lookup?q=978-0-441-01359-3');
  assert.equal(byQ.body.results[0].title, 'Dune', 'an ISBN typed into the search box is looked up as one');
});

test('falls back to Google Books when Open Library fails', async () => {
  upstreamState.openLibraryDown = true;
  const res = await api('/api/lookup?q=dune');
  assert.equal(res.status, 200);
  assert.equal(res.body.source, 'googlebooks');
  assert.equal(res.body.results[0].title, 'Dune (Google)');
  assert.ok(res.body.results[0].coverUrl.startsWith('https://'));
  upstreamState.openLibraryDown = false;
});

test('requires a query for lookup', async () => {
  assert.equal((await api('/api/lookup')).status, 400);
});

test('exports and re-imports without duplicating books', async () => {
  const exported = (await api('/api/export')).body;
  const countBefore = exported.books.length;
  assert.ok(countBefore > 0);

  const again = await post('/api/import', exported);
  assert.equal(again.body.added, 0, 'nothing new on a re-import');
  assert.equal(again.body.updated, countBefore);
  assert.equal((await api('/api/meta')).body.counts.all, countBefore, 'book count unchanged');

  const fresh = await post('/api/import', { books: [{ title: 'Imported', code: '0000900', status: 'reading' }] });
  assert.equal(fresh.body.added, 1);
  assert.equal((await api('/api/books/by-code/0000900')).body.status, 'reading');
});

test('rejects a malformed import', async () => {
  assert.equal((await post('/api/import', { nope: true })).status, 400);
  const res = await fetch(base + '/api/import', { method: 'POST', headers: { 'content-type': 'application/json' }, body: 'not json' });
  assert.equal(res.status, 400);
});

test('books survive a server restart', async () => {
  const before = (await api('/api/meta')).body.counts.all;
  child.kill();
  await new Promise((r) => child.on('exit', r));

  const port = new URL(base).port;
  child = spawn(process.execPath, ['server.mjs'], {
    cwd: new URL('..', import.meta.url).pathname,
    env: { ...process.env, PORT: port, HOST: '127.0.0.1', DB_FILE: join(tmp, 'test.db') },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  await new Promise((resolve) => child.stdout.on('data', (d) => { if (String(d).includes('running')) resolve(); }));

  assert.equal((await api('/api/meta')).body.counts.all, before, 'same books after restart');
});

test('unknown endpoints and methods are handled', async () => {
  assert.equal((await api('/api/nonsense')).status, 404);
  const res = await fetch(base + '/index.html', { method: 'POST' });
  assert.equal(res.status, 405);
});
