import TopBar from '@/components/TopBar';
import AddBookForm from '@/components/AddBookForm';
import { nextCode } from '@/lib/books';
import { looksLikeISBN, cleanISBN } from '@/lib/statuses';

export const dynamic = 'force-dynamic';

export default async function AddPage({ searchParams }: { searchParams: Promise<{ code?: string }> }) {
  const { code = '' } = await searchParams;
  // An ISBN barcode off the back of a book identifies the book itself; a shelf
  // label is just our own number, so only the former is worth looking up.
  const scannedISBN = looksLikeISBN(code) ? cleanISBN(code) : '';

  return (
    <>
      <TopBar title="Add a book" back="/" />
      <main className="view">
        <AddBookForm nextCode={nextCode()} scannedISBN={scannedISBN} scannedCode={scannedISBN ? '' : code} />
      </main>
    </>
  );
}
