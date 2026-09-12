'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { STATUSES } from '@/lib/statuses';
import { Input, SegmentGroup } from '@/components/ui';
import type { Counts } from '@/lib/books';

const FILTERS = [{ id: 'all', label: 'All' }, ...STATUSES];

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

  const setStatusFilter = (id: string) => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (id !== 'all') next.set('status', id);
    const qs = next.toString();
    router.replace(qs ? `/?${qs}` : '/', { scroll: false });
  };

  return (
    <>
      <div className="search-row">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search title, author, ISBN or barcode"
          aria-label="Search the library"
        />
      </div>
      <div className="chips">
        <SegmentGroup.Root
          size="xs"
          value={status}
          onValueChange={(details) => setStatusFilter(details.value ?? 'all')}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items
            items={FILTERS.map((filter) => ({
              value: filter.id,
              label: `${filter.label} (${counts[filter.id] || 0})`,
            }))}
          />
        </SegmentGroup.Root>
      </div>
    </>
  );
}
