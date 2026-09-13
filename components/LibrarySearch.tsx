'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { STATUSES } from '@/lib/statuses';
import { Input, SegmentGroup } from '@/components/ui';
import { copy } from '@/lib/copy';
import type { Counts } from '@/lib/books';

const FILTERS = [{ id: 'all', label: copy.search.all }, ...STATUSES];

export default function LibrarySearch({ counts }: { counts: Counts }) {
  const router = useRouter();
  const params = useSearchParams();
  const status = params.get('status') || 'all';
  const [query, setQuery] = useState(params.get('q') || '');
  const firstRender = useRef(true);
  const skipNextEffect = useRef(false);

  const navigate = (q: string, statusFilter: string) => {
    const next = new URLSearchParams();
    if (q.trim()) next.set('q', q.trim());
    if (statusFilter !== 'all') next.set('status', statusFilter);
    const qs = next.toString();
    router.replace(qs ? `/?${qs}` : '/', { scroll: false });
  };

  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    if (skipNextEffect.current) {
      skipNextEffect.current = false;
      return;
    }
    const timer = setTimeout(() => navigate(query, status), 250);
    return () => clearTimeout(timer);
  }, [query, status, router]);

  const setStatusFilter = (id: string) => {
    skipNextEffect.current = true;
    navigate(query, id);
  };

  return (
    <>
      <div className="search-row">
        <Input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={copy.search.placeholder}
          aria-label={copy.search.ariaLabel}
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
