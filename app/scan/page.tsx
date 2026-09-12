import TopBar from '@/components/TopBar';
import ScanClient from '@/components/ScanClient';

export default function ScanPage() {
  return (
    <>
      <TopBar title="Scan" back="/" />
      <main className="view">
        <ScanClient />
      </main>
    </>
  );
}
