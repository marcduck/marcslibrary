'use client';

import { useActionState, useState } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import { createBookAction, updateBookAction, type FormState } from '@/app/actions';
import { STATUSES } from '@/lib/statuses';
import { Button, Card, Field, Input, Select } from '@/components/ui';
import { copy } from '@/lib/copy';
import type { Book } from '@/lib/books';

type Props = { book?: Book; nextCode?: string; scannedCode?: string };

const statusCollection = createListCollection({
  items: STATUSES,
  itemToValue: (item) => item.id,
  itemToString: (item) => item.label,
});

function padCode(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(-7);
  return digits ? digits.padStart(7, '0') : '';
}

export default function BookForm({ book, nextCode = '', scannedCode = '' }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    book ? updateBookAction : createBookAction,
    {},
  );
  const [code, setCode] = useState(padCode(scannedCode) || nextCode);

  return (
    <Card.Root variant="outline">
      <Card.Body>
        <form className="form" action={formAction}>
          {book && <input type="hidden" name="id" value={book.id} />}

          <Field.Root required>
            <Field.Label>{copy.form.title}</Field.Label>
            <Input name="title" defaultValue={book?.title} required />
          </Field.Root>

          <Field.Root>
            <Field.Label>{copy.form.author}</Field.Label>
            <Input name="author" defaultValue={book?.author} />
          </Field.Root>

          <Field.Root required>
            <Field.Label>{copy.form.barcode}</Field.Label>
            {book ? (
              <Input name="code" defaultValue={book.code} required />
            ) : (
              <Input
                name="code"
                inputMode="numeric"
                value={code}
                onChange={(e) => setCode(padCode(e.target.value))}
                required
              />
            )}
          </Field.Root>

          <Field.Root>
            <Field.Label>{copy.form.isbn}</Field.Label>
            <Input name="isbn" defaultValue={book?.isbn} />
          </Field.Root>

          {!book && (
            <Select.Root collection={statusCollection} defaultValue={['available']} name="status">
              <Select.Label>{copy.form.status}</Select.Label>
              <Select.Control>
                <Select.Trigger>
                  <Select.ValueText />
                  <Select.IndicatorGroup>
                    <Select.Indicator />
                  </Select.IndicatorGroup>
                </Select.Trigger>
              </Select.Control>
              <Select.Positioner>
                <Select.Content>
                  {statusCollection.items.map((item) => (
                    <Select.Item key={item.id} item={item}>
                      <Select.ItemText>{item.label}</Select.ItemText>
                      <Select.ItemIndicator />
                    </Select.Item>
                  ))}
                </Select.Content>
              </Select.Positioner>
              <Select.HiddenSelect />
            </Select.Root>
          )}

          {state.error && <Field.Root invalid><Field.ErrorText>{state.error}</Field.ErrorText></Field.Root>}

          <Button type="submit" colorPalette="blue" disabled={pending}>
            {book ? (pending ? copy.form.saving : copy.form.saveChanges) : (pending ? copy.form.adding : copy.form.addToLibrary)}
          </Button>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
