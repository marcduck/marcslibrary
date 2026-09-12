'use client';

import { useTransition } from 'react';
import { deleteBookAction } from '@/app/actions';

export default function DeleteBookButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      className="btn btn-danger"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Remove "${title}" from the library?`)) return;
        startTransition(() => { void deleteBookAction(id); });
      }}
    >
      {pending ? 'Removing…' : 'Remove book'}
    </button>
  );
}
