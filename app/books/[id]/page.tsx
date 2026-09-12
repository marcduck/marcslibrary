import Link from 'next/link';
import { notFound } from 'next/navigation';
import TopBar from '@/components/TopBar';
import Cover from '@/components/Cover';
import StatusControls from '@/components/StatusControls';
import DeleteBookButton from '@/components/DeleteBookButton';
import { getBook } from '@/lib/books';
import { statusLabel } from '@/lib/statuses';
import { dueInfo } from '@/lib/due';

export const dynamic = 'force-dynamic';

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  const due = dueInfo(book);
  const facts = [
    book.published && `First published ${book.published}`,
    book.pages && `${book.pages} pages`,
    book.isbn && `ISBN ${book.isbn}`,
  ].filter(Boolean).join(' · ');

  return (
    <>
      <TopBar title="Book" back="/" />
      <main className="view">
        <section className="card book-header">
          <div className="book-hero">
            <Cover title={book.title} coverUrl={book.coverUrl} size="lg" />
            <div className="book-hero-text">
              <h2>{book.title}</h2>
              {book.author && <p className="author">{book.author}</p>}
              <p className="status-line">
                <span className={`status status-${book.status}`}>{statusLabel(book.status)}</span>
                {book.borrower && <span className="borrower">{book.borrower}</span>}
                {due && <span className={due.overdue ? 'overdue' : ''}>{due.text}</span>}
              </p>
              {facts && <p className="facts">{facts}</p>}
              <p className="code-line">Barcode {book.code}</p>
            </div>
          </div>
        </section>

        <StatusControls book={book} />

        {book.summary && (
          <section className="card"><h3>About</h3><p className="notes">{book.summary}</p></section>
        )}
        {book.notes && (
          <section className="card"><h3>Notes</h3><p className="notes">{book.notes}</p></section>
        )}

        {book.history.length > 0 && (
          <section className="card">
            <h3>History</h3>
            <ul className="history">
              {book.history.slice(0, 8).map((entry, i) => (
                <li key={i}>
                  <span>{statusLabel(entry.status)}{entry.borrower && ` — ${entry.borrower}`}</span>
                  <time dateTime={entry.at}>{new Date(entry.at).toLocaleDateString('en-GB')}</time>
                </li>
              ))}
            </ul>
          </section>
        )}

        <section className="card actions">
          <Link className="btn" href={`/books/${book.id}/label`}>Print label</Link>
          <Link className="btn" href={`/books/${book.id}/edit`}>Edit details</Link>
          <DeleteBookButton id={book.id} title={book.title} />
        </section>
      </main>
    </>
  );
}
