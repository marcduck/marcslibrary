import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  fromOpenLibrarySearch, fromGoogleBooks, fromOpenLibraryISBN,
  cleanISBN, looksLikeISBN,
} from '../lib/booklookup.mjs';

test('parses an Open Library search response', () => {
  const payload = {
    numFound: 2,
    docs: [
      {
        title: 'Dune',
        author_name: ['Frank Herbert'],
        first_publish_year: 1965,
        isbn: ['9780441013593', '0441013written'],
        cover_i: 8474036,
        number_of_pages_median: 535,
      },
      { title: 'Dune Messiah', author_name: ['Frank Herbert', 'Someone Else'], first_publish_year: 1969 },
    ],
  };
  const [dune, messiah] = fromOpenLibrarySearch(payload);
  assert.equal(dune.title, 'Dune');
  assert.equal(dune.author, 'Frank Herbert');
  assert.equal(dune.isbn, '9780441013593');
  assert.equal(dune.published, '1965');
  assert.equal(dune.pages, 535);
  assert.match(dune.coverUrl, /\/b\/id\/8474036-M\.jpg$/);
  assert.equal(messiah.author, 'Frank Herbert, Someone Else');
  assert.equal(messiah.coverUrl, '', 'no cover id and no isbn means no cover');
});

test('parses a Google Books response and upgrades http thumbnails', () => {
  const payload = {
    items: [{
      volumeInfo: {
        title: 'Dune',
        subtitle: 'A Novel',
        authors: ['Frank Herbert'],
        publishedDate: '1965-08-01',
        pageCount: 412,
        description: 'Set on the desert planet Arrakis.',
        industryIdentifiers: [
          { type: 'ISBN_10', identifier: '0441013597' },
          { type: 'ISBN_13', identifier: '9780441013593' },
        ],
        imageLinks: { thumbnail: 'http://books.google.com/books/content?id=abc&zoom=1' },
      },
    }],
  };
  const [book] = fromGoogleBooks(payload);
  assert.equal(book.title, 'Dune: A Novel');
  assert.equal(book.isbn, '9780441013593', 'prefers the 13 digit ISBN');
  assert.equal(book.published, '1965');
  assert.equal(book.pages, 412);
  assert.ok(book.coverUrl.startsWith('https://'), 'thumbnail must be https');
});

test('parses an Open Library ISBN lookup', () => {
  const payload = {
    'ISBN:9780441013593': {
      title: 'Dune',
      authors: [{ name: 'Frank Herbert' }],
      publish_date: 'August 1, 1965',
      number_of_pages: 535,
      cover: { medium: 'https://covers.openlibrary.org/b/id/8474036-M.jpg' },
    },
  };
  const [book] = fromOpenLibraryISBN(payload, '9780441013593');
  assert.equal(book.title, 'Dune');
  assert.equal(book.published, '1965', 'year pulled out of a free text date');
  assert.equal(book.pages, 535);
});

test('handles empty and malformed payloads without throwing', () => {
  assert.deepEqual(fromOpenLibrarySearch({}), []);
  assert.deepEqual(fromOpenLibrarySearch({ docs: null }), []);
  assert.deepEqual(fromGoogleBooks({}), []);
  assert.deepEqual(fromGoogleBooks({ items: [{}] }).length, 1);
  assert.deepEqual(fromOpenLibraryISBN({}, '123'), []);
});

test('recognises ISBN barcodes but not shelf labels', () => {
  assert.equal(looksLikeISBN('978-0-441-01359-3'), true);
  assert.equal(looksLikeISBN('9791234567896'), true, '979 prefix is also an ISBN');
  assert.equal(looksLikeISBN('0441013597'), true);
  assert.equal(looksLikeISBN('0000167'), false, 'a shelf label is not an ISBN');
  assert.equal(looksLikeISBN('5012345678900'), false, 'a non-book EAN is not an ISBN');
  assert.equal(cleanISBN('978-0-441-01359-3'), '9780441013593');
});
