'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { STATUSES } from '@/lib/statuses';
import { setStatusAction } from '@/app/actions';
import { Card, Field, SegmentGroup } from '@/components/ui';
import type { Book } from '@/lib/books';

export default function StatusControls({ book }: { book: Book }) {
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
        <Card.Title mb="1">Change status</Card.Title>
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
