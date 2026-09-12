import Link from 'next/link';
import { IconButton } from '@/components/ui';

type Props = {
  title: string;
  back?: string;
  action?: { href: string; label: string; aria: string };
};

export default function TopBar({ title, back, action }: Props) {
  return (
    <header className="topbar">
      {back ? (
        <IconButton asChild variant="plain" aria-label="Back">
          <Link href={back}>&lsaquo;</Link>
        </IconButton>
      ) : <span />}
      <h1>{title}</h1>
      {action ? (
        <IconButton asChild variant="plain" aria-label={action.aria}>
          <Link href={action.href}>{action.label}</Link>
        </IconButton>
      ) : <span />}
    </header>
  );
}
