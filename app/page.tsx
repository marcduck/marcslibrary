import { Suspense } from 'react';
import Link from 'next/link';
import TopBar from '@/components/TopBar';
import LibrarySearch from '@/components/LibrarySearch';
import { listBooks, counts } from '@/lib/books';
import { statusLabel, statusColor } from '@/lib/statuses';
import { Badge } from '@/components/ui';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function LibraryPage({ searchParams }: Props) {
  const { q = '', status = 'all' } = await searchParams;
  const books = await listBooks({ q, status });
  const totals = await counts();

  return (
    <>
      <TopBar title="Marc's Library" />
      <main className="view">
        <Suspense fallback={<div className="search-row" />}>
          <LibrarySearch counts={totals} />
        </Suspense>
        {books.length > 0 ? (
          <ul className="book-list">
            {books.map((book) => (
              <li key={book.id} className="book-row">
                <Link href={`/books/${book.id}`} className="book-link">
                  <div className="book-main">
                    <span className="book-title">{book.title}</span>
                    {book.author && <span className="book-meta">{book.author}</span>}
                    <span className="book-code">{book.code}</span>
                  </div>
                  <Badge colorPalette={statusColor(book.status)}>{statusLabel(book.status)}</Badge>
                </Link>
              </li>
            ))}
          </ul>
        ) : (
          <p className="empty">
            {totals.all === 0
              ? <>No books yet. Tap <strong>Add</strong> to enter your first one, or <strong>Scan</strong> a label.</>
              : 'No books match that search.'}
          </p>
        )}
      </main>
    </>
  );
}
