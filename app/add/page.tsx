import TopBar from '@/components/TopBar';
import BookForm from '@/components/BookForm';
import { nextCode } from '@/lib/books';

export const dynamic = 'force-dynamic';

export default async function AddPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code = '' } = await searchParams;
  const suggestedCode = await nextCode();

  return (
    <>
      <TopBar title="Add a book" back="/" />
      <main className="view">
        <BookForm nextCode={suggestedCode} scannedCode={code} />
      </main>
    </>
  );
}
