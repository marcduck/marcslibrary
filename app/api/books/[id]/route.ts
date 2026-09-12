import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { getBook, updateBook, deleteBook, ConflictError } from '@/lib/books';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const book = await getBook(id);
  return book ? NextResponse.json(book) : NextResponse.json({ error: 'Book not found.' }, { status: 404 });
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Request body is not valid JSON.' }, { status: 400 });
  }

  try {
    const book = await updateBook(id, body);
    if (!book) return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
    revalidatePath('/');
    revalidatePath(`/books/${id}`);
    return NextResponse.json(book);
  } catch (err) {
    if (err instanceof ConflictError) {
      return NextResponse.json({ error: err.message, book: err.book }, { status: 409 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not save that.' }, { status: 400 });
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!(await deleteBook(id))) return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
  revalidatePath('/');
  return NextResponse.json({ deleted: true });
}
