import TopBar from '@/components/TopBar';
import ScanClient from '@/components/ScanClient';
import { copy } from '@/lib/copy';

export default function ScanPage() {
  return (
    <>
      <TopBar title={copy.titles.scan} back="/" />
      <main className="view">
        <ScanClient />
      </main>
    </>
  );
}
