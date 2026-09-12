import Link from 'next/link';
import TopBar from '@/components/TopBar';

export default function NotFound() {
  return (
    <>
      <TopBar title="Not found" back="/" />
      <main className="view">
        <p className="empty">
          That page is not here. <Link href="/">Back to the library</Link>.
        </p>
      </main>
    </>
  );
}
