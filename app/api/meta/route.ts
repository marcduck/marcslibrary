import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { meta, setSetting, DEFAULT_LIBRARY_NAME, libraryName } from '@/lib/books';
import { STATUSES } from '@/lib/statuses';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({ ...meta(), statuses: STATUSES });
}

export async function PUT(request: Request) {
  const body = await request.json().catch(() => ({}));
  if (typeof body.name === 'string') {
    setSetting('libraryName', body.name.trim() || DEFAULT_LIBRARY_NAME);
    revalidatePath('/', 'layout');
  }
  return NextResponse.json({ name: libraryName() });
}
