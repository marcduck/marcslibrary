import type { Book } from './books.ts';

export type DueInfo = { overdue: boolean; text: string };

/** How a loan's due date reads on the shelf list: "Due in 3 days", "2 days overdue". */
export function dueInfo(book: Pick<Book, 'status' | 'dueDate'>): DueInfo | null {
  if (book.status !== 'loaned' || !book.dueDate) return null;

  const due = new Date(book.dueDate + 'T00:00:00');
  if (Number.isNaN(due.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days = Math.round((due.getTime() - today.getTime()) / 86400000);

  if (days < 0) {
    const n = Math.abs(days);
    return { overdue: true, text: `${n} day${n === 1 ? '' : 's'} overdue` };
  }
  if (days === 0) return { overdue: false, text: 'Due today' };
  return { overdue: false, text: `Due in ${days} day${days === 1 ? '' : 's'}` };
}
