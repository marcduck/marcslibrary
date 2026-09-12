# Marc's Library

A barebones library app. Every book has a barcode label; scan one with your phone
camera to pull up the book and change its status.

No build step, no backend, no accounts — it's plain HTML/CSS/JS, and your books
are stored in your browser's local storage on the device you use.

## Running it

**On your phone (recommended).** The camera only works over `https`, so publish
the repo with GitHub Pages — *Settings → Pages → Source: `main` branch, root* —
then open the URL on your phone and add it to your home screen.

**Locally.** Any static server works:

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

Opening `index.html` straight off the disk works too, but the camera won't start
(browsers only hand it out on `https` or `localhost`); you can still type barcode
numbers in by hand.

## Using it

- **Library** — all your books, searchable by title, author, borrower or barcode,
  filterable by status. Tap a book to open it.
- **Scan** — point the camera at a label. A known barcode opens that book; an
  unknown one takes you to the Add form with the number filled in. There's a
  manual entry box underneath for when a label is scuffed or the camera won't
  cooperate.
- **Status** — each book is *Available*, *Loaned*, *On hold*, *Reading* or
  *Missing*. Loans and holds record who has it, and loans get a due date that the
  list shows as a countdown (turning red once it's overdue). Every change is
  logged in the book's history.
- **Labels** — *Print label* on any book renders a Code 128 label in the same
  layout as the printed ones (library name, title, barcode, number) and prints
  just that label. New books are suggested the next number in sequence.
- **Settings** — set the library name that appears on labels, and export/import a
  JSON backup.

## Back up your books

Everything lives in this browser's local storage on this device. Clearing your
browsing data, or switching phones, loses it. **Settings → Export backup** saves a
JSON file; **Import backup** merges it back, matching books by barcode so you can
re-import without creating duplicates. Export occasionally.

## How it's put together

| File | What it does |
| --- | --- |
| `index.html` | App shell: title bar, view container, tab bar |
| `js/app.js` | Hash routing and all the views |
| `js/store.js` | Books, statuses, search, import/export — everything touching storage |
| `js/barcode.js` | Code 128 subset B encoder, rendered as SVG for labels |
| `js/scanner.js` | Camera scanning |
| `css/app.css` | Styles, including the print rules and dark mode |
| `vendor/` | ZXing (MIT), used for scanning where the browser has no built-in decoder |

Scanning prefers the browser's built-in `BarcodeDetector` (Chrome on Android) and
falls back to the vendored ZXing build everywhere else, iOS Safari included.
Barcodes are compared loosely, so `167`, `0000167` and a scan of either all find
the same book.
