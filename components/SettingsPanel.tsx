'use client';

import { useActionState, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { setLibraryNameAction, importBooksAction, type FormState } from '@/app/actions';
import type { Counts } from '@/lib/books';

type Props = { name: string; counts: Counts; nextCode: string };

const LEGACY_KEY = 'marcslibrary.books.v1';

export default function SettingsPanel({ name, counts, nextCode }: Props) {
  const router = useRouter();
  const [state, formAction, pending] = useActionState<FormState, FormData>(setLibraryNameAction, {});
  const [message, setMessage] = useState('');
  // The first version of this app kept books in the browser; offer to move them.
  const [legacy, setLegacy] = useState<unknown[]>([]);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem(LEGACY_KEY) || '[]');
      if (Array.isArray(saved) && saved.length) setLegacy(saved);
    } catch {
      // Nothing usable in storage; nothing to offer.
    }
  }, []);

  async function importFile(file: File) {
    try {
      const result = await importBooksAction(JSON.parse(await file.text()));
      setMessage(result.error ? `Import failed: ${result.error}` : `Imported: ${result.added} new, ${result.updated} updated`);
      router.refresh();
    } catch (err) {
      setMessage(`Import failed: ${err instanceof Error ? err.message : 'could not read that file'}`);
    }
  }

  async function uploadLegacy() {
    const result = await importBooksAction({ books: legacy });
    if (result.error) return setMessage(`Upload failed: ${result.error}`);
    localStorage.removeItem(LEGACY_KEY);
    setLegacy([]);
    setMessage(`Uploaded: ${result.added} new, ${result.updated} updated`);
    router.refresh();
  }

  return (
    <>
      <form className="card form" action={formAction}>
        <label>
          Library name (printed on labels)
          <input type="text" name="name" defaultValue={name} />
        </label>
        {state.error && <p className="hint error">{state.error}</p>}
        <button type="submit" className="btn btn-primary" disabled={pending}>
          {pending ? 'Saving…' : 'Save name'}
        </button>
      </form>

      <section className="card">
        <h3>Your library</h3>
        <p className="hint">
          {counts.all} book{counts.all === 1 ? '' : 's'}, stored in the database on the server.
          Next shelf barcode: {nextCode}.
        </p>
        <div className="actions">
          <a className="btn" href="/api/export" download>Export backup (JSON)</a>
          <label className="btn file-btn">
            Import backup
            <input
              type="file"
              accept="application/json,.json"
              hidden
              onChange={(e) => { const file = e.target.files?.[0]; if (file) void importFile(file); }}
            />
          </label>
        </div>
        {message && <p className="hint">{message}</p>}
      </section>

      {legacy.length > 0 && (
        <section className="card">
          <h3>Books saved on this device</h3>
          <p className="hint">
            This browser still has books from before the library moved to the server.
            Upload them to keep everything in one place.
          </p>
          <div className="actions">
            <button type="button" className="btn btn-primary" onClick={() => void uploadLegacy()}>
              Upload {legacy.length} book{legacy.length === 1 ? '' : 's'} to the server
            </button>
          </div>
        </section>
      )}
    </>
  );
}
