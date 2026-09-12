import * as api from './api.js';
import { STATUSES, statusLabel } from './api.js';
import { barcodeSVG } from './barcode.js';
import { Scanner, cameraSupported, secureContextOK } from './scanner.js';

const view = document.getElementById('view');
const pageTitle = document.getElementById('page-title');
const backBtn = document.getElementById('back-btn');
const actionBtn = document.getElementById('action-btn');
const toastEl = document.getElementById('toast');

let activeScanner = null;
let listState = { query: '', filter: 'all' };
let libraryName = "MARC'S LIBRARY";
let searchDebounce = null;

/* ---------------------------------------------------------------- helpers */

function esc(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, (c) => (
    { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]
  ));
}

function toast(message) {
  toastEl.textContent = message;
  toastEl.hidden = false;
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toastEl.hidden = true; }, 2800);
}

function go(hash) {
  location.hash = hash;
}

function setChrome({ title, back = false, action = null }) {
  pageTitle.textContent = title;
  backBtn.hidden = !back;
  if (action) {
    actionBtn.hidden = false;
    actionBtn.textContent = action.label;
    actionBtn.setAttribute('aria-label', action.aria || action.label);
    actionBtn.onclick = action.onClick;
  } else {
    actionBtn.hidden = true;
    actionBtn.onclick = null;
  }
}

function loading(message = 'Loading…') {
  view.innerHTML = `<p class="empty">${esc(message)}</p>`;
}

function showError(err) {
  view.innerHTML = `<p class="empty error">${esc(err.message)}</p>`;
}

function formatDate(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString();
}

function dueInfo(book) {
  if (book.status !== 'loaned' || !book.dueDate) return null;
  const due = new Date(book.dueDate + 'T00:00:00');
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((due - today) / 86400000);
  if (days < 0) return { overdue: true, text: `${Math.abs(days)} day${Math.abs(days) === 1 ? '' : 's'} overdue` };
  if (days === 0) return { overdue: false, text: 'Due today' };
  return { overdue: false, text: `Due in ${days} day${days === 1 ? '' : 's'}` };
}

// Covers come from an external service, so every one needs a graceful fallback.
function coverHTML(book, className = 'cover') {
  const initials = (book.title || '?').trim().slice(0, 1).toUpperCase();
  if (!book.coverUrl) return `<div class="${className} cover-blank">${esc(initials)}</div>`;
  return `<img class="${className}" src="${esc(book.coverUrl)}" alt="" loading="lazy"
    onerror="this.outerHTML='<div class=&quot;${className} cover-blank&quot;>${esc(initials)}</div>'" />`;
}

/* ------------------------------------------------------------------ views */

async function renderLibrary() {
  setChrome({ title: libraryName, action: { label: '+', aria: 'Add a book', onClick: () => go('#/add') } });
  loading();

  let data;
  try {
    data = await api.listBooks(listState.query, listState.filter);
  } catch (err) {
    return showError(err);
  }

  const { books, counts } = data;
  const filters = [{ id: 'all', label: 'All' }, ...STATUSES]
    .map((f) => `<button type="button" class="chip ${listState.filter === f.id ? 'is-active' : ''}" data-filter="${f.id}">
        ${esc(f.label)} <span class="chip-count">${counts[f.id] || 0}</span>
      </button>`).join('');

  const rows = books.length
    ? books.map(bookRow).join('')
    : `<p class="empty">${counts.all === 0
        ? 'No books yet. Tap <strong>Add</strong> to enter your first one, or <strong>Scan</strong> a label.'
        : 'No books match that search.'}</p>`;

  view.innerHTML = `
    <div class="search-row">
      <input type="search" id="q" placeholder="Search title, author, borrower or barcode" value="${esc(listState.query)}" />
    </div>
    <div class="chips">${filters}</div>
    <ul class="book-list">${rows}</ul>
  `;

  const q = view.querySelector('#q');
  q.addEventListener('input', () => {
    listState.query = q.value;
    clearTimeout(searchDebounce);
    searchDebounce = setTimeout(async () => {
      if (location.hash.replace('#', '') !== '/' && location.hash !== '') return;
      await renderLibrary();
      const field = view.querySelector('#q');
      if (field) {
        field.focus();
        field.setSelectionRange(field.value.length, field.value.length);
      }
    }, 220);
  });

  view.querySelectorAll('[data-filter]').forEach((btn) => {
    btn.addEventListener('click', () => {
      listState.filter = btn.dataset.filter;
      renderLibrary();
    });
  });

  view.querySelectorAll('[data-book]').forEach((li) => {
    li.addEventListener('click', () => go(`#/book/${li.dataset.book}`));
  });
}

function bookRow(book) {
  const due = dueInfo(book);
  const meta = [
    book.author ? esc(book.author) : '',
    book.status === 'loaned' && book.borrower ? `with ${esc(book.borrower)}` : '',
    book.status === 'hold' && book.borrower ? `held for ${esc(book.borrower)}` : '',
    due ? `<span class="${due.overdue ? 'overdue' : ''}">${esc(due.text)}</span>` : '',
  ].filter(Boolean).join(' · ');

  return `<li class="book-row" data-book="${esc(book.id)}">
    ${coverHTML(book, 'cover cover-sm')}
    <div class="book-main">
      <span class="book-title">${esc(book.title)}</span>
      ${meta ? `<span class="book-meta">${meta}</span>` : ''}
      <span class="book-code">${esc(book.code)}</span>
    </div>
    <span class="status status-${esc(book.status)}">${esc(statusLabel(book.status))}</span>
  </li>`;
}

async function renderBook(id) {
  setChrome({ title: 'Book', back: true });
  loading();

  let book;
  try {
    book = await api.getBook(id);
  } catch (err) {
    return showError(err);
  }

  const due = dueInfo(book);
  const facts = [
    book.published ? `First published ${esc(book.published)}` : '',
    book.pages ? `${esc(book.pages)} pages` : '',
    book.isbn ? `ISBN ${esc(book.isbn)}` : '',
  ].filter(Boolean).join(' · ');

  const statusButtons = STATUSES.map((s) => `
    <button type="button" class="status-btn ${book.status === s.id ? 'is-active' : ''}" data-status="${s.id}">
      <span class="status-btn-label">${esc(s.label)}</span>
      <span class="status-btn-hint">${esc(s.hint)}</span>
    </button>`).join('');

  const history = (book.history || []).slice(0, 8).map((h) => `
    <li><span>${esc(statusLabel(h.status))}${h.borrower ? ` — ${esc(h.borrower)}` : ''}</span>
        <time>${esc(formatDate(h.at))}</time></li>`).join('');

  view.innerHTML = `
    <section class="card book-header">
      <div class="book-hero">
        ${coverHTML(book, 'cover cover-lg')}
        <div class="book-hero-text">
          <h2>${esc(book.title)}</h2>
          ${book.author ? `<p class="author">${esc(book.author)}</p>` : ''}
          <p class="status-line">
            <span class="status status-${esc(book.status)}">${esc(statusLabel(book.status))}</span>
            ${book.borrower ? `<span class="borrower">${esc(book.borrower)}</span>` : ''}
            ${due ? `<span class="${due.overdue ? 'overdue' : ''}">${esc(due.text)}</span>` : ''}
          </p>
          ${facts ? `<p class="facts">${facts}</p>` : ''}
          <p class="code-line">Barcode ${esc(book.code)}</p>
        </div>
      </div>
    </section>

    <section class="card">
      <h3>Change status</h3>
      <div class="status-grid">${statusButtons}</div>
      <div id="status-extra"></div>
    </section>

    ${book.summary ? `<section class="card"><h3>About</h3><p class="notes">${esc(book.summary)}</p></section>` : ''}
    ${book.notes ? `<section class="card"><h3>Notes</h3><p class="notes">${esc(book.notes)}</p></section>` : ''}
    ${history ? `<section class="card"><h3>History</h3><ul class="history">${history}</ul></section>` : ''}

    <section class="card actions">
      <button type="button" class="btn" id="label-btn">Print label</button>
      <button type="button" class="btn" id="edit-btn">Edit details</button>
      <button type="button" class="btn btn-danger" id="delete-btn">Remove book</button>
    </section>
  `;

  view.querySelectorAll('[data-status]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      const status = btn.dataset.status;
      if (status === 'loaned' || status === 'hold') return showBorrowerForm(book, status);
      try {
        await api.setStatus(book.id, status);
        toast(`Marked ${statusLabel(status).toLowerCase()}`);
        renderBook(book.id);
      } catch (err) {
        toast(err.message);
      }
    });
  });

  view.querySelector('#label-btn').addEventListener('click', () => go(`#/label/${book.id}`));
  view.querySelector('#edit-btn').addEventListener('click', () => go(`#/edit/${book.id}`));
  view.querySelector('#delete-btn').addEventListener('click', async () => {
    if (!confirm(`Remove "${book.title}" from the library?`)) return;
    try {
      await api.deleteBook(book.id);
      toast('Book removed');
      go('#/');
    } catch (err) {
      toast(err.message);
    }
  });
}

// Loans and holds need a name, so ask for it inline rather than jumping views.
function showBorrowerForm(book, status) {
  const wrap = view.querySelector('#status-extra');
  const defaultDue = new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10);
  wrap.innerHTML = `
    <form class="inline-form" id="borrower-form">
      <label>${status === 'loaned' ? 'Loaned to' : 'On hold for'}
        <input type="text" id="borrower" value="${esc(book.borrower)}" placeholder="Name" required />
      </label>
      ${status === 'loaned' ? `<label>Due back
        <input type="date" id="due" value="${esc(book.dueDate || defaultDue)}" />
      </label>` : ''}
      <div class="inline-actions">
        <button type="submit" class="btn btn-primary">Save</button>
        <button type="button" class="btn" id="cancel-borrower">Cancel</button>
      </div>
    </form>`;
  wrap.querySelector('#borrower').focus();
  wrap.querySelector('#cancel-borrower').addEventListener('click', () => { wrap.innerHTML = ''; });
  wrap.querySelector('#borrower-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const borrower = wrap.querySelector('#borrower').value.trim();
    const dueDate = wrap.querySelector('#due') ? wrap.querySelector('#due').value : '';
    try {
      await api.setStatus(book.id, status, { borrower, dueDate });
      toast(status === 'loaned' ? `Loaned to ${borrower}` : `On hold for ${borrower}`);
      renderBook(book.id);
    } catch (err) {
      toast(err.message);
    }
  });
}

function renderScan() {
  setChrome({ title: 'Scan', back: true });

  if (!cameraSupported() || !secureContextOK()) {
    view.innerHTML = `
      <p class="empty">The camera needs an <strong>https</strong> connection (or localhost).
      You can still type a barcode below.</p>
      ${manualEntryHTML()}`;
    wireManualEntry();
    return;
  }

  view.innerHTML = `
    <div class="scanner">
      <video id="cam" playsinline muted></video>
      <div class="scan-frame"></div>
    </div>
    <p class="hint" id="scan-hint">Point the camera at a shelf label, or at the ISBN barcode on the back of a new book.</p>
    ${manualEntryHTML()}
  `;
  wireManualEntry();

  const video = view.querySelector('#cam');
  const hint = view.querySelector('#scan-hint');
  activeScanner = new Scanner(video);
  activeScanner.start(
    (code) => {
      stopScanner();
      handleScanned(code);
    },
    (err) => {
      // Camera start-up is async, so the user may have navigated away already.
      if (!hint.isConnected) return;
      hint.textContent = cameraErrorMessage(err);
      hint.classList.add('error');
      view.querySelector('.scanner').hidden = true;
      view.querySelector('#manual-code').focus();
    },
  );
}

function cameraErrorMessage(err) {
  if (err && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
    return 'Camera permission was denied. Type the barcode below instead.';
  }
  if (err && err.name === 'NotFoundError') {
    return 'No camera found on this device. Type the barcode below instead.';
  }
  return `${err && err.message ? err.message : 'Camera unavailable.'} Type the barcode below instead.`;
}

function manualEntryHTML() {
  return `
    <form class="inline-form card" id="manual-form">
      <label>Barcode number
        <input type="text" id="manual-code" inputmode="numeric" placeholder="0000167" />
      </label>
      <button type="submit" class="btn btn-primary">Look up</button>
    </form>`;
}

function wireManualEntry() {
  view.querySelector('#manual-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const code = view.querySelector('#manual-code').value.trim();
    if (code) handleScanned(code);
  });
}

// A scan either opens the matching book, or starts adding it.
async function handleScanned(code) {
  try {
    const book = await api.getBookByCode(code);
    if (navigator.vibrate) navigator.vibrate(40);
    return go(`#/book/${book.id}`);
  } catch (err) {
    if (err.status !== 404) return toast(err.message);
  }
  go(`#/add?code=${encodeURIComponent(code)}`);
  toast('No book with that barcode yet — add it below.');
}

function stopScanner() {
  if (activeScanner) {
    activeScanner.stop();
    activeScanner = null;
  }
}

/* --------------------------------------------------------------- add/edit */

// Metadata chosen from the lookup results, merged into the book on save.
let draft = {};

async function renderAdd(params) {
  setChrome({ title: 'Add a book', back: true });
  const scanned = params.get('code') || '';
  // An ISBN barcode off the back of a book identifies the book itself; a shelf
  // label is just our own number, so only the former is worth looking up.
  const scannedISBN = isISBN(scanned) ? cleanISBN(scanned) : '';

  let meta;
  try {
    meta = await api.getMeta();
  } catch (err) {
    return showError(err);
  }
  draft = scannedISBN ? { isbn: scannedISBN } : {};

  view.innerHTML = `
    <section class="card">
      <h3>Find the book</h3>
      <form class="inline-form" id="lookup-form">
        <div class="lookup-row">
          <input type="text" id="lookup-q" placeholder="Title, author or ISBN" value="${esc(scannedISBN)}" />
          <button type="submit" class="btn btn-primary">Search</button>
        </div>
        <p class="hint">Fills in the cover, author, year and page count automatically. Or just type the details in below.</p>
      </form>
      <div id="lookup-results"></div>
    </section>

    <form class="card form" id="add-form">
      <div id="picked"></div>
      <label>Title <input type="text" id="title" required placeholder="Le Mort Darthur" /></label>
      <label>Author <input type="text" id="author" placeholder="Thomas Malory" /></label>
      <label>Shelf barcode <input type="text" id="code" value="${esc(scannedISBN ? meta.nextCode : (scanned || meta.nextCode))}" required /></label>
      <label>Status
        <select id="status">${STATUSES.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join('')}</select>
      </label>
      <label>Notes <textarea id="notes" rows="3" placeholder="Shelf, edition, condition..."></textarea></label>
      <button type="submit" class="btn btn-primary">Add to library</button>
    </form>`;

  wireLookup((picked) => {
    draft = { ...draft, ...picked };
    view.querySelector('#title').value = picked.title || '';
    view.querySelector('#author').value = picked.author || '';
    renderPicked(draft);
  });

  view.querySelector('#add-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const payload = {
      ...draft,
      title: view.querySelector('#title').value,
      author: view.querySelector('#author').value,
      code: view.querySelector('#code').value.trim(),
      status: view.querySelector('#status').value,
      notes: view.querySelector('#notes').value,
    };
    try {
      const book = await api.createBook(payload);
      toast('Book added');
      go(`#/book/${book.id}`);
    } catch (err) {
      toast(err.message);
    }
  });

  if (scannedISBN) {
    runLookup(scannedISBN);
  } else {
    view.querySelector('#lookup-q').focus();
  }
}

function renderPicked(picked) {
  const wrap = view.querySelector('#picked');
  if (!wrap) return;
  if (!picked.title && !picked.coverUrl) {
    wrap.innerHTML = '';
    return;
  }
  const facts = [
    picked.published ? esc(picked.published) : '',
    picked.pages ? `${esc(picked.pages)} pages` : '',
    picked.isbn ? `ISBN ${esc(picked.isbn)}` : '',
  ].filter(Boolean).join(' · ');
  wrap.innerHTML = `
    <div class="picked">
      ${coverHTML(picked, 'cover cover-md')}
      <div>
        <p class="picked-label">Using details from the catalogue</p>
        ${facts ? `<p class="facts">${facts}</p>` : ''}
        <button type="button" class="link-btn" id="clear-picked">Clear</button>
      </div>
    </div>`;
  wrap.querySelector('#clear-picked').addEventListener('click', () => {
    draft = {};
    renderPicked(draft);
  });
}

function wireLookup(onPick) {
  const form = view.querySelector('#lookup-form');
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    runLookup(view.querySelector('#lookup-q').value.trim(), onPick);
  });
  wireLookup._onPick = onPick;
}

async function runLookup(query, onPick = wireLookup._onPick) {
  const box = view.querySelector('#lookup-results');
  if (!query || !box) return;
  box.innerHTML = `<p class="hint">Searching…</p>`;

  let data;
  try {
    data = await api.lookupBooks(isISBN(query) ? { isbn: cleanISBN(query) } : { q: query });
  } catch (err) {
    box.innerHTML = `<p class="hint error">${esc(err.message)} You can still type the details in by hand.</p>`;
    return;
  }

  if (!data.results.length) {
    box.innerHTML = `<p class="hint">Nothing found. Type the details in by hand instead.</p>`;
    return;
  }

  box.innerHTML = `<ul class="results">${data.results.map((r, i) => `
    <li class="result" data-index="${i}">
      ${coverHTML(r, 'cover cover-sm')}
      <div class="book-main">
        <span class="book-title">${esc(r.title)}</span>
        <span class="book-meta">${[r.author, r.published].filter(Boolean).map(esc).join(' · ')}</span>
      </div>
    </li>`).join('')}</ul>
    <p class="hint">Source: ${data.source === 'googlebooks' ? 'Google Books' : 'Open Library'}</p>`;

  box.querySelectorAll('.result').forEach((li) => {
    li.addEventListener('click', () => {
      onPick(data.results[Number(li.dataset.index)]);
      box.innerHTML = '';
      view.querySelector('#lookup-q').value = '';
    });
  });
}

function cleanISBN(value) {
  return String(value || '').replace(/[^0-9Xx]/g, '').toUpperCase();
}

function isISBN(value) {
  const isbn = cleanISBN(value);
  if (isbn.length === 13) return /^97[89]/.test(isbn);
  return isbn.length === 10;
}

async function renderEdit(id) {
  setChrome({ title: 'Edit book', back: true });
  loading();

  let book;
  try {
    book = await api.getBook(id);
  } catch (err) {
    return showError(err);
  }
  draft = {};

  view.innerHTML = `
    <section class="card">
      <h3>Look up details</h3>
      <form class="inline-form" id="lookup-form">
        <div class="lookup-row">
          <input type="text" id="lookup-q" placeholder="Title, author or ISBN"
                 value="${esc(book.isbn || `${book.title} ${book.author}`.trim())}" />
          <button type="submit" class="btn">Search</button>
        </div>
        <p class="hint">Use this to add or replace the cover and book details.</p>
      </form>
      <div id="lookup-results"></div>
    </section>

    <form class="card form" id="edit-form">
      <div id="picked"></div>
      <label>Title <input type="text" id="title" value="${esc(book.title)}" required /></label>
      <label>Author <input type="text" id="author" value="${esc(book.author)}" /></label>
      <label>Shelf barcode <input type="text" id="code" value="${esc(book.code)}" required /></label>
      <label>ISBN <input type="text" id="isbn" value="${esc(book.isbn)}" /></label>
      <label>Cover image URL <input type="text" id="coverUrl" value="${esc(book.coverUrl)}" /></label>
      <label>Notes <textarea id="notes" rows="3">${esc(book.notes)}</textarea></label>
      <button type="submit" class="btn btn-primary">Save changes</button>
    </form>`;

  wireLookup((picked) => {
    draft = { ...draft, ...picked };
    view.querySelector('#title').value = picked.title || view.querySelector('#title').value;
    view.querySelector('#author').value = picked.author || view.querySelector('#author').value;
    if (picked.isbn) view.querySelector('#isbn').value = picked.isbn;
    if (picked.coverUrl) view.querySelector('#coverUrl').value = picked.coverUrl;
    renderPicked(draft);
  });

  view.querySelector('#edit-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      await api.updateBook(book.id, {
        ...draft,
        title: view.querySelector('#title').value.trim() || 'Untitled',
        author: view.querySelector('#author').value.trim(),
        code: view.querySelector('#code').value.trim(),
        isbn: view.querySelector('#isbn').value.trim(),
        coverUrl: view.querySelector('#coverUrl').value.trim(),
        notes: view.querySelector('#notes').value.trim(),
      });
      toast('Saved');
      go(`#/book/${book.id}`);
    } catch (err) {
      toast(err.message);
    }
  });
}

async function renderLabel(id) {
  setChrome({ title: 'Label', back: true });
  loading();

  let book;
  try {
    book = await api.getBook(id);
  } catch (err) {
    return showError(err);
  }

  let svg;
  try {
    svg = barcodeSVG(book.code, { height: 60, module: 2 });
  } catch (err) {
    return showError(err);
  }

  view.innerHTML = `
    <div class="label-sheet" id="label">
      <div class="label-library">${esc(libraryName)}</div>
      <div class="label-title">${esc(book.title)}</div>
      <div class="label-barcode">${svg}</div>
      <div class="label-code">${esc(book.code)}</div>
    </div>
    <div class="card actions no-print">
      <button type="button" class="btn btn-primary" id="print">Print / Save as PDF</button>
      <p class="hint">Prints just the label, sized for a sticker. Set your printer margins to none for the tightest fit.</p>
    </div>`;

  view.querySelector('#print').addEventListener('click', () => window.print());
}

async function renderSettings() {
  setChrome({ title: 'Settings', back: true });
  loading();

  let meta;
  try {
    meta = await api.getMeta();
  } catch (err) {
    return showError(err);
  }

  view.innerHTML = `
    <form class="card form" id="name-form">
      <label>Library name (printed on labels)
        <input type="text" id="lib-name" value="${esc(meta.name)}" />
      </label>
      <button type="submit" class="btn btn-primary">Save name</button>
    </form>

    <section class="card">
      <h3>Your library</h3>
      <p class="hint">${meta.counts.all} book${meta.counts.all === 1 ? '' : 's'}, stored in the database on the server.
      Next shelf barcode: ${esc(meta.nextCode)}.</p>
      <div class="actions">
        <button type="button" class="btn" id="export">Export backup (JSON)</button>
        <label class="btn file-btn">Import backup<input type="file" id="import" accept="application/json,.json" hidden /></label>
      </div>
    </section>

    <section class="card" id="migrate-card" hidden>
      <h3>Books saved on this device</h3>
      <p class="hint">This browser still has books from before the library moved to the server.
      Upload them to keep everything in one place.</p>
      <div class="actions">
        <button type="button" class="btn btn-primary" id="migrate">Upload <span id="migrate-count"></span> to the server</button>
      </div>
    </section>`;

  view.querySelector('#name-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    try {
      const saved = await api.setLibraryName(view.querySelector('#lib-name').value);
      libraryName = saved.name;
      toast('Library name saved');
    } catch (err) {
      toast(err.message);
    }
  });

  view.querySelector('#export').addEventListener('click', async () => {
    try {
      const data = await api.exportAll();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `library-${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      toast(err.message);
    }
  });

  view.querySelector('#import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = await api.importBooks(JSON.parse(await file.text()));
      toast(`Imported: ${result.added} new, ${result.updated} updated`);
      renderSettings();
    } catch (err) {
      toast(`Import failed: ${err.message}`);
    }
  });

  offerMigration();
}

// The first version of this app kept books in localStorage; offer to move them.
function offerMigration() {
  let saved;
  try {
    saved = JSON.parse(localStorage.getItem('marcslibrary.books.v1') || '[]');
  } catch (err) {
    return;
  }
  if (!Array.isArray(saved) || !saved.length) return;

  const card = view.querySelector('#migrate-card');
  card.hidden = false;
  card.querySelector('#migrate-count').textContent = `${saved.length} book${saved.length === 1 ? '' : 's'}`;
  card.querySelector('#migrate').addEventListener('click', async () => {
    try {
      const result = await api.importBooks({ books: saved });
      localStorage.removeItem('marcslibrary.books.v1');
      toast(`Uploaded: ${result.added} new, ${result.updated} updated`);
      renderSettings();
    } catch (err) {
      toast(`Upload failed: ${err.message}`);
    }
  });
}

/* ---------------------------------------------------------------- routing */

async function router() {
  stopScanner();
  const raw = location.hash.replace(/^#/, '') || '/';
  const [path, queryString] = raw.split('?');
  const params = new URLSearchParams(queryString || '');
  const parts = path.split('/').filter(Boolean);

  view.scrollTop = 0;
  document.querySelectorAll('.tabbar a').forEach((a) => {
    a.classList.toggle('is-active', a.getAttribute('href') === `#${path}`);
  });

  switch (parts[0]) {
    case undefined:   return renderLibrary();
    case 'scan':      return renderScan();
    case 'add':       return renderAdd(params);
    case 'book':      return renderBook(parts[1]);
    case 'edit':      return renderEdit(parts[1]);
    case 'label':     return renderLabel(parts[1]);
    case 'settings':  return renderSettings();
    default:          return renderLibrary();
  }
}

backBtn.addEventListener('click', () => {
  if (history.length > 1) history.back();
  else go('#/');
});

window.addEventListener('hashchange', router);
window.addEventListener('pagehide', stopScanner);
document.addEventListener('visibilitychange', () => {
  if (document.hidden) stopScanner();
});

// Load the library name first so the title bar is right on the very first paint.
api.getMeta()
  .then((meta) => { libraryName = meta.name; })
  .catch(() => {})
  .finally(router);
