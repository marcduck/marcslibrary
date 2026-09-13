// The status list, shared by the database, the API and the UI.

export type Status = 'available' | 'loaned' | 'hold' | 'reading' | 'missing';

export type StatusInfo = { id: Status; label: string; hint: string; color: string };

export const STATUSES: StatusInfo[] = [
  { id: 'available', label: 'Available', hint: 'On the shelf',               color: 'green' },
  { id: 'loaned',    label: 'Loaned',    hint: 'Someone has it',             color: 'amber' },
  { id: 'hold',      label: 'On hold',   hint: 'Reserved for someone',       color: 'blue' },
  { id: 'reading',   label: 'Reading',   hint: 'Currently being read',       color: 'purple' },
  { id: 'missing',   label: 'Missing',   hint: 'Lost or unaccounted for',    color: 'red' },
];

export const STATUS_IDS = STATUSES.map((s) => s.id);

export function isStatus(id: unknown): id is Status {
  return typeof id === 'string' && (STATUS_IDS as string[]).includes(id);
}

export function statusLabel(id: string): string {
  return STATUSES.find((s) => s.id === id)?.label ?? id;
}

export function statusColor(id: string): string {
  return STATUSES.find((s) => s.id === id)?.color ?? 'gray';
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
