import { Suspense } from 'react';
import TopBar from '@/components/TopBar';
import BookRow from '@/components/BookRow';
import LibrarySearch from '@/components/LibrarySearch';
import { listBooks, counts } from '@/lib/books';

export const dynamic = 'force-dynamic';

type Props = { searchParams: Promise<{ q?: string; status?: string }> };

export default async function LibraryPage({ searchParams }: Props) {
  const { q = '', status = 'all' } = await searchParams;
  const books = listBooks({ q, status });
  const totals = counts();

  return (
    <>
      <TopBar title="Marc's Library" />
      <main className="view">
        <Suspense fallback={<div className="search-row" />}>
          <LibrarySearch counts={totals} />
        </Suspense>
        {books.length > 0 ? (
          <ul className="book-list">
            {books.map((book) => <BookRow key={book.id} book={book} />)}
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
