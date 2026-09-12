'use client';

import { useState } from 'react';

type Props = {
  title: string;
  coverUrl?: string | null;
  size?: 'sm' | 'md' | 'lg';
};

// Covers are hosted by the catalogues, so any of them can be missing or fail to
// load. Every one falls back to the book's initial rather than a broken image.
export default function Cover({ title, coverUrl, size = 'sm' }: Props) {
  const [failed, setFailed] = useState(false);
  const initial = (title || '?').trim().slice(0, 1).toUpperCase();

  if (!coverUrl || failed) {
    return <div className={`cover cover-${size} cover-blank`} aria-hidden="true">{initial}</div>;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      className={`cover cover-${size}`}
      src={coverUrl}
      alt=""
      loading="lazy"
      onError={() => setFailed(true)}
    />
  );
}
