import Link from 'next/link';
import { notFound } from 'next/navigation';
import TopBar from '@/components/TopBar';
import { StatusControls, DeleteBookButton } from '@/components/BookActions';
import { getBook } from '@/lib/books';
import { statusLabel, statusColor } from '@/lib/statuses';
import { Badge, Button, Card } from '@/components/ui';
import { copy } from '@/lib/copy';

export const dynamic = 'force-dynamic';

export default async function BookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  const searchQuery = [book.title, book.author].filter(Boolean).join(' ');
  const searchHref = `https://www.google.com/search?q=${encodeURIComponent(searchQuery)}`;

  return (
    <>
      <TopBar title={copy.titles.book} back="/" />
      <main className="view">
        <Card.Root variant="outline">
          <Card.Body gap="2">
            <Card.Title>{book.title}</Card.Title>
            {book.author && <p className="author">{book.author}</p>}
            <div className="status-line">
              <Badge colorPalette={statusColor(book.status)}>{statusLabel(book.status)}</Badge>
            </div>
            {book.isbn && <p className="facts">{copy.form.isbn} {book.isbn}</p>}
            <p className="code-line">{copy.form.barcode} {book.code}</p>
          </Card.Body>
        </Card.Root>

        <StatusControls book={book} />

        <Card.Root variant="outline">
          <Card.Body>
            <div className="actions-row">
              <Button asChild variant="outline">
                <a href={searchHref} target="_blank" rel="noopener noreferrer">{copy.book.webSearch}</a>
              </Button>
              <Button asChild variant="outline">
                <Link href={`/books/${book.id}/edit`}>{copy.book.editDetails}</Link>
              </Button>
              <DeleteBookButton id={book.id} title={book.title} />
            </div>
          </Card.Body>
        </Card.Root>

        {book.history.length > 0 && (
          <Card.Root variant="outline">
            <Card.Body>
              <Card.Title mb="2">{copy.book.history}</Card.Title>
              <ul className="history">
                {book.history.slice(0, 8).map((entry, i) => (
                  <li key={i}>
                    <span>{statusLabel(entry.status)}</span>
                    <time dateTime={entry.at}>{new Date(entry.at).toLocaleDateString('en-GB')}</time>
                  </li>
                ))}
              </ul>
            </Card.Body>
          </Card.Root>
        )}
      </main>
    </>
  );
}
