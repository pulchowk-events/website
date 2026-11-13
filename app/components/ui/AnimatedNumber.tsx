"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  value: number;
  suffix?: string;
  duration?: number;
  className?: string;
}

// Expo-out — starts fast, decelerates to a soft landing. Feels snappy
// and settles without overshoot. Matches landing-page vocabulary.
function easeOutExpo(t: number): number {
  return t >= 1 ? 1 : 1 - Math.pow(2, -10 * t);
}

export function AnimatedNumber({ value, suffix = "", duration = 1000, className }: Props) {
  const ref = useRef<HTMLSpanElement>(null);
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // reduced-motion users get the final value instantly
    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setDisplay(value);
      return;
    }

    if (typeof IntersectionObserver === "undefined") {
      setDisplay(value);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const t0 = performance.now();
        let raf = 0;
        const tick = (now: number) => {
          const t = Math.min((now - t0) / duration, 1);
          const v = Math.round(value * easeOutExpo(t));
          setDisplay(v);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        return () => cancelAnimationFrame(raf);
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value, duration]);

  return (
    <span ref={ref} className={className}>
      {display.toLocaleString("en-US")}
      {display >= value && suffix}
    </span>
  );
}
