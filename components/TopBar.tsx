import Link from 'next/link';
import { IconButton } from '@/components/ui';

type Props = {
  title: string;
  back?: string;
};

export default function TopBar({ title, back }: Props) {
  return (
    <header className="topbar">
      {back ? (
        <IconButton asChild variant="plain" aria-label="Back">
          <Link href={back}>&lsaquo;</Link>
        </IconButton>
      ) : <span />}
      <h1>{title}</h1>
      <span />
    </header>
  );
}
