'use client';

import { useActionState, useState } from 'react';
import { createListCollection } from '@ark-ui/react/collection';
import { createBookAction, type FormState } from '@/app/actions';
import { STATUSES } from '@/lib/statuses';
import { Button, Card, Field, Input, Select } from '@/components/ui';

type Props = { nextCode: string; scannedCode: string };

const statusCollection = createListCollection({
  items: STATUSES,
  itemToValue: (item) => item.id,
  itemToString: (item) => item.label,
});

// Pads whatever digits have been typed so far to 7 characters, so the
// leading zeros appear as you type rather than only once you submit.
function padCode(raw: string): string {
  const digits = raw.replace(/\D/g, '').slice(-7);
  return digits ? digits.padStart(7, '0') : '';
}

export default function AddBookForm({ nextCode, scannedCode }: Props) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(createBookAction, {});
  const [code, setCode] = useState(scannedCode || nextCode);

  return (
    <Card.Root variant="outline">
      <Card.Body>
        <form className="form" action={formAction}>
          <Field.Root required>
            <Field.Label>Title</Field.Label>
            <Input name="title" required />
          </Field.Root>

          <Field.Root>
            <Field.Label>Author</Field.Label>
            <Input name="author" />
          </Field.Root>

          <Field.Root required>
            <Field.Label>Barcode</Field.Label>
            <Input
              name="code"
              inputMode="numeric"
              value={code}
              onChange={(e) => setCode(padCode(e.target.value))}
              required
            />
          </Field.Root>

          <Field.Root>
            <Field.Label>ISBN</Field.Label>
            <Input name="isbn" />
          </Field.Root>

          <Select.Root collection={statusCollection} defaultValue={['available']} name="status">
            <Select.Label>Status</Select.Label>
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

          {state.error && <Field.Root invalid><Field.ErrorText>{state.error}</Field.ErrorText></Field.Root>}

          <Button type="submit" colorPalette="blue" disabled={pending}>
            {pending ? 'Adding…' : 'Add to library'}
          </Button>
        </form>
      </Card.Body>
    </Card.Root>
  );
}
