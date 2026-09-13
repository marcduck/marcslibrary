import { NextResponse } from 'next/server';
import { setStatus } from '@/lib/books';
import { refreshBooks } from '@/lib/api';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const book = await setStatus(id, body.status);
    if (!book) return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
    refreshBooks(id);
    return NextResponse.json(book);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not set that status.' }, { status: 400 });
  }
}
