'use client';

import { useActionState } from 'react';
import { updateBookAction, type FormState } from '@/app/actions';
import { Button, Card, Field, Input } from '@/components/ui';
import type { Book } from '@/lib/books';

export default function EditBookForm({ book }: { book: Book }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(updateBookAction, {});

  return (
    <Card.Root variant="outline">
      <Card.Body>
        <form className="form" action={formAction}>
          <input type="hidden" name="id" value={book.id} />

          <Field.Root required>
            <Field.Label>Title</Field.Label>
            <Input name="title" defaultValue={book.title} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>Author</Field.Label>
            <Input name="author" defaultValue={book.author} />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Barcode</Field.Label>
            <Input name="code" defaultValue={book.code} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>ISBN</Field.Label>
            <Input name="isbn" defaultValue={book.isbn} />
          </Field.Root>

          {state.error && <Field.Root invalid><Field.ErrorText>{state.error}</Field.ErrorText></Field.Root>}

          <Button type="submit" colorPalette="blue" disabled={pending}>
            {pending ? 'Saving…' : 'Save changes'}
          </Button>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
