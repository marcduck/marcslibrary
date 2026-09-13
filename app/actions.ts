'use server';

import { redirect } from 'next/navigation';
import * as books from '@/lib/books';
import { refreshBooks } from '@/lib/api';

export type FormState = { error?: string };

function message(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong.';
}

function fieldsFromForm(formData: FormData) {
  return {
    title: String(formData.get('title') ?? ''),
    author: String(formData.get('author') ?? ''),
    code: String(formData.get('code') ?? ''),
    isbn: String(formData.get('isbn') ?? ''),
  };
}

export async function createBookAction(_state: FormState, formData: FormData): Promise<FormState> {
  let id: string;
  try {
    const book = await books.createBook({
      ...fieldsFromForm(formData),
      status: (formData.get('status') as books.Book['status']) ?? 'available',
    });
    id = book.id;
  } catch (err) {
    return { error: message(err) };
  }
  refreshBooks(id);
  redirect(`/books/${id}`);
}

export async function updateBookAction(_state: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get('id') ?? '');
  try {
    const updated = await books.updateBook(id, fieldsFromForm(formData));
    if (!updated) return { error: 'Book not found.' };
  } catch (err) {
    return { error: message(err) };
  }
  refreshBooks(id);
  redirect(`/books/${id}`);
}

export async function setStatusAction(id: string, status: string): Promise<FormState> {
  try {
    const book = await books.setStatus(id, status);
    if (!book) return { error: 'Book not found.' };
  } catch (err) {
    return { error: message(err) };
  }
  refreshBooks(id);
  return {};
}

export async function deleteBookAction(id: string): Promise<FormState> {
  if (!(await books.deleteBook(id))) return { error: 'Book not found.' };
  refreshBooks();
  redirect('/');
}

/** Used by the scanner: turns a scanned barcode into a book id, or null. */
export async function findByCodeAction(code: string): Promise<{ id: string } | null> {
  const book = await books.getBookByCode(code);
  return book ? { id: book.id } : null;
}
