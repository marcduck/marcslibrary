import Link from 'next/link';
import TopBar from '@/components/TopBar';
import { copy } from '@/lib/copy';

export default function NotFound() {
  return (
    <>
      <TopBar title={copy.titles.notFound} back="/" />
      <main className="view">
        <p className="empty">
          {copy.notFound.message} <Link href="/">{copy.notFound.backLink}</Link>.
        </p>
      </main>
    </>
  );
}
