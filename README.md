# Marc's Library

A barebones library app. Every book has a barcode; scan it with your phone
camera to open the book and change its status.

Built with **Next.js** (App Router) and **TypeScript**. Books live in a SQLite
database, so every phone and laptop you open it on sees the same library.

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
| `PORT` | `3000` | Port to listen on (`next start`) |

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

- **Library** (`/`) — every book, searchable by title, author, barcode or
  ISBN, filterable by status. The search lives in the URL, so a filtered view
  can be bookmarked or shared.
- **Scan** (`/scan`) — point the camera at a barcode label. A known barcode
  opens that book. An unknown one opens the Add form with the code filled in.
  There's a manual entry box for scuffed labels or devices with no camera.
- **Add** (`/add`) — enter title, author, barcode and ISBN by hand. The next
  shelf barcode is suggested for you.
- **Status** — each book is *Available*, *Loaned*, *On hold*, *Reading* or
  *Missing*. Every change is logged in the history, shown on the book page.

## Where the books are

In `data/library.db`. Back it up by copying that file.

**There is no login.** Anyone who can reach the server can read and change the
library, so keep it on your home network or behind a tunnel that requires
sign-in — don't put it on a public IP as-is.

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
| `POST` | `/api/books/:id/status` | Set status |
| `GET` | `/api/books/by-code/:code` | Look up by barcode |

Barcodes are matched loosely, so `167`, `0000167` and a scan of either all find
the same book.

## Tests

```sh
npm test
```

Runs the data layer against a throwaway SQLite database: shelf-barcode
suggestions, loose barcode matching, status changes and history, search,
duplicate rejection, and that everything the data layer returns is a plain
object React can pass to client components.

## How it's put together

| Path | What it does |
| --- | --- |
| `app/page.tsx` | The library list (server rendered, searchable via the URL) |
| `app/books/[id]/` | Book detail and the edit form |
| `app/add`, `app/scan` | The other two views |
| `app/actions.ts` | Server actions: add, edit, set status, delete, find by code |
| `app/api/` | The REST API, thin wrappers over `lib/books.ts` |
| `lib/books.ts` | Every read and write of the library |
| `lib/db.ts` | Database connection and schema, local file or Turso |
| `lib/cache.ts` | Revalidates the cached pages after a write |
| `lib/scanner.ts` | Camera scanning |
| `lib/statuses.ts` | Statuses, and the barcode helpers, shared everywhere |
| `components/` | The client components: search, status controls, forms, scanner |
| `components/ui/` | Generated [Park UI](https://park-ui.com) components |
| `public/vendor/` | ZXing (MIT), for browsers with no built-in barcode decoder |

Data loading happens in server components, which read SQLite directly — no
internal HTTP round trip. Mutations go through server actions. Only the parts
that genuinely need the browser (camera, search-as-you-type, forms with inline
errors) are client components.

Scanning prefers the browser's built-in `BarcodeDetector` (Chrome on Android) and
falls back to the vendored ZXing build everywhere else, iOS Safari included.
