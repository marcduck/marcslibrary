import { NextResponse } from 'next/server';
import { listBooks, counts, createBook } from '@/lib/books';
import { refreshBooks, readJsonBody, errorResponse } from '@/lib/api';
import { copy } from '@/lib/copy';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const [books, bookCounts] = await Promise.all([
    listBooks({ q: searchParams.get('q') || '', status: searchParams.get('status') || 'all' }),
    counts(),
  ]);
  return NextResponse.json({ books, counts: bookCounts });
}

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body) return NextResponse.json({ error: copy.errors.invalidJson }, { status: 400 });
  if (!String(body.title ?? '').trim()) {
    return NextResponse.json({ error: copy.errors.titleRequired }, { status: 400 });
  }

  try {
    const book = await createBook(body);
    refreshBooks();
    return NextResponse.json(book, { status: 201 });
  } catch (err) {
    return errorResponse(err, copy.errors.couldNotAddBook);
  }
}
