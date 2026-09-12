import { NextResponse } from 'next/server';
import { lookup } from '@/lib/catalogue';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q') || '';
  const isbn = searchParams.get('isbn') || '';
  if (!q && !isbn) return NextResponse.json({ error: 'Pass ?q= or ?isbn=' }, { status: 400 });

  try {
    return NextResponse.json(await lookup({ q, isbn }));
  } catch (err) {
    const reason = err instanceof Error && (err.name === 'TimeoutError' || err.name === 'AbortError')
      ? 'the catalogue did not respond in time'
      : err instanceof Error ? err.message : 'unknown error';
    return NextResponse.json({ error: `Book lookup failed: ${reason}.` }, { status: 502 });
  }
}
