// Client side of the JSON API. The server owns the data; this is a thin wrapper.

export { STATUSES, statusLabel, normaliseCode, formatCode } from '../shared/statuses.mjs';

async function request(path, options = {}) {
  let response;
  try {
    response = await fetch(path, {
      ...options,
      headers: options.body ? { 'content-type': 'application/json' } : undefined,
    });
  } catch (err) {
    throw new ApiError('Cannot reach the library server. Is it running?', 0);
  }

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(payload.error || `Request failed (${response.status})`, response.status, payload);
  }
  return payload;
}

export class ApiError extends Error {
  constructor(message, status, payload = {}) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.payload = payload;
  }
}

const json = (body) => ({ body: JSON.stringify(body) });

export const getMeta = () => request('/api/meta');
export const setLibraryName = (name) => request('/api/meta', { method: 'PUT', ...json({ name }) });

export const listBooks = (q = '', status = 'all') =>
  request(`/api/books?q=${encodeURIComponent(q)}&status=${encodeURIComponent(status)}`);

export const getBook = (id) => request(`/api/books/${encodeURIComponent(id)}`);
export const getBookByCode = (code) => request(`/api/books/by-code/${encodeURIComponent(code)}`);
export const createBook = (book) => request('/api/books', { method: 'POST', ...json(book) });
export const updateBook = (id, changes) =>
  request(`/api/books/${encodeURIComponent(id)}`, { method: 'PATCH', ...json(changes) });
export const deleteBook = (id) => request(`/api/books/${encodeURIComponent(id)}`, { method: 'DELETE' });
export const setStatus = (id, status, extra = {}) =>
  request(`/api/books/${encodeURIComponent(id)}/status`, { method: 'POST', ...json({ status, ...extra }) });

export const lookupBooks = ({ q = '', isbn = '' }) =>
  request(`/api/lookup?q=${encodeURIComponent(q)}&isbn=${encodeURIComponent(isbn)}`);

export const exportAll = () => request('/api/export');
export const importBooks = (payload) => request('/api/import', { method: 'POST', ...json(payload) });
