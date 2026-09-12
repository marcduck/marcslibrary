import { NextResponse } from 'next/server';
import { exportAll } from '@/lib/books';

export const dynamic = 'force-dynamic';

export async function GET() {
  const data = exportAll();
  return new NextResponse(JSON.stringify(data, null, 2), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="library-${new Date().toISOString().slice(0, 10)}.json"`,
    },
  });
}
