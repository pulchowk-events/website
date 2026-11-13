"use client";

import { useEffect, useState } from "react";

interface Props {
  src: string | null | undefined;
  name: string | null | undefined;
  size?: number;
  className?: string;
  alt?: string;
}

function colorFor(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  const palette = [
    "#3ecf8e", "#51aeff", "#f5a623", "#8b7cff", "#ff6b9d",
    "#a1a1a1", "#ff5c5c", "#7dd3fc", "#c084fc", "#fbbf24",
  ];
  return palette[h % palette.length];
}

export function Avatar({ src, name, size = 24, className = "", alt }: Props) {
  const [step, setStep] = useState<number>(src ? 0 : 1);
  const label = (name || "?").trim();
  const initial = (label.charAt(0) || "?").toUpperCase();
  const bg = colorFor(label || "?");

  useEffect(() => {
    setStep(src ? 0 : 1);
  }, [src]);

  const style = {
    width: size,
    height: size,
    borderRadius: "50%",
    flex: "none" as const,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
    background: step >= 2 ? bg : "var(--surface)",
    color: step >= 2 ? "#000" : undefined,
    fontFamily: "var(--font-geist-mono, ui-monospace, monospace)",
    fontSize: Math.round(size * 0.42),
    fontWeight: 600,
    lineHeight: 1,
    boxShadow: "inset 0 0 0 1px var(--border)",
  };

  if (step >= 2) {
    return (
      <span className={className} style={style} aria-label={label}>
        {initial}
      </span>
    );
  }

  const src2 = step === 0 ? (src as string) : "/default-avatar.png";

  return (
    <img
      src={src2}
      alt={alt ?? label}
      width={size}
      height={size}
      className={className}
      style={{ ...style, objectFit: "cover" }}
      referrerPolicy="no-referrer"
      loading="lazy"
      onError={() => setStep((s) => s + 1)}
    />
  );
}
