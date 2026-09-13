import { notFound } from 'next/navigation';
import TopBar from '@/components/TopBar';
import BookForm from '@/components/BookForm';
import { getBook } from '@/lib/books';

export const dynamic = 'force-dynamic';

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await getBook(id);
  if (!book) notFound();

  return (
    <>
      <TopBar title="Edit book" back={`/books/${book.id}`} />
      <main className="view">
        <BookForm book={book} />
      </main>
    </>
  );
}
