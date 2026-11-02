'use client';

import { useState } from 'react';

// Add more entries here if you create more GIFs.
// Files should live at: public/default_gif_1.gif, public/default_gif_2.gif, ...
const GIFS = [
  '/default_gif_1.gif',
  '/default_gif_2.gif',
  '/default_gif_3.gif',
  '/default_gif_4.gif',
  '/default_gif_5.gif'
];

// Deterministic hash — same job id always yields the same GIF, so a job
// looks consistent across page loads while different jobs get variety.
// Uses jobId (or alt text as fallback) as the seed.
function pickGif(seed: string | undefined): string {
  if (!seed) return GIFS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return GIFS[hash % GIFS.length];
}

interface JobImageProps {
  src: string | null;
  alt: string;
  jobId?: string;
  className?: string;
}

export default function JobImage({ src, alt, jobId, className = '' }: JobImageProps) {
  const [failed, setFailed] = useState(false);
  const fallback = pickGif(jobId || alt);
  const finalSrc = !src || failed ? fallback : src;

  return (
    <img
      src={finalSrc}
      alt={alt}
      className={`w-full h-full object-cover ${className}`}
      onError={() => setFailed(true)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}