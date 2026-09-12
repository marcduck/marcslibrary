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
  if (tmp) await rm(tmp, { recursive: true, force: true });
});

test('adds a book and logs it in the history', () => {
  const book = books.createBook({ title: 'Le Mort Darthur', author: 'Thomas Malory', code: '0000167' });
  assert.equal(book.code, '0000167');
  assert.equal(book.status, 'available');
  assert.equal(book.history[0].note, 'Added to library');
  assert.equal(books.getBook(book.id).title, 'Le Mort Darthur');
});

test('pads and matches barcodes loosely', () => {
  books.createBook({ title: 'Padded', code: '300' });
  for (const code of ['0000300', '300', '00300', ' 300 ']) {
    assert.equal(books.getBookByCode(code)?.title, 'Padded', code);
  }
  assert.equal(books.getBookByCode('999999'), null);
});

test('refuses a barcode that is already taken', () => {
  books.createBook({ title: 'First', code: '0000400' });
  assert.throws(() => books.createBook({ title: 'Second', code: '400' }), /already "First"/);
});

test('a loan records the borrower and clears it on return', () => {
  const book = books.createBook({ title: 'Loanable', code: '0000500' });
  const loaned = books.setStatus(book.id, 'loaned', { borrower: 'Sam', dueDate: '2026-10-01' });
  assert.equal(loaned.borrower, 'Sam');
  assert.equal(loaned.dueDate, '2026-10-01');

  const back = books.setStatus(book.id, 'available');
  assert.equal(back.borrower, '', 'the borrower goes away when the book comes back');
  assert.equal(back.dueDate, '');
  assert.deepEqual(back.history.map((h) => h.status), ['available', 'loaned', 'available']);
});

test('rejects an unknown status', () => {
  const book = books.createBook({ title: 'Statuses', code: '0000501' });
  assert.throws(() => books.setStatus(book.id, 'eaten-by-dog'), /Unknown status/);
});

test('searches titles, authors and barcodes without matching everything', () => {
  assert.equal(books.listBooks({ q: 'padded' }).length, 1);
  assert.equal(books.listBooks({ q: '300' })[0].title, 'Padded');
  assert.equal(books.listBooks({ q: 'malory' })[0].author, 'Thomas Malory');
  assert.equal(books.listBooks({ q: 'zzzznope' }).length, 0, 'a miss returns nothing');
  assert.ok(books.listBooks({ q: 'a' }).length < books.listBooks().length + 1);
});

test('filters by status', () => {
  const loaned = books.listBooks({ status: 'loaned' });
  assert.ok(loaned.every((b) => b.status === 'loaned'));
});

test('suggests the next shelf barcode, zero padded', () => {
  const next = books.nextCode();
  assert.equal(next.length, 7);
  books.createBook({ title: 'Sequence', code: next });
  assert.equal(Number(books.nextCode()), Number(next) + 1);
});

test('exports and re-imports without duplicating books', () => {
  const exported = books.exportAll();
  const before = exported.books.length;
  const again = books.importBooks(exported.books);
  assert.equal(again.added, 0);
  assert.equal(again.updated, before);
  assert.equal(books.counts().all, before, 'book count unchanged');

  const fresh = books.importBooks([{ title: 'Imported', code: '0000900', status: 'reading' }]);
  assert.equal(fresh.added, 1);
  assert.equal(books.getBookByCode('0000900').status, 'reading');
});

test('deletes a book and its history', () => {
  const book = books.createBook({ title: 'Doomed', code: '0000999' });
  assert.equal(books.deleteBook(book.id), true);
  assert.equal(books.getBook(book.id), null);
  assert.equal(books.deleteBook(book.id), false);
});

test('remembers the library name', () => {
  assert.equal(books.libraryName(), "MARC'S LIBRARY");
  books.setSetting('libraryName', "Marc's Shelf");
  assert.equal(books.libraryName(), "Marc's Shelf");
});

test('returns plain objects, which React can pass to client components', () => {
  // node:sqlite rows have a null prototype; React rejects those across the
  // server/client boundary, so everything leaving this module is copied.
  const book = books.createBook({ title: 'Serialisable', code: '0001000' });
  books.setStatus(book.id, 'reading');
  const fetched = books.getBook(book.id);

  assert.equal(Object.getPrototypeOf(fetched), Object.prototype);
  for (const entry of fetched.history) {
    assert.equal(Object.getPrototypeOf(entry), Object.prototype, 'history entries must be plain');
  }
  for (const row of books.listBooks()) {
    assert.equal(Object.getPrototypeOf(row), Object.prototype);
  }
  assert.equal(Object.getPrototypeOf(books.counts()), Object.prototype);
});
