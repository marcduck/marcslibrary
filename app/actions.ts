'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import * as books from '@/lib/books';
import { DEFAULT_LIBRARY_NAME } from '@/lib/books';

export type FormState = { error?: string };

function message(err: unknown): string {
  return err instanceof Error ? err.message : 'Something went wrong.';
}

function refresh(id?: string) {
  revalidatePath('/');
  revalidatePath('/settings');
  if (id) revalidatePath(`/books/${id}`);
}

export async function createBookAction(_state: FormState, formData: FormData): Promise<FormState> {
  let id: string;
  try {
    const book = books.createBook({
      title: String(formData.get('title') ?? ''),
      author: String(formData.get('author') ?? ''),
      code: String(formData.get('code') ?? ''),
      status: (formData.get('status') as books.Book['status']) ?? 'available',
      notes: String(formData.get('notes') ?? ''),
      isbn: String(formData.get('isbn') ?? ''),
      coverUrl: String(formData.get('coverUrl') ?? ''),
      published: String(formData.get('published') ?? ''),
      pages: Number(formData.get('pages')) || null,
      summary: String(formData.get('summary') ?? ''),
    });
    id = book.id;
  } catch (err) {
    return { error: message(err) };
  }
  refresh(id);
  redirect(`/books/${id}`);
}

export async function updateBookAction(_state: FormState, formData: FormData): Promise<FormState> {
  const id = String(formData.get('id') ?? '');
  try {
    const updated = books.updateBook(id, {
      title: String(formData.get('title') ?? ''),
      author: String(formData.get('author') ?? ''),
      code: String(formData.get('code') ?? ''),
      isbn: String(formData.get('isbn') ?? ''),
      coverUrl: String(formData.get('coverUrl') ?? ''),
      notes: String(formData.get('notes') ?? ''),
      published: String(formData.get('published') ?? ''),
      pages: Number(formData.get('pages')) || null,
      summary: String(formData.get('summary') ?? ''),
    });
    if (!updated) return { error: 'Book not found.' };
  } catch (err) {
    return { error: message(err) };
  }
  refresh(id);
  redirect(`/books/${id}`);
}

export async function setStatusAction(
  id: string,
  status: string,
  extra: { borrower?: string; dueDate?: string } = {},
): Promise<FormState> {
  try {
    const book = books.setStatus(id, status, extra);
    if (!book) return { error: 'Book not found.' };
  } catch (err) {
    return { error: message(err) };
  }
  refresh(id);
  return {};
}

export async function deleteBookAction(id: string): Promise<FormState> {
  if (!books.deleteBook(id)) return { error: 'Book not found.' };
  refresh();
  redirect('/');
}

export async function setLibraryNameAction(_state: FormState, formData: FormData): Promise<FormState> {
  const name = String(formData.get('name') ?? '').trim() || DEFAULT_LIBRARY_NAME;
  books.setSetting('libraryName', name);
  revalidatePath('/', 'layout');
  return {};
}

export async function importBooksAction(payload: unknown): Promise<FormState & { added?: number; updated?: number }> {
  const data = payload as { books?: books.BookInput[]; name?: string } | books.BookInput[];
  const incoming = Array.isArray(data) ? data : data?.books;
  if (!Array.isArray(incoming)) return { error: 'No "books" array found in that file.' };

  try {
    if (!Array.isArray(data) && typeof data.name === 'string' && data.name.trim()) {
      books.setSetting('libraryName', data.name.trim());
    }
    const result = books.importBooks(incoming);
    revalidatePath('/', 'layout');
    return result;
  } catch (err) {
    return { error: message(err) };
  }
}

/** Used by the scanner: turns a scanned barcode into a book id, or null. */
export async function findByCodeAction(code: string): Promise<{ id: string } | null> {
  const book = books.getBookByCode(code);
  return book ? { id: book.id } : null;
}
