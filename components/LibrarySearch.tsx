'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { STATUSES } from '@/lib/statuses';
import type { Counts } from '@/lib/books';

export default function LibrarySearch({ counts }: { counts: Counts }) {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get('status') || 'all';
  const [query, setQuery] = useState(params.get('q') || '');
  const firstRender = useRef(true);

  // Typing updates the URL, which re-runs the search on the server. Debounced so
  // a fast typist does not fire a request per keystroke.
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    const timer = setTimeout(() => {
      const next = new URLSearchParams();
      if (query.trim()) next.set('q', query.trim());
      if (status !== 'all') next.set('status', status);
      const qs = next.toString();
      router.replace(qs ? `/?${qs}` : '/', { scroll: false });
    }, 250);
    return () => clearTimeout(timer);
  }, [query, status, router]);

  const filterHref = (id: string) => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (id !== 'all') next.set('status', id);
    const qs = next.toString();
    return qs ? `/?${qs}` : '/';
  };

  return (
    <>
      <div className="search-row">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, author, borrower or barcode"
          aria-label="Search the library"
        />
      </div>
      <div className="chips">
        {[{ id: 'all', label: 'All' }, ...STATUSES].map((filter) => (
          <Link
            key={filter.id}
            href={filterHref(filter.id)}
            scroll={false}
            className={`chip ${status === filter.id ? 'is-active' : ''}`}
          >
            {filter.label} <span className="chip-count">{counts[filter.id] || 0}</span>
          </Link>
        ))}
      </div>
    </>
  );
}
