'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { STATUSES } from '@/lib/statuses';
import { setStatusAction, deleteBookAction } from '@/app/actions';
import { Button, Card, Field, SegmentGroup } from '@/components/ui';
import { copy } from '@/lib/copy';
import type { Book } from '@/lib/books';

export function StatusControls({ book }: { book: Book }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState('');

  const apply = (status: string) => {
    setError('');
    startTransition(async () => {
      const result = await setStatusAction(book.id, status);
      if (result.error) return setError(result.error);
      router.refresh();
    });
  };

  return (
    <Card.Root variant="outline">
      <Card.Body gap="2">
        <Card.Title mb="1">{copy.statusActions.changeStatus}</Card.Title>
        <SegmentGroup.Root
          value={book.status}
          onValueChange={(details) => details.value && apply(details.value)}
          disabled={pending}
        >
          <SegmentGroup.Indicator />
          <SegmentGroup.Items items={STATUSES.map((status) => ({ value: status.id, label: status.label }))} />
        </SegmentGroup.Root>
        {error && <Field.Root invalid><Field.ErrorText>{error}</Field.ErrorText></Field.Root>}
      </Card.Body>
    </Card.Root>
  );
}

export function DeleteBookButton({ id, title }: { id: string; title: string }) {
  const [pending, startTransition] = useTransition();

  return (
    <Button
      colorPalette="red"
      variant="outline"
      disabled={pending}
      onClick={() => {
        if (!confirm(copy.statusActions.confirmRemove(title))) return;
        startTransition(() => { void deleteBookAction(id); });
      }}
    >
      {pending ? copy.statusActions.removing : copy.statusActions.removeBook}
    </Button>
  );
}
