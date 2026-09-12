'use client';

import { useTransition } from 'react';
import { deleteBookAction } from '@/app/actions';
import { Button } from '@/components/ui';

export default function DeleteBookButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      colorPalette="red"
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (!confirm(`Remove "${title}" from the library?`)) return;
        startTransition(() => { void deleteBookAction(id); });
      }}
    >
      {pending ? 'Removing…' : 'Remove book'}
    </Button>
  );
}
