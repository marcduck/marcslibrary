// End to end: drives a real production build in a real browser.
//
//   npm run build && npm run test:e2e
//
// A stub catalogue stands in for Open Library / Google Books so the run never
// touches the network.

import { chromium } from 'playwright';
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const ROOT = new URL('..', import.meta.url).pathname;
const CHROME = process.env.CHROME_PATH || undefined;
const SHOTS = process.env.SHOT_DIR;

const listen = (server) => new Promise((r) => server.listen(0, '127.0.0.1', () => r(server.address().port)));

let passed = 0;
let failed = 0;
const check = (label, actual, expected) => {
  const ok = expected === undefined ? Boolean(actual) : actual === expected;
  if (ok) { passed++; console.log(`  ok  ${label}${expected === undefined ? '' : ` (${actual})`}`); }
  else { failed++; console.log(`  FAIL ${label}: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`); }
};

// A 1x1 png stands in for a cover image.
const COVER = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
  'base64');

const CATALOGUE = [
  { title: 'Dune', author_name: ['Frank Herbert'], first_publish_year: 1965, cover_i: 1, isbn: ['9780441013593'], number_of_pages_median: 535 },
  { title: 'Dune Messiah', author_name: ['Frank Herbert'], first_publish_year: 1969, cover_i: 2, isbn: ['9780441172696'] },
  { title: 'Children of Dune', author_name: ['Frank Herbert'], first_publish_year: 1976, cover_i: 3, isbn: ['9780441104024'] },
];

const upstream = createServer((req, res) => {
  if (req.url.startsWith('/b/')) {
    res.writeHead(200, { 'content-type': 'image/png' });
    return res.end(COVER);
  }
  const json = (body) => { res.writeHead(200, { 'content-type': 'application/json' }); res.end(JSON.stringify(body)); };
  if (req.url.startsWith('/search.json')) return json({ docs: CATALOGUE });
  if (req.url.startsWith('/api/books')) return json({
    'ISBN:9780441013593': {
      title: 'Dune', authors: [{ name: 'Frank Herbert' }], publish_date: '1965', number_of_pages: 535,
      cover: { medium: `${upstreamBase}/b/id/1-M.jpg` },
    },
  });
  if (req.url.startsWith('/volumes')) return json({ items: [{ volumeInfo: { title: 'Dune (Google)', authors: ['Frank Herbert'], publishedDate: '1965' } }] });
  res.writeHead(404); res.end('{}');
});

const upstreamPort = await listen(upstream);
const upstreamBase = `http://127.0.0.1:${upstreamPort}`;

const probe = createServer();
const port = await listen(probe);
await new Promise((r) => probe.close(r));
const app = `http://127.0.0.1:${port}`;
const tmp = await mkdtemp(join(tmpdir(), 'lib-e2e-'));

console.log('starting next start...');
const server = spawn('npx', ['--no-install', 'next', 'start', '-p', String(port), '-H', '127.0.0.1'], {
  cwd: ROOT,
  env: {
    ...process.env,
    DB_FILE: join(tmp, 'e2e.db'),
    OPENLIBRARY_BASE: upstreamBase,
    OPENLIBRARY_COVERS_BASE: upstreamBase,
    GOOGLE_BOOKS_BASE: upstreamBase,
  },
  stdio: ['ignore', 'pipe', 'pipe'],
});
server.stderr.on('data', (d) => { const t = String(d); if (!t.includes('ExperimentalWarning') && !t.includes('trace-warnings')) process.stderr.write(t); });
await new Promise((resolve, reject) => {
  server.stdout.on('data', (d) => { if (/Ready|started server/i.test(String(d))) resolve(); });
  setTimeout(() => reject(new Error('next start did not come up')), 60000);
});

const errors = [];
const browser = await chromium.launch({ executablePath: CHROME, args: ['--no-sandbox'] });
const context = await browser.newContext({ viewport: { width: 390, height: 800 }, deviceScaleFactor: 2 });
const page = await context.newPage();
page.on('pageerror', (e) => errors.push(`PAGEERROR on ${new URL(page.url()).pathname}: ${e.message}`));
page.on('console', (m) => { if (m.type() === 'error') errors.push(`CONSOLE on ${new URL(page.url()).pathname}: ${m.text()}`); });

try {
  console.log('\nadding a book through the catalogue');
  await page.goto(`${app}/add`);
  await page.waitForSelector('input[aria-label="Search the catalogue"]');
  await page.fill('input[aria-label="Search the catalogue"]', 'dune');
  await page.click('button:has-text("Search")');
  await page.waitForSelector('.result');
  check('catalogue returned three results', await page.locator('.result').count(), 3);
  check('covers render', await page.locator('.result img.cover').count(), 3);
  check('names its source', (await page.textContent('.results + .hint')).trim(), 'Source: Open Library');

  await page.click('.result:first-child .result-btn');
  await page.waitForSelector('.picked');
  check('title filled in', await page.inputValue('input[name="title"]'), 'Dune');
  check('author filled in', await page.inputValue('input[name="author"]'), 'Frank Herbert');
  check('facts filled in', (await page.textContent('.picked .facts')).trim(), '1965 · 535 pages · ISBN 9780441013593');
  check('shelf barcode suggested', await page.inputValue('input[name="code"]'), '0000001');

  await page.click('button:has-text("Add to library")');
  await page.waitForSelector('.book-hero');
  check('lands on the new book', await page.textContent('.book-hero h2'), 'Dune');
  check('cover on the book page', await page.locator('.book-hero img.cover').count(), 1);
  check('metadata saved', (await page.textContent('.book-hero .facts')).trim(),
    'First published 1965 · 535 pages · ISBN 9780441013593');
  const bookUrl = page.url();

  console.log('\nchanging status');
  await page.click('.status-btn:has-text("Loaned")');
  await page.fill('input[placeholder="Name"]', 'Sam');
  await page.fill('input[type="date"]', '2026-10-01');
  await page.click('button:has-text("Save")');
  await page.waitForSelector('.status-loaned');
  check('status shows the borrower', (await page.textContent('.status-line')).includes('Sam'));

  const row = await (await fetch(`${app}/api/books/by-code/0000001`)).json();
  check('server stored the loan', row.status, 'loaned');
  check('server stored the borrower', row.borrower, 'Sam');
  check('server stored the due date', row.dueDate, '2026-10-01');
  check('server logged the history', row.history.length, 2);

  console.log('\nanother browser sees the same library');
  const other = await browser.newContext({ viewport: { width: 390, height: 800 } });
  const page2 = await other.newPage();
  await page2.goto(app + '/');
  await page2.waitForSelector('.book-row');
  check('second browser sees the loan', (await page2.textContent('.book-row')).includes('with Sam'));
  await other.close();

  console.log('\nscanning');
  await page.goto(`${app}/scan`);
  await page.waitForSelector('input[placeholder="0000167"]');
  check('scan page offers manual entry', await page.locator('form.inline-form.card').count(), 1);
  await page.fill('input[placeholder="0000167"]', '1');
  await page.click('button:has-text("Look up")');
  await page.waitForSelector('.book-hero');
  check('a shelf barcode opens the book', await page.textContent('.book-hero h2'), 'Dune');

  await page.goto(`${app}/scan`);
  await page.waitForSelector('input[placeholder="0000167"]');
  await page.fill('input[placeholder="0000167"]', '978-0-441-01359-3');
  await page.click('button:has-text("Look up")');
  await page.waitForSelector('.result', { timeout: 15000 });
  check('an unknown ISBN starts a lookup', await page.textContent('.result .book-title'), 'Dune');
  check('with a fresh shelf barcode', await page.inputValue('input[name="code"]'), '0000002');

  console.log('\nsearch and filters');
  for (const [title, author, code] of [['The Silmarillion', 'J.R.R. Tolkien', '0000010'], ['Piranesi', 'Susanna Clarke', '0000011']]) {
    await fetch(`${app}/api/books`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify({ title, author, code }) });
  }
  await page.goto(app + '/');
  await page.waitForSelector('.book-row');
  check('all three books listed', await page.locator('.book-row').count(), 3);

  await page.fill('input[aria-label="Search the library"]', 'tolkien');
  await page.waitForFunction(() => document.querySelectorAll('.book-row').length === 1, null, { timeout: 10000 });
  check('search narrows the list', await page.textContent('.book-row .book-title'), 'The Silmarillion');
  check('search is in the URL', new URL(page.url()).searchParams.get('q'), 'tolkien');

  await page.goto(app + '/');
  await page.waitForSelector('.chip');
  await page.click('.chip:has-text("Loaned")');
  await page.waitForFunction(() => document.querySelectorAll('.book-row').length === 1, null, { timeout: 10000 });
  check('filter narrows to loans', await page.textContent('.book-row .book-title'), 'Dune');

  console.log('\nlabel');
  await page.goto(bookUrl + '/label');
  await page.waitForSelector('.label-sheet svg');
  check('label shows the library name', (await page.textContent('.label-library')).trim(), "MARC'S LIBRARY");
  check('label shows the barcode number', (await page.textContent('.label-code')).trim(), '0000001');
  check('barcode has bars', (await page.locator('.label-sheet svg rect').count()) > 20);

  console.log('\nsettings');
  await page.goto(`${app}/settings`);
  await page.waitForSelector('input[name="name"]');
  await page.fill('input[name="name"]', "Marc's Shelf");
  await page.click('button:has-text("Save name")');
  await page.waitForTimeout(1200);
  await page.goto(app + '/');
  await page.waitForSelector('.topbar h1');
  check('renaming the library updates the header', await page.textContent('.topbar h1'), "Marc's Shelf");

  console.log('\nediting');
  await page.goto(bookUrl + '/edit');
  await page.waitForSelector('input[name="title"]');
  await page.fill('input[name="title"]', 'Dune (1965)');
  await page.click('button:has-text("Save changes")');
  await page.waitForSelector('.book-hero');
  check('edit saved', await page.textContent('.book-hero h2'), 'Dune (1965)');

  console.log('\nerror paths');
  await page.goto(`${app}/add`);
  await page.waitForSelector('input[name="title"]');
  await page.fill('input[name="title"]', 'Clash');
  await page.fill('input[name="code"]', '0000001');
  await page.click('button:has-text("Add to library")');
  await page.waitForSelector('.hint.error');
  check('duplicate barcode is refused', (await page.textContent('.hint.error')).includes('already'));

  await page.goto(`${app}/books/bk_nope`);
  await page.waitForSelector('.empty');
  check('a missing book shows the not-found page', (await page.textContent('.empty')).includes('not here'));

  console.log('\ndeleting');
  await page.goto(bookUrl);
  await page.waitForSelector('.book-hero');
  page.once('dialog', (d) => d.accept());
  await page.click('button:has-text("Remove book")');
  await page.waitForSelector('.book-list, .empty');
  check('book removed from the list', (await page.textContent('.view')).includes('Dune (1965)'), false);

  if (SHOTS) {
    await page.goto(app + '/');
    await page.waitForSelector('.book-row');
    await page.screenshot({ path: join(SHOTS, 'n-library.png') });
    await page.goto(`${app}/add`);
    await page.waitForSelector('input[aria-label="Search the catalogue"]');
    await page.fill('input[aria-label="Search the catalogue"]', 'dune');
    await page.click('button:has-text("Search")');
    await page.waitForSelector('.result');
    await page.screenshot({ path: join(SHOTS, 'n-add.png') });
  }

  const unexpected = errors.filter((e) => !/Failed to load resource|ERR_CONNECTION/.test(e));
  check('no unexpected browser errors', unexpected.length, 0);
  if (unexpected.length) console.log(unexpected);
} finally {
  await browser.close();
  server.kill();
  upstream.close();
  await rm(tmp, { recursive: true, force: true });
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed ? 1 : 0);
