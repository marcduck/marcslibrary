import { NextResponse } from 'next/server';
import { setStatus } from '@/lib/books';
import { refreshBooks } from '@/lib/api';
import { copy } from '@/lib/copy';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const book = await setStatus(id, body.status);
    if (!book) return NextResponse.json({ error: copy.errors.bookNotFound }, { status: 404 });
    refreshBooks(id);
    return NextResponse.json(book);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : copy.errors.couldNotSetStatus }, { status: 400 });
  }
}
