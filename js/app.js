import * as store from './store.js';
import { STATUSES, statusLabel } from './store.js';
import { barcodeSVG } from './barcode.js';
import { Scanner, cameraSupported, secureContextOK } from './scanner.js';

const view = document.getElementById('view');
const pageTitle = document.getElementById('page-title');
const backBtn = document.getElementById('back-btn');
const actionBtn = document.getElementById('action-btn');
const toastEl = document.getElementById('toast');

let activeScanner = null;
let listState = { query: '', filter: 'all' };

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
  toast._timer = setTimeout(() => { toastEl.hidden = true; }, 2600);
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

/* ------------------------------------------------------------------ views */

function renderLibrary() {
  setChrome({
    title: store.libraryName(),
    action: { label: '+', aria: 'Add a book', onClick: () => go('#/add') },
  });

  const counts = store.counts();
  const books = store.search(listState.query, listState.filter);

  const filters = [{ id: 'all', label: 'All' }, ...STATUSES]
    .map((f) => `<button type="button" class="chip ${listState.filter === f.id ? 'is-active' : ''}" data-filter="${f.id}">
        ${esc(f.label)} <span class="chip-count">${counts[f.id] || 0}</span>
      </button>`)
    .join('');

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
    const scroll = view.scrollTop;
    renderLibrary();
    view.scrollTop = scroll;
    view.querySelector('#q').focus();
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
    <div class="book-main">
      <span class="book-title">${esc(book.title)}</span>
      ${meta ? `<span class="book-meta">${meta}</span>` : ''}
      <span class="book-code">${esc(book.code)}</span>
    </div>
    <span class="status status-${esc(book.status)}">${esc(statusLabel(book.status))}</span>
  </li>`;
}

function renderBook(id) {
  const book = store.getBook(id);
  if (!book) {
    setChrome({ title: 'Not found', back: true });
    view.innerHTML = `<p class="empty">That book is no longer in the library.</p>`;
    return;
  }

  setChrome({ title: 'Book', back: true });
  const due = dueInfo(book);

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
      <h2>${esc(book.title)}</h2>
      ${book.author ? `<p class="author">${esc(book.author)}</p>` : ''}
      <p class="status-line">
        <span class="status status-${esc(book.status)}">${esc(statusLabel(book.status))}</span>
        ${book.borrower ? `<span class="borrower">${esc(book.borrower)}</span>` : ''}
        ${due ? `<span class="${due.overdue ? 'overdue' : ''}">${esc(due.text)}</span>` : ''}
      </p>
      <p class="code-line">Barcode ${esc(book.code)}</p>
    </section>

    <section class="card">
      <h3>Change status</h3>
      <div class="status-grid">${statusButtons}</div>
      <div id="status-extra"></div>
    </section>

    ${book.notes ? `<section class="card"><h3>Notes</h3><p class="notes">${esc(book.notes)}</p></section>` : ''}

    ${history ? `<section class="card"><h3>History</h3><ul class="history">${history}</ul></section>` : ''}

    <section class="card actions">
      <button type="button" class="btn" id="label-btn">Print label</button>
      <button type="button" class="btn" id="edit-btn">Edit details</button>
      <button type="button" class="btn btn-danger" id="delete-btn">Remove book</button>
    </section>
  `;

  view.querySelectorAll('[data-status]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const status = btn.dataset.status;
      if (status === 'loaned' || status === 'hold') {
        showBorrowerForm(book, status);
      } else {
        store.setStatus(book.id, status);
        toast(`Marked ${statusLabel(status).toLowerCase()}`);
        renderBook(book.id);
      }
    });
  });

  view.querySelector('#label-btn').addEventListener('click', () => go(`#/label/${book.id}`));
  view.querySelector('#edit-btn').addEventListener('click', () => go(`#/edit/${book.id}`));
  view.querySelector('#delete-btn').addEventListener('click', () => {
    if (confirm(`Remove "${book.title}" from the library?`)) {
      store.deleteBook(book.id);
      toast('Book removed');
      go('#/');
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
    </form>
  `;
  wrap.querySelector('#borrower').focus();
  wrap.querySelector('#cancel-borrower').addEventListener('click', () => { wrap.innerHTML = ''; });
  wrap.querySelector('#borrower-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const borrower = wrap.querySelector('#borrower').value.trim();
    const dueDate = wrap.querySelector('#due') ? wrap.querySelector('#due').value : '';
    store.setStatus(book.id, status, { borrower, dueDate });
    toast(status === 'loaned' ? `Loaned to ${borrower}` : `On hold for ${borrower}`);
    renderBook(book.id);
  });
}

function renderScan() {
  setChrome({ title: 'Scan', back: true });

  if (!cameraSupported() || !secureContextOK()) {
    view.innerHTML = `
      <p class="empty">The camera needs an <strong>https</strong> connection (GitHub Pages works; so does localhost).
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
    <p class="hint" id="scan-hint">Point the camera at the barcode on the label.</p>
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

// A scan either opens the matching book, or offers to create it.
function handleScanned(code) {
  const book = store.findByCode(code);
  if (book) {
    if (navigator.vibrate) navigator.vibrate(40);
    go(`#/book/${book.id}`);
  } else {
    go(`#/add?code=${encodeURIComponent(store.formatCode(code))}`);
    toast('No book with that barcode yet — add it below.');
  }
}

function stopScanner() {
  if (activeScanner) {
    activeScanner.stop();
    activeScanner = null;
  }
}

function renderAdd(params) {
  setChrome({ title: 'Add a book', back: true });
  const code = params.get('code') || store.nextCode();

  view.innerHTML = `
    <form class="card form" id="add-form">
      <label>Title <input type="text" id="title" required placeholder="Le Mort Darthur" /></label>
      <label>Author <input type="text" id="author" placeholder="Thomas Malory" /></label>
      <label>Barcode <input type="text" id="code" value="${esc(code)}" required /></label>
      <label>Status
        <select id="status">
          ${STATUSES.map((s) => `<option value="${s.id}">${esc(s.label)}</option>`).join('')}
        </select>
      </label>
      <label>Notes <textarea id="notes" rows="3" placeholder="Shelf, edition, condition..."></textarea></label>
      <button type="submit" class="btn btn-primary">Add to library</button>
    </form>`;

  view.querySelector('#title').focus();
  view.querySelector('#add-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const codeValue = view.querySelector('#code').value.trim();
    const clash = store.findByCode(codeValue);
    if (clash) {
      toast(`Barcode ${clash.code} is already "${clash.title}"`);
      return;
    }
    const book = store.addBook({
      code: codeValue,
      title: view.querySelector('#title').value,
      author: view.querySelector('#author').value,
      status: view.querySelector('#status').value,
      notes: view.querySelector('#notes').value,
    });
    toast('Book added');
    go(`#/book/${book.id}`);
  });
}

function renderEdit(id) {
  const book = store.getBook(id);
  if (!book) return go('#/');
  setChrome({ title: 'Edit book', back: true });

  view.innerHTML = `
    <form class="card form" id="edit-form">
      <label>Title <input type="text" id="title" value="${esc(book.title)}" required /></label>
      <label>Author <input type="text" id="author" value="${esc(book.author)}" /></label>
      <label>Barcode <input type="text" id="code" value="${esc(book.code)}" required /></label>
      <label>Notes <textarea id="notes" rows="3">${esc(book.notes)}</textarea></label>
      <button type="submit" class="btn btn-primary">Save changes</button>
    </form>`;

  view.querySelector('#edit-form').addEventListener('submit', (e) => {
    e.preventDefault();
    const codeValue = view.querySelector('#code').value.trim();
    const clash = store.findByCode(codeValue);
    if (clash && clash.id !== book.id) {
      toast(`Barcode ${clash.code} is already "${clash.title}"`);
      return;
    }
    store.updateBook(book.id, {
      title: view.querySelector('#title').value.trim() || 'Untitled',
      author: view.querySelector('#author').value.trim(),
      code: codeValue,
      notes: view.querySelector('#notes').value.trim(),
    });
    toast('Saved');
    go(`#/book/${book.id}`);
  });
}

function renderLabel(id) {
  const book = store.getBook(id);
  if (!book) return go('#/');
  setChrome({ title: 'Label', back: true });

  let svg;
  try {
    svg = barcodeSVG(book.code, { height: 60, module: 2 });
  } catch (err) {
    view.innerHTML = `<p class="empty">${esc(err.message)}</p>`;
    return;
  }

  view.innerHTML = `
    <div class="label-sheet" id="label">
      <div class="label-library">${esc(store.libraryName())}</div>
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

function renderSettings() {
  setChrome({ title: 'Settings', back: true });
  const counts = store.counts();

  view.innerHTML = `
    <form class="card form" id="name-form">
      <label>Library name (printed on labels)
        <input type="text" id="lib-name" value="${esc(store.libraryName())}" />
      </label>
      <button type="submit" class="btn btn-primary">Save name</button>
    </form>

    <section class="card">
      <h3>Your library</h3>
      <p class="hint">${counts.all} book${counts.all === 1 ? '' : 's'}, stored on this device only.
      Export regularly — clearing your browser data erases it.</p>
      <div class="actions">
        <button type="button" class="btn" id="export">Export backup (JSON)</button>
        <label class="btn file-btn">Import backup<input type="file" id="import" accept="application/json,.json" hidden /></label>
        <button type="button" class="btn btn-danger" id="wipe">Erase everything</button>
      </div>
    </section>`;

  view.querySelector('#name-form').addEventListener('submit', (e) => {
    e.preventDefault();
    store.setLibraryName(view.querySelector('#lib-name').value);
    toast('Library name saved');
  });

  view.querySelector('#export').addEventListener('click', () => {
    const blob = new Blob([store.exportJSON()], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `library-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  });

  view.querySelector('#import').addEventListener('change', async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const result = store.importJSON(await file.text());
      toast(`Imported: ${result.added} new, ${result.updated} updated`);
      renderSettings();
    } catch (err) {
      toast(`Import failed: ${err.message}`);
    }
  });

  view.querySelector('#wipe').addEventListener('click', () => {
    if (confirm('Erase every book on this device? Export a backup first if you want to keep them.')) {
      store.importJSON('{"books":[]}', { replace: true });
      toast('Library erased');
      renderSettings();
    }
  });
}

/* ---------------------------------------------------------------- routing */

function router() {
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

router();
