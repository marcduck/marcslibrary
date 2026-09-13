import 'server-only';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { ConflictError } from './books';

export function refreshBooks(id?: string): void {
  revalidatePath('/');
  if (id) revalidatePath(`/books/${id}`);
}

export async function readJsonBody(request: Request): Promise<any> {
  const body = await request.json().catch(() => null);
  return body && typeof body === 'object' ? body : null;
}

export function errorResponse(err: unknown, fallback: string) {
  if (err instanceof ConflictError) {
    return NextResponse.json({ error: err.message, book: err.book }, { status: 409 });
  }
  return NextResponse.json({ error: err instanceof Error ? err.message : fallback }, { status: 400 });
}
