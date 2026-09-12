import TopBar from '@/components/TopBar';
import SettingsPanel from '@/components/SettingsPanel';
import { meta } from '@/lib/books';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const { name, counts, nextCode } = meta();
  return (
    <>
      <TopBar title="Settings" back="/" />
      <main className="view">
        <SettingsPanel name={name} counts={counts} nextCode={nextCode} />
      </main>
    </>
  );
}
