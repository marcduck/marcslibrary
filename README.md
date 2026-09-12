# Marc's Library

A barebones library app. Every book has a barcode label; scan one with your phone
camera to pull up the book and change its status.

Built with **Next.js** (App Router) and **TypeScript**. Books live in a SQLite
database, so every phone and laptop you open it on sees the same library.
Adding a book looks it up in a free online catalogue and fills in the cover,
author, year and page count for you.

Needs **Node 22.5 or newer**. The database goes through
[`@libsql/client`](https://github.com/tursodatabase/libsql-client-ts):

- **Locally**, with no setup, it opens a plain SQLite file at
  `data/library.db`. Nothing to install or configure.
- **On Vercel**, it talks to a free [Turso](https://turso.tech) database
  instead — see [Deploying on Vercel](#deploying-on-vercel) below. Vercel does
  not keep files between requests, so a local file cannot be used there.

## Running it

```sh
npm install
npm run dev            # http://localhost:3000

npm run build && npm start   # production
```

Useful environment variables:

| Variable | Default | What it's for |
| --- | --- | --- |
| `DB_FILE` | `data/library.db` | Where the local database file lives (ignored once `TURSO_DATABASE_URL` is set) |
| `TURSO_DATABASE_URL` | — | Turso database URL; when set, the app uses Turso instead of a local file |
| `TURSO_AUTH_TOKEN` | — | Auth token for the Turso database |
| `PORT` | `3000` | Port to listen on (`next start -p`) |
| `OPENLIBRARY_BASE`, `GOOGLE_BOOKS_BASE` | the real ones | Point the catalogue elsewhere |
| `LOOKUP_TIMEOUT_MS` | `8000` | How long to wait on the catalogue |

## Deploying on Vercel

1. Make a free database at [turso.tech](https://turso.tech) (sign up, then
   `turso db create marcslibrary` with their CLI, or use their web console).
2. Get its URL and an auth token:
   ```sh
   turso db show marcslibrary --url
   turso db tokens create marcslibrary
   ```
3. In your Vercel project, add two environment variables:
   `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN`, with the values from step 2.
4. Deploy. The app creates its tables on first request — no migration step
   needed.

If you used the app locally first and want to keep that data, create the
Turso database from your local file instead of empty:
```sh
turso db create marcslibrary --from-file data/library.db
```
Otherwise the library just starts empty on Turso and you re-add your books.

## Scanning from your phone

Browsers only hand out the camera in a **secure context**, so `http://localhost`
works on the machine running the server, but `http://192.168.1.x` from your phone
does **not** — you'll get the barcode box but no camera. Put HTTPS in front of it:

- **[Tailscale](https://tailscale.com)** — `tailscale serve 3000` gives you a
  real HTTPS address with no certificate warnings, and works away from home too.
  Cloudflare Tunnel and ngrok do the same job.
- **A reverse proxy** you already run (Caddy gets you a certificate in one line)
  in front of `npm start`.

Either way, typing a barcode number by hand always works, camera or not.

## Using it

- **Library** (`/`) — every book, searchable by title, author, borrower, barcode
  or ISBN, filterable by status. The search lives in the URL, so a filtered view
  can be bookmarked or shared.
- **Scan** (`/scan`) — point the camera at a label. A known shelf barcode opens
  that book. An **ISBN barcode** off the back of a book you don't own yet opens
  the Add form and looks the book up automatically, so a new book is two taps
  from scanned to shelved. There's a manual entry box for scuffed labels.
- **Add** (`/add`) — search the catalogue by title, author or ISBN, pick the
  right result to fill in the details and cover, then save. Every field can be
  typed by hand instead, and the next shelf barcode is suggested for you.
- **Status** — each book is *Available*, *Loaned*, *On hold*, *Reading* or
  *Missing*. Loans and holds record who has it; loans get a due date shown as a
  countdown that turns red when overdue. Every change is logged in the history.
- **Labels** — *Print label* renders a Code 128 label in the same layout as the
  printed ones (library name, title, barcode, number) and prints just the label.
- **Settings** — library name for labels, and JSON export/import. If you used the
  browser-storage version, Settings offers to upload those books to the server.

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
the catalogue, so a book shows a plain initial instead if its cover is missing or
the network is down — nothing breaks.

## The API

The app itself uses server actions, but the same data is available over HTTP for
`curl`, scripts or anything else.

| Method | Path | Does |
| --- | --- | --- |
| `GET` | `/api/books?q=&status=` | List and search books |
| `POST` | `/api/books` | Add a book |
| `GET` | `/api/books/:id` | One book, with history |
| `PATCH` | `/api/books/:id` | Edit details |
| `DELETE` | `/api/books/:id` | Remove a book |
| `POST` | `/api/books/:id/status` | Set status (`status`, `borrower`, `dueDate`) |
| `GET` | `/api/books/by-code/:code` | Look up by barcode |
| `GET` | `/api/lookup?q=` or `?isbn=` | Search the online catalogue |
| `GET` | `/api/meta` | Library name, statuses, counts, next barcode |
| `PUT` | `/api/meta` | Rename the library |
| `GET` | `/api/export`, `POST` `/api/import` | JSON backup and restore |

Barcodes are matched loosely, so `167`, `0000167` and a scan of either all find
the same book.

## Tests

```sh
npm test                       # unit tests, no browser or network needed
npm run build && npm run test:e2e   # drives a real build in a real browser
```

`npm test` covers the Code 128 encoder (its output is decoded back to prove it
round-trips), the catalogue parsers against realistic Open Library and Google
Books payloads, and the data layer — loans and history, loose barcode matching,
search, import/export and duplicate rejection.

`npm run test:e2e` runs a production build in Chromium against a stub catalogue,
so it never touches the network: adding a book from a lookup, changing status,
checking the change landed in the database, a second browser seeing the same
library, scanning, search and filters, the printed label, renaming, editing,
duplicate barcodes, deleting — and that no page logs a browser error.

Set `CHROME_PATH` if Playwright's own Chromium isn't installed.

## How it's put together

| Path | What it does |
| --- | --- |
| `app/page.tsx` | The library list (server rendered, searchable via the URL) |
| `app/books/[id]/` | Book detail, edit form and printable label |
| `app/add`, `app/scan`, `app/settings` | The other three views |
| `app/actions.ts` | Server actions: add, edit, set status, delete, import |
| `app/api/` | The REST API, thin wrappers over `lib/books.ts` |
| `lib/books.ts` | Every read and write of the library |
| `lib/db.ts` | Database connection and schema, local file or Turso |
| `lib/catalogue.ts` | Open Library and Google Books, with pure parsers |
| `lib/barcode.ts` | Code 128 encoder, rendered as SVG for labels |
| `lib/scanner.ts` | Camera scanning |
| `lib/statuses.ts` | Statuses and barcode/ISBN helpers, shared everywhere |
| `components/` | The client components: search, status controls, forms, scanner |
| `public/vendor/` | ZXing (MIT), for browsers with no built-in barcode decoder |

Data loading happens in server components, which read SQLite directly — no
internal HTTP round trip. Mutations go through server actions. Only the parts
that genuinely need the browser (camera, search-as-you-type, the catalogue
picker, forms with inline errors) are client components.

Scanning prefers the browser's built-in `BarcodeDetector` (Chrome on Android) and
falls back to the vendored ZXing build everywhere else, iOS Safari included.
