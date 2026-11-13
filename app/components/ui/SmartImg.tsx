"use client";

import { useEffect, useState, type ReactNode } from "react";

const GIFS = [
  "/default_gif_1.gif",
  "/default_gif_2.gif",
  "/default_gif_3.gif",
  "/default_gif_4.gif",
  "/default_gif_5.gif",
];

function pickGif(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return GIFS[h % GIFS.length];
}

interface Props {
  src: string | null | undefined;
  alt?: string;
  seed: string;
  fallback: ReactNode;
  className?: string;
}

export function SmartImg({ src, alt = "", seed, fallback, className = "" }: Props) {
  const [step, setStep] = useState<number>(src ? 0 : 1);

  useEffect(() => {
    setStep(src ? 0 : 1);
  }, [src]);

  if (step >= 2) return <>{fallback}</>;

  const current = step === 0 ? (src as string) : pickGif(seed);

  return (
    <img
      src={current}
      alt={alt}
      className={className}
      loading="lazy"
      referrerPolicy="no-referrer"
      onError={() => setStep((s) => s + 1)}
    />
  );
}
