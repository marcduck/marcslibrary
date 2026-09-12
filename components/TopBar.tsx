import Link from 'next/link';

type Props = {
  title: string;
  back?: string;
  action?: { href: string; label: string; aria: string };
};

export default function TopBar({ title, back, action }: Props) {
  return (
    <header className="topbar">
      {back ? (
        <Link href={back} className="icon-btn" aria-label="Back">&lsaquo;</Link>
      ) : <span />}
      <h1>{title}</h1>
      {action ? (
        <Link href={action.href} className="icon-btn" aria-label={action.aria}>{action.label}</Link>
      ) : <span />}
    </header>
  );
}
