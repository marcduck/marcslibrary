import { copy } from './copy.ts';

export type Status = 'available' | 'loaned' | 'hold' | 'reading' | 'missing';

export type StatusInfo = { id: Status; label: string; color: string };

export const STATUSES: StatusInfo[] = [
  { id: 'available', label: copy.statuses.available, color: 'green' },
  { id: 'loaned', label: copy.statuses.loaned, color: 'amber' },
  { id: 'hold', label: copy.statuses.hold, color: 'blue' },
  { id: 'reading', label: copy.statuses.reading, color: 'purple' },
  { id: 'missing', label: copy.statuses.missing, color: 'red' },
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

export function normaliseCode(code: unknown): string {
  const trimmed = String(code ?? '').trim().toUpperCase();
  return /^\d+$/.test(trimmed) ? String(Number(trimmed)) : trimmed;
}

export function formatCode(code: unknown): string {
  const trimmed = String(code ?? '').trim();
  return /^\d+$/.test(trimmed) ? trimmed.padStart(7, '0') : trimmed.toUpperCase();
}
