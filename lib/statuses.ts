// The status list, shared by the database, the API and the UI.

export type Status = 'available' | 'loaned' | 'hold' | 'reading' | 'missing';

export type StatusInfo = { id: Status; label: string; hint: string };

export const STATUSES: StatusInfo[] = [
  { id: 'available', label: 'Available', hint: 'On the shelf' },
  { id: 'loaned',    label: 'Loaned',    hint: 'Someone has it' },
  { id: 'hold',      label: 'On hold',   hint: 'Reserved for someone' },
  { id: 'reading',   label: 'Reading',   hint: 'Currently being read' },
  { id: 'missing',   label: 'Missing',   hint: 'Lost or unaccounted for' },
];

export const STATUS_IDS = STATUSES.map((s) => s.id);

export function isStatus(id: unknown): id is Status {
  return typeof id === 'string' && (STATUS_IDS as string[]).includes(id);
}

export function statusLabel(id: string): string {
  return STATUSES.find((s) => s.id === id)?.label ?? id;
}

// Barcodes get typed, scanned and printed with different amounts of padding,
// so compare them loosely: "167", "0000167" and " 0000167 " are the same book.
export function normaliseCode(code: unknown): string {
  const trimmed = String(code ?? '').trim().toUpperCase();
  return /^\d+$/.test(trimmed) ? String(Number(trimmed)) : trimmed;
}

export function formatCode(code: unknown): string {
  const trimmed = String(code ?? '').trim();
  return /^\d+$/.test(trimmed) ? trimmed.padStart(7, '0') : trimmed.toUpperCase();
}

/** EAN-13 barcodes starting 978/979 are ISBNs, and so are bare 10 digit codes. */
export function cleanISBN(value: unknown): string {
  return String(value ?? '').replace(/[^0-9Xx]/g, '').toUpperCase();
}

export function looksLikeISBN(value: unknown): boolean {
  const isbn = cleanISBN(value);
  if (isbn.length === 13) return /^97[89]/.test(isbn);
  return isbn.length === 10;
}
