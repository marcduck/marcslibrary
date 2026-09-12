import Link from 'next/link';
import Cover from './Cover';
import { statusLabel } from '@/lib/statuses';
import { dueInfo } from '@/lib/due';
import type { Book } from '@/lib/books';

export default function BookRow({ book }: { book: Book }) {
  const due = dueInfo(book);
  const meta: React.ReactNode[] = [];
  if (book.author) meta.push(book.author);
  if (book.status === 'loaned' && book.borrower) meta.push(`with ${book.borrower}`);
  if (book.status === 'hold' && book.borrower) meta.push(`held for ${book.borrower}`);
  if (due) meta.push(<span key="due" className={due.overdue ? 'overdue' : ''}>{due.text}</span>);

  return (
    <li className="book-row">
      <Link href={`/books/${book.id}`} className="book-link">
        <Cover title={book.title} coverUrl={book.coverUrl} size="sm" />
        <div className="book-main">
          <span className="book-title">{book.title}</span>
          {meta.length > 0 && (
            <span className="book-meta">
              {meta.map((part, i) => (
                <span key={i}>{i > 0 && ' · '}{part}</span>
              ))}
            </span>
          )}
          <span className="book-code">{book.code}</span>
        </div>
        <span className={`status status-${book.status}`}>{statusLabel(book.status)}</span>
      </Link>
    </li>
  );
}
