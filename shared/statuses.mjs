// Shared by the server (validation) and the browser (UI), so the list of
// statuses only ever exists in one place.

export const STATUSES = [
  { id: 'available', label: 'Available', hint: 'On the shelf' },
  { id: 'loaned',    label: 'Loaned',    hint: 'Someone has it' },
  { id: 'hold',      label: 'On hold',   hint: 'Reserved for someone' },
  { id: 'reading',   label: 'Reading',   hint: 'Currently being read' },
  { id: 'missing',   label: 'Missing',   hint: 'Lost or unaccounted for' },
];

export const STATUS_IDS = STATUSES.map((s) => s.id);

export function isStatus(id) {
  return STATUS_IDS.includes(id);
}

export function statusLabel(id) {
  const found = STATUSES.find((s) => s.id === id);
  return found ? found.label : id;
}

// Barcodes get typed, scanned and printed with different amounts of padding,
// so compare them loosely: "167", "0000167" and " 0000167 " are the same book.
export function normaliseCode(code) {
  const trimmed = String(code == null ? '' : code).trim().toUpperCase();
  return /^\d+$/.test(trimmed) ? String(Number(trimmed)) : trimmed;
}

export function formatCode(code) {
  const trimmed = String(code == null ? '' : code).trim();
  return /^\d+$/.test(trimmed) ? trimmed.padStart(7, '0') : trimmed.toUpperCase();
}
