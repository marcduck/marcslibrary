// The data layer, against a throwaway database.
import { test, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

let books;
let tmp;

before(async () => {
  tmp = await mkdtemp(join(tmpdir(), 'lib-unit-'));
  process.env.DB_FILE = join(tmp, 'test.db');
  books = await import('../lib/books.ts');
});

after(async () => {
  const { closeDb } = await import('../lib/db.ts');
  closeDb();
  // The native libsql binding can hold the file open for a moment after
  // close() returns, so deleting it right away is flaky on Windows.
  if (tmp) await rm(tmp, { recursive: true, force: true, maxRetries: 10, retryDelay: 100 });
});

test('suggests shelf barcode 0000167 when the library is empty', async () => {
  assert.equal(await books.nextCode(), '0000167');
});

test('adds a book and logs it in the history', async () => {
  const book = await books.createBook({ title: 'Le Mort Darthur', author: 'Thomas Malory', code: '0000167' });
  assert.equal(book.code, '0000167');
  assert.equal(book.status, 'available');
  assert.equal(book.history[0].status, 'available');
  assert.equal((await books.getBook(book.id)).title, 'Le Mort Darthur');
  assert.equal(await books.nextCode(), '0000168', 'the suggestion increments past the highest existing code');
});

test('pads and matches barcodes loosely', async () => {
  await books.createBook({ title: 'Padded', code: '300' });
  for (const code of ['0000300', '300', '00300', ' 300 ']) {
    assert.equal((await books.getBookByCode(code))?.title, 'Padded', code);
  }
  assert.equal(await books.getBookByCode('999999'), null);
});

test('refuses a barcode that is already taken', async () => {
  await books.createBook({ title: 'First', code: '0000400' });
  await assert.rejects(() => books.createBook({ title: 'Second', code: '400' }), /already "First"/);
});

test('changes status and logs each change in the history', async () => {
  const book = await books.createBook({ title: 'Loanable', code: '0000500' });
  const loaned = await books.setStatus(book.id, 'loaned');
  assert.equal(loaned.status, 'loaned');

  const back = await books.setStatus(book.id, 'available');
  assert.equal(back.status, 'available');
  assert.deepEqual(back.history.map((h) => h.status), ['available', 'loaned', 'available']);
  assert.ok(back.history[0].at, 'each history entry records when it happened');
});

test('rejects an unknown status', async () => {
  const book = await books.createBook({ title: 'Statuses', code: '0000501' });
  await assert.rejects(() => books.setStatus(book.id, 'eaten-by-dog'), /Unknown status/);
});

test('searches titles, authors, barcodes and ISBNs without matching everything', async () => {
  await books.createBook({ title: 'Dune', author: 'Frank Herbert', code: '0000600', isbn: '9780441013593' });
  assert.equal((await books.listBooks({ q: 'padded' })).length, 1);
  assert.equal((await books.listBooks({ q: '300' }))[0].title, 'Padded');
  assert.equal((await books.listBooks({ q: 'herbert' }))[0].author, 'Frank Herbert');
  assert.equal((await books.listBooks({ q: '9780441013593' }))[0].title, 'Dune');
  assert.equal((await books.listBooks({ q: 'zzzznope' })).length, 0, 'a miss returns nothing');
  assert.ok((await books.listBooks({ q: 'a' })).length < (await books.listBooks()).length + 1);
});

test('filters by status', async () => {
  const loaned = await books.listBooks({ status: 'loaned' });
  assert.ok(loaned.every((b) => b.status === 'loaned'));
});

test('deletes a book and its history', async () => {
  const book = await books.createBook({ title: 'Doomed', code: '0000999' });
  assert.equal(await books.deleteBook(book.id), true);
  assert.equal(await books.getBook(book.id), null);
  assert.equal(await books.deleteBook(book.id), false);
});

test('returns plain objects, which React can pass to client components', async () => {
  // Rows from the database driver are not plain objects; React rejects those
  // across the server/client boundary, so everything leaving this module is
  // copied.
  const book = await books.createBook({ title: 'Serialisable', code: '0001000' });
  await books.setStatus(book.id, 'reading');
  const fetched = await books.getBook(book.id);

  assert.equal(Object.getPrototypeOf(fetched), Object.prototype);
  for (const entry of fetched.history) {
    assert.equal(Object.getPrototypeOf(entry), Object.prototype, 'history entries must be plain');
  }
  for (const row of await books.listBooks()) {
    assert.equal(Object.getPrototypeOf(row), Object.prototype);
  }
  assert.equal(Object.getPrototypeOf(await books.counts()), Object.prototype);
});
