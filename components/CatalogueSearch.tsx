'use client';

import { useCallback, useEffect, useState } from 'react';
import Cover from './Cover';
import { looksLikeISBN, cleanISBN } from '@/lib/statuses';
import type { CatalogueBook } from '@/lib/catalogue';

type Props = {
  /** Runs a search as soon as the component mounts — used after an ISBN scan. */
  initialQuery?: string;
  autoSearch?: boolean;
  onPick: (book: CatalogueBook) => void;
  label?: string;
  hint?: string;
};

export default function CatalogueSearch({ initialQuery = '', autoSearch = false, onPick, label = 'Find the book', hint }: Props) {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<CatalogueBook[] | null>(null);
  const [source, setSource] = useState<string | null>(null);
  const [status, setStatus] = useState<'idle' | 'searching' | 'error'>('idle');
  const [error, setError] = useState('');

  const run = useCallback(async (term: string) => {
    if (!term.trim()) return;
    setStatus('searching');
    setError('');
    try {
      const params = looksLikeISBN(term)
        ? `isbn=${encodeURIComponent(cleanISBN(term))}`
        : `q=${encodeURIComponent(term.trim())}`;
      const response = await fetch(`/api/lookup?${params}`);
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Lookup failed.');
      setResults(data.results);
      setSource(data.source);
      setStatus('idle');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Lookup failed.');
    }
  }, []);

  useEffect(() => {
    if (autoSearch && initialQuery) void run(initialQuery);
  }, [autoSearch, initialQuery, run]);

  return (
    <section className="card">
      <h3>{label}</h3>
      <form
        className="inline-form"
        onSubmit={(e) => { e.preventDefault(); void run(query); }}
      >
        <div className="lookup-row">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Title, author or ISBN"
            aria-label="Search the catalogue"
          />
          <button type="submit" className="btn btn-primary" disabled={status === 'searching'}>
            {status === 'searching' ? 'Searching…' : 'Search'}
          </button>
        </div>
        <p className="hint">{hint ?? 'Fills in the cover, author, year and page count automatically. Or just type the details in below.'}</p>
      </form>

      {status === 'error' && (
        <p className="hint error">{error} You can still type the details in by hand.</p>
      )}

      {results && results.length === 0 && status === 'idle' && (
        <p className="hint">Nothing found. Type the details in by hand instead.</p>
      )}

      {results && results.length > 0 && (
        <>
          <ul className="results">
            {results.map((book, i) => (
              <li key={i} className="result">
                <button
                  type="button"
                  className="result-btn"
                  onClick={() => { onPick(book); setResults(null); setQuery(''); }}
                >
                  <Cover title={book.title} coverUrl={book.coverUrl} size="sm" />
                  <div className="book-main">
                    <span className="book-title">{book.title}</span>
                    <span className="book-meta">{[book.author, book.published].filter(Boolean).join(' · ')}</span>
                  </div>
                </button>
              </li>
            ))}
          </ul>
          <p className="hint">Source: {source === 'googlebooks' ? 'Google Books' : 'Open Library'}</p>
        </>
      )}
    </section>
  );
}
