import TopBar from '@/components/TopBar';
import AddBookForm from '@/components/AddBookForm';
import { nextCode } from '@/lib/books';

export const dynamic = 'force-dynamic';

export default async function AddPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code = '' } = await searchParams;

  return (
    <>
      <TopBar title="Add a book" back="/" />
      <main className="view">
        <AddBookForm nextCode={nextCode()} scannedCode={code} />
      </main>
    </>
  );
}
