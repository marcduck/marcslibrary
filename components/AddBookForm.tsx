'use client';

import { useActionState, useState } from 'react';
import CatalogueSearch from './CatalogueSearch';
import PickedBook from './PickedBook';
import { createBookAction, type FormState } from '@/app/actions';
import { STATUSES } from '@/lib/statuses';
import type { CatalogueBook } from '@/lib/catalogue';

type Props = { nextCode: string; scannedISBN: string; scannedCode: string };

export default function AddBookForm({ nextCode, scannedISBN, scannedCode }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createBookAction, {});
  const [picked, setPicked] = useState<CatalogueBook | null>(null);
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');

  const pick = (book: CatalogueBook) => {
    setPicked(book);
    setTitle(book.title);
    setAuthor(book.author);
  };

  return (
    <>
      <CatalogueSearch initialQuery={scannedISBN} autoSearch={Boolean(scannedISBN)} onPick={pick} />

      <form className="card form" action={formAction}>
        {picked && <PickedBook picked={picked} onClear={() => setPicked(null)} />}

        <label>
          Title
          <input type="text" name="title" value={title} onChange={(e) => setTitle(e.target.value)}
                 placeholder="Le Mort Darthur" required />
        </label>
        <label>
          Author
          <input type="text" name="author" value={author} onChange={(e) => setAuthor(e.target.value)}
                 placeholder="Thomas Malory" />
        </label>
        <label>
          Shelf barcode
          <input type="text" name="code" defaultValue={scannedISBN ? nextCode : (scannedCode || nextCode)} required />
        </label>
        <label>
          Status
          <select name="status" defaultValue="available">
            {STATUSES.map((status) => <option key={status.id} value={status.id}>{status.label}</option>)}
          </select>
        </label>
        <label>
          Notes
          <textarea name="notes" rows={3} placeholder="Shelf, edition, condition..." />
        </label>

        {state.error && <p className="hint error">{state.error}</p>}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Adding…' : 'Add to library'}
        </button>
      </form>
    </>
  );
}
