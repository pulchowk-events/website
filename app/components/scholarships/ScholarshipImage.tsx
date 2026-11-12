"use client";

import { useState } from "react";

interface Props {
  src: string | null;
  alt: string;
  initial: string;
}

export function ScholarshipImage({ src, alt, initial }: Props) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <span className="sch-row__fallback" aria-hidden="true">{initial}</span>;
  }
  return (
    <img
      src={src}
      alt={alt}
      onError={() => setFailed(true)}
      loading="lazy"
      referrerPolicy="no-referrer"
    />
  );
}
