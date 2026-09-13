import { NextResponse } from 'next/server';
import { getBookByCode } from '@/lib/books';
import { copy } from '@/lib/copy';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const book = await getBookByCode(code);
  return book ? NextResponse.json(book) : NextResponse.json({ error: copy.errors.noBookForBarcode }, { status: 404 });
}
