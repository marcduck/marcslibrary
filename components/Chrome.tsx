'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { SegmentGroup } from '@/components/ui';
import { copy } from '@/lib/copy';

const TABS = [
  { href: '/', label: copy.nav.library },
  { href: '/scan', label: copy.nav.scan },
  { href: '/add', label: copy.nav.add },
];

export function TabBar() {
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

const THEME_OPTIONS = [
  { value: 'light', label: <Sun size={16} /> },
  { value: 'system', label: <Monitor size={16} /> },
  { value: 'dark', label: <Moon size={16} /> },
];

export function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="theme-switch">
      <SegmentGroup.Root
        size="xs"
        value={mounted ? theme : null}
        onValueChange={(details) => setTheme(details.value ?? 'system')}
        aria-label={copy.theme}
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={THEME_OPTIONS} />
      </SegmentGroup.Root>
    </div>
  );
}
