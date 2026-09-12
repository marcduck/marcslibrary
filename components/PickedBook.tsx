'use client';

import Cover from './Cover';
import type { CatalogueBook } from '@/lib/catalogue';

type Props = { picked: CatalogueBook; onClear: () => void };

/** Shows what the catalogue filled in, and carries it into the form submission. */
export default function PickedBook({ picked, onClear }: Props) {
  const facts = [
    picked.published,
    picked.pages ? `${picked.pages} pages` : '',
    picked.isbn ? `ISBN ${picked.isbn}` : '',
  ].filter(Boolean).join(' · ');

  return (
    <div className="picked">
      <Cover title={picked.title} coverUrl={picked.coverUrl} size="md" />
      <div>
        <p className="picked-label">Using details from the catalogue</p>
        {facts && <p className="facts">{facts}</p>}
        <button type="button" className="link-btn" onClick={onClear}>Clear</button>
      </div>
      <input type="hidden" name="isbn" value={picked.isbn} />
      <input type="hidden" name="coverUrl" value={picked.coverUrl} />
      <input type="hidden" name="published" value={picked.published} />
      <input type="hidden" name="pages" value={picked.pages ?? ''} />
      <input type="hidden" name="summary" value={picked.summary} />
    </div>
  );
}
