import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { importBooks, setSetting } from '@/lib/books';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (body === null) return NextResponse.json({ error: 'Request body is not valid JSON.' }, { status: 400 });

  const incoming = Array.isArray(body) ? body : body.books;
  if (!Array.isArray(incoming)) {
    return NextResponse.json({ error: 'No "books" array found in that file.' }, { status: 400 });
  }
  if (!Array.isArray(body) && typeof body.name === 'string' && body.name.trim()) {
    setSetting('libraryName', body.name.trim());
  }

  try {
    const result = importBooks(incoming, { replace: Boolean(!Array.isArray(body) && body.replace) });
    revalidatePath('/', 'layout');
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json({ error: err instanceof Error ? err.message : 'Import failed.' }, { status: 400 });
  }
}
