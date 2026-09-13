# Todo

Found during a cleanup pass. Not yet fixed unless noted.

## Bugs

- **Duplicate-barcode race condition.** `createBook()` in `lib/books.ts` checks
  for a clashing barcode, then inserts. Two adds submitted at nearly the same
  moment can both pass the check before either insert lands. The database's
  own `UNIQUE` constraint on `code_key` will then reject the second insert,
  but that raw database error is not caught as a `ConflictError`, so the user
  sees a raw driver message instead of "Barcode X is already ...". Narrow
  window, but a real gap. Fix: catch the constraint error in `createBook()`
  and re-check for a clash, or wrap the check-and-insert in one statement.

- **Status-filter click fires two navigations.** In
  `components/LibrarySearch.tsx`, clicking a status chip calls `navigate()`
  immediately. That changes the URL, which changes the `status` value the
  component reads, which re-runs the debounced search effect 250ms later and
  calls `navigate()` again with the same values. Harmless (same resulting
  URL) but it's an extra server round-trip on every filter click. Predates
  this cleanup; not introduced by it. Fix: skip the debounce effect when the
  change came from `setStatusFilter` rather than typing (e.g. track the
  source in a ref).

- **Scanned barcode shown unpadded until edited.** In `components/BookForm.tsx`
  (previously `AddBookForm.tsx`), the barcode field's initial value is the raw
  scanned code (`scannedCode || nextCode`), not run through `padCode()`. Scan
  a 13-digit ISBN as an unknown code and the field shows all 13 digits — but
  the moment you type anything else, `padCode()` clips it to the last 7
  digits, which can look like the field just ate half the number. Predates
  this cleanup. Fix: run the initial value through `padCode()` too, or drop
  the clipping behavior.

## Gaps / hardening

- No browser-level end-to-end tests. The old `scripts/e2e.mjs` was deleted
  this session because it tested a different, older app (see below) — it
  hadn't been touched since before the last simplification and its
  `playwright` import wasn't even an installed dependency. Right now only
  the Node unit tests in `test/books.test.mjs` (data layer) exist; there's no
  test that drives an actual page in a browser.

- Misconfigured Turso deploys fail late. If `TURSO_DATABASE_URL` is set but
  `TURSO_AUTH_TOKEN` is not, `lib/db.ts` still calls `createClient()` with
  `authToken: undefined` and only fails once a query runs, with whatever
  error `@libsql/client` gives — not a clear "you forgot the auth token"
  message at startup.

## Possibly-missing features

The **old** `README.md` and the deleted `scripts/e2e.mjs` described a
noticeably bigger app than what's actually in the code today: catalogue
lookup (Open Library / Google Books) to auto-fill title/author/cover from an
ISBN, cover images, printable Code 128 labels, a Settings page (library name,
JSON export/import), and loan tracking with a borrower name and due date (the
current status model just has a bare `loaned` status, no who or when).

I don't know whether these were deliberately cut in an earlier simplification
pass or just never removed from the docs — I rewrote the README to match the
current app rather than guessing. Listing them here in case any were meant to
come back.
