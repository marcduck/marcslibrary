# Marc's Library

A barebones library app. Every book has a barcode label; scan one with your phone
camera to pull up the book and change its status.

Books live in a SQLite database on the server, so every phone and laptop you open
it on sees the same library. Adding a book looks it up in a free online catalogue
and fills in the cover, author, year and page count for you.

The server needs **Node 22.5 or newer** and has **no npm dependencies** — it uses
`node:http` and `node:sqlite` from the standard library.

## Running it

```sh
npm start              # http://localhost:3000
```

The database is created at `data/library.db` on first run. Useful environment
variables:

| Variable | Default | What it's for |
| --- | --- | --- |
| `PORT` | `3000` | Port to listen on |
| `HOST` | `0.0.0.0` | Interface to bind |
| `DB_FILE` | `data/library.db` | Where the database lives |
| `TLS_CERT`, `TLS_KEY` | *(none)* | Serve over https — see below |

## Scanning from your phone

Browsers only hand out the camera in a **secure context**, so `http://localhost`
works on the machine running the server, but `http://192.168.1.x` from your phone
does **not** — you'll get the barcode box but no camera. Pick one of these:

**Self-signed certificate** (works on any network):

```sh
openssl req -x509 -newkey rsa:2048 -nodes -days 825 \
  -keyout data/key.pem -out data/cert.pem \
  -subj "/CN=marcslibrary" -addext "subjectAltName=IP:192.168.1.50"

TLS_CERT=data/cert.pem TLS_KEY=data/key.pem npm start
```

Use your server's own LAN address in `subjectAltName`. Your phone will warn that
the certificate is untrusted the first time — accept it, and the camera works
from then on.

**A tunnel** — [Tailscale](https://tailscale.com) (`tailscale serve 3000`),
Cloudflare Tunnel or ngrok all give you a real HTTPS address with no certificate
warnings, and let you reach your library from outside the house.

Either way, typing a barcode number by hand always works, camera or not.

## Using it

- **Library** — every book, searchable by title, author, borrower, barcode or
  ISBN, filterable by status. Covers are shown alongside.
- **Scan** — point the camera at a label. A known shelf barcode opens that book.
  An **ISBN barcode** off the back of a book you don't own yet opens the Add form
  and looks the book up automatically, so a new book is two taps from scanned to
  shelved. There's a manual entry box for scuffed labels.
- **Add** — search the catalogue by title, author or ISBN, pick the right result
  to fill in the details and cover, then save. Every field can be typed by hand
  instead, and the next shelf barcode is suggested for you.
- **Status** — each book is *Available*, *Loaned*, *On hold*, *Reading* or
  *Missing*. Loans and holds record who has it; loans get a due date shown as a
  countdown that turns red when overdue. Every change is logged in the history.
- **Labels** — *Print label* renders a Code 128 label in the same layout as the
  printed ones (library name, title, barcode, number) and prints just the label.
- **Settings** — library name for labels, and JSON export/import. If you used the
  earlier browser-storage version, Settings offers to upload those books to the
  server.

## Where the books are

In `data/library.db`. Back it up by copying that file, or use **Settings → Export
backup** for a JSON copy. Import merges by barcode, so re-importing a backup
updates books rather than duplicating them.

**There is no login.** Anyone who can reach the server can read and change the
library, so keep it on your home network or behind a tunnel that requires
sign-in — don't put it on a public IP as-is.

## Book data

Lookups go to [Open Library](https://openlibrary.org) first and fall back to
[Google Books](https://developers.google.com/books) if it's unreachable or finds
nothing. Both are free and need no API key. Covers are stored as URLs pointing at
the catalogue, so the app shows a plain initial instead if a cover is missing or
the network is down — nothing breaks. Point `OPENLIBRARY_BASE`,
`OPENLIBRARY_COVERS_BASE` or `GOOGLE_BOOKS_BASE` elsewhere to use a different
source or a stub.

## The API

The browser app is just a client of this; `curl` works fine too.

| Method | Path | Does |
| --- | --- | --- |
| `GET` | `/api/books?q=&status=` | List and search books |
| `POST` | `/api/books` | Add a book |
| `GET` | `/api/books/:id` | One book, with history |
| `PATCH` | `/api/books/:id` | Edit details |
| `DELETE` | `/api/books/:id` | Remove a book |
| `POST` | `/api/books/:id/status` | Set status (`status`, `borrower`, `dueDate`) |
| `GET` | `/api/books/by-code/:code` | Look up by barcode — what a scan calls |
| `GET` | `/api/lookup?q=` or `?isbn=` | Search the online catalogue |
| `GET` | `/api/meta` | Library name, statuses, counts, next barcode |
| `PUT` | `/api/meta` | Rename the library |
| `GET` | `/api/export`, `POST` `/api/import` | JSON backup and restore |

Barcodes are matched loosely, so `167`, `0000167` and a scan of either all find
the same book.

## Tests

```sh
npm test
```

Covers the catalogue parsers against realistic Open Library and Google Books
payloads, and the whole HTTP API end to end — CRUD, loans and history, barcode
matching, search, import/export, provider fallback, path traversal, and books
surviving a restart. The API tests run against a stub catalogue, so they never
touch the network.

## How it's put together

| File | What it does |
| --- | --- |
| `server.mjs` | HTTP server: static files, JSON API, optional TLS |
| `lib/db.mjs` | SQLite schema and every query |
| `lib/booklookup.mjs` | Open Library and Google Books, with pure parsers |
| `shared/statuses.mjs` | The status list, shared by server and browser |
| `js/app.js` | Views and routing |
| `js/api.js` | Client for the JSON API |
| `js/barcode.js` | Code 128 encoder, rendered as SVG for labels |
| `js/scanner.js` | Camera scanning |
| `css/app.css` | Styles, including print rules and dark mode |
| `vendor/` | ZXing (MIT), for browsers with no built-in barcode decoder |

Scanning prefers the browser's built-in `BarcodeDetector` (Chrome on Android) and
falls back to the vendored ZXing build everywhere else, iOS Safari included.
