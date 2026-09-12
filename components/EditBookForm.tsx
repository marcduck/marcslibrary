'use client';

import { useActionState, useState } from 'react';
import CatalogueSearch from './CatalogueSearch';
import { updateBookAction, type FormState } from '@/app/actions';
import type { Book } from '@/lib/books';
import type { CatalogueBook } from '@/lib/catalogue';

export default function EditBookForm({ book }: { book: Book }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateBookAction, {});
  const [fields, setFields] = useState({
    title: book.title,
    author: book.author,
    isbn: book.isbn,
    coverUrl: book.coverUrl,
  });
  const [extra, setExtra] = useState({ published: book.published, pages: book.pages, summary: book.summary });

  const pick = (found: CatalogueBook) => {
    setFields({
      title: found.title || fields.title,
      author: found.author || fields.author,
      isbn: found.isbn || fields.isbn,
      coverUrl: found.coverUrl || fields.coverUrl,
    });
    setExtra({
      published: found.published || extra.published,
      pages: found.pages ?? extra.pages,
      summary: found.summary || extra.summary,
    });
  };

  const set = (key: keyof typeof fields) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setFields((prev) => ({ ...prev, [key]: e.target.value }));

  return (
    <>
      <CatalogueSearch
        initialQuery={book.isbn || `${book.title} ${book.author}`.trim()}
        onPick={pick}
        label="Look up details"
        hint="Use this to add or replace the cover and book details."
      />

      <form className="card form" action={formAction}>
        <input type="hidden" name="id" value={book.id} />
        <input type="hidden" name="published" value={extra.published} />
        <input type="hidden" name="pages" value={extra.pages ?? ''} />
        <input type="hidden" name="summary" value={extra.summary} />

        <label>Title <input type="text" name="title" value={fields.title} onChange={set('title')} required /></label>
        <label>Author <input type="text" name="author" value={fields.author} onChange={set('author')} /></label>
        <label>Shelf barcode <input type="text" name="code" defaultValue={book.code} required /></label>
        <label>ISBN <input type="text" name="isbn" value={fields.isbn} onChange={set('isbn')} /></label>
        <label>Cover image URL <input type="text" name="coverUrl" value={fields.coverUrl} onChange={set('coverUrl')} /></label>
        <label>Notes <textarea name="notes" rows={3} defaultValue={book.notes} /></label>

        {state.error && <p className="hint error">{state.error}</p>}

        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save changes'}
        </button>
      </form>
    </>
  );
}
