import { notFound } from 'next/navigation';
import TopBar from '@/components/TopBar';
import EditBookForm from '@/components/EditBookForm';
import { getBook } from '@/lib/books';

export const dynamic = 'force-dynamic';

export default async function EditBookPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  return (
    <>
      <TopBar title="Edit book" back={`/books/${book.id}`} />
      <main className="view">
        <EditBookForm book={book} />
      </main>
    </>
  );
}
