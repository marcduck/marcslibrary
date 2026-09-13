import { NextResponse } from 'next/server';
import { getBook, updateBook, deleteBook } from '@/lib/books';
import { refreshBooks, readJsonBody, errorResponse } from '@/lib/api';

export const dynamic = 'force-dynamic';

type Context = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Context) {
  const { id } = await params;
  const book = await getBook(id);
  return book ? NextResponse.json(book) : NextResponse.json({ error: 'Book not found.' }, { status: 404 });
}

export async function PATCH(request: Request, { params }: Context) {
  const { id } = await params;
  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: 'Request body is not valid JSON.' }, { status: 400 });

  try {
    const book = await updateBook(id, body);
    if (!book) return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
    refreshBooks(id);
    return NextResponse.json(book);
  } catch (err) {
    return errorResponse(err, 'Could not save that.');
  }
}

export async function DELETE(_request: Request, { params }: Context) {
  const { id } = await params;
  if (!(await deleteBook(id))) return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
  refreshBooks();
  return NextResponse.json({ deleted: true });
}
