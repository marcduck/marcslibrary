'use client';

import { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Monitor, Moon, Sun } from 'lucide-react';
import { SegmentGroup } from '@/components/ui';

const OPTIONS = [
  { value: 'light', label: <Sun size={16} /> },
  { value: 'system', label: <Monitor size={16} /> },
  { value: 'dark', label: <Moon size={16} /> },
];

export default function ThemeSwitch() {
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  return (
    <div className="theme-switch">
      <SegmentGroup.Root
        size="xs"
        value={mounted ? theme : null}
        onValueChange={(details) => setTheme(details.value ?? 'system')}
        aria-label="Theme"
      >
        <SegmentGroup.Indicator />
        <SegmentGroup.Items items={OPTIONS} />
      </SegmentGroup.Root>
    </div>
  );
}
