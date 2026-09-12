'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TABS = [
  { href: '/', label: 'Library' },
  { href: '/scan', label: 'Scan' },
  { href: '/add', label: 'Add' },
];

export default function TabBar() {
  const pathname = usePathname();
  return (
    <nav className="tabbar">
      {TABS.map((tab) => (
        <Link
          key={tab.href}
          href={tab.href}
          className={[
            pathname === tab.href ? 'is-active' : '',
            tab.href === '/scan' ? 'tab-scan' : '',
          ].filter(Boolean).join(' ')}
        >
          {tab.label}
        </Link>
      ))}
    </nav>
  );
}
