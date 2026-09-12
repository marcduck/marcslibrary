import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { setStatus } from '@/lib/books';

export const dynamic = 'force-dynamic';

export async function POST(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await request.json().catch(() => ({}));

  try {
    const book = setStatus(id, body.status, body);
    if (!book) return NextResponse.json({ error: 'Book not found.' }, { status: 404 });
    revalidatePath('/');
    revalidatePath(`/books/${id}`);
    return NextResponse.json(book);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Could not set that status.' }, { status: 400 });
  }
}
