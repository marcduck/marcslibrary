import { NextResponse } from 'next/server';
import { getBookByCode } from '@/lib/books';

export const dynamic = 'force-dynamic';

export async function GET(_request: Request, { params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const book = getBookByCode(code);
  return book ? NextResponse.json(book) : NextResponse.json({ error: 'No book with that barcode.' }, { status: 404 });
}
