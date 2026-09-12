import { notFound } from 'next/navigation';
import TopBar from '@/components/TopBar';
import PrintButton from '@/components/PrintButton';
import { getBook, libraryName } from '@/lib/books';
import { barcodeSVG } from '@/lib/barcode';

export const dynamic = 'force-dynamic';

export default async function LabelPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = getBook(id);
  if (!book) notFound();

  let svg = '';
  let error = '';
  try {
    svg = barcodeSVG(book.code, { height: 60, module: 2 });
  } catch (err) {
    error = err instanceof Error ? err.message : 'That barcode cannot be printed.';
  }

  return (
    <>
      <TopBar title="Label" back={`/books/${book.id}`} />
      <main className="view">
        {error ? <p className="empty error">{error}</p> : (
          <>
            <div className="label-sheet">
              <div className="label-library">{libraryName()}</div>
              <div className="label-title">{book.title}</div>
              {/* The SVG is generated on the server by our own Code 128 encoder. */}
              <div className="label-barcode" dangerouslySetInnerHTML={{ __html: svg }} />
              <div className="label-code">{book.code}</div>
            </div>
            <div className="card actions no-print">
              <PrintButton />
              <p className="hint">
                Prints just the label, sized for a sticker. Set your printer margins to none for the tightest fit.
              </p>
            </div>
          </>
        )}
      </main>
    </>
  );
}
