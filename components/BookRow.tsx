import Link from 'next/link';
import { statusLabel } from '@/lib/statuses';
import { Badge } from '@/components/ui';
import type { Book } from '@/lib/books';

const COLOR: Record<string, string> = {
  available: 'green',
  loaned: 'amber',
  hold: 'blue',
  reading: 'purple',
  missing: 'red',
};

export default function BookRow({ book }: { book: Book }) {
  return (
    <li className="book-row">
      <Link href={`/books/${book.id}`} className="book-link">
        <div className="book-main">
          <span className="book-title">{book.title}</span>
          {book.author && <span className="book-meta">{book.author}</span>}
          <span className="book-code">{book.code}</span>
        </div>
        <Badge colorPalette={COLOR[book.status]}>{statusLabel(book.status)}</Badge>
      </Link>
    </li>
  );
}
