'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { STATUSES } from '@/lib/statuses';
import { setStatusAction } from '@/app/actions';
import type { Book } from '@/lib/books';

export default function StatusControls({ book }: { book: Book }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  // Loans and holds need a name, so ask for it inline rather than on another page.
  const [asking, setAsking] = useState<'loaned' | 'hold' | null>(null);
  const [borrower, setBorrower] = useState(book.borrower);
  const [dueDate, setDueDate] = useState(
    book.dueDate || new Date(Date.now() + 28 * 86400000).toISOString().slice(0, 10),
  );
  const [error, setError] = useState('');

  const apply = (status: string, extra: { borrower?: string; dueDate?: string } = {}) => {
    setError('');
    startTransition(async () => {
      const result = await setStatusAction(book.id, status, extra);
      if (result.error) return setError(result.error);
      setAsking(null);
      router.refresh();
    });
  };

  return (
    <section className="card">
      <h3>Change status</h3>
      <div className="status-grid">
        {STATUSES.map((status) => (
          <button
            key={status.id}
            type="button"
            className={`status-btn ${book.status === status.id ? 'is-active' : ''}`}
            disabled={pending}
            onClick={() => {
              if (status.id === 'loaned' || status.id === 'hold') return setAsking(status.id);
              apply(status.id);
            }}
          >
            <span className="status-btn-label">{status.label}</span>
            <span className="status-btn-hint">{status.hint}</span>
          </button>
        ))}
      </div>

      {asking && (
        <form
          className="inline-form"
          onSubmit={(e) => {
            e.preventDefault();
            apply(asking, { borrower, dueDate: asking === 'loaned' ? dueDate : '' });
          }}
        >
          <label>
            {asking === 'loaned' ? 'Loaned to' : 'On hold for'}
            <input
              type="text"
              value={borrower}
              onChange={(e) => setBorrower(e.target.value)}
              placeholder="Name"
              required
              autoFocus
            />
          </label>
          {asking === 'loaned' && (
            <label>
              Due back
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
            </label>
          )}
          <div className="inline-actions">
            <button type="submit" className="btn btn-primary" disabled={pending}>
              {pending ? 'Saving…' : 'Save'}
            </button>
            <button type="button" className="btn" onClick={() => setAsking(null)}>Cancel</button>
          </div>
        </form>
      )}

      {error && <p className="hint error">{error}</p>}
    </section>
  );
}
