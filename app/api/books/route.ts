import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { listBooks, counts, createBook, ConflictError } from '@/lib/books';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  return NextResponse.json({
    books: listBooks({ q: searchParams.get('q') || '', status: searchParams.get('status') || 'all' }),
    counts: counts(),
  });
}

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body || typeof body !== 'object') {
    return NextResponse.json({ error: 'Request body is not valid JSON.' }, { status: 400 });
  }
  if (!String(body.title ?? '').trim()) {
    return NextResponse.json({ error: 'A title is required.' }, { status: 400 });
  }

  try {
    const book = createBook(body);
    revalidatePath('/');
    return NextResponse.json(book, { status: 201 });
  } catch (err) {
    if (err instanceof ConflictError) {
      return NextResponse.json({ error: err.message, book: err.book }, { status: 409 });
    }
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not add that book.' }, { status: 400 });
  }
}
