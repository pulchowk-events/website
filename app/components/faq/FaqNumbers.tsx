'use client';

import { useEffect, useRef, useState } from 'react';

export interface FaqNumber {
  value: number;
  suffix?: string;
  label: string;
}

function Count({ value, suffix }: { value: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const [n, setN] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || started.current) return;
        started.current = true;
        io.disconnect();
        const t0 = performance.now();
        const tick = (now: number) => {
          const p = Math.min((now - t0) / 1400, 1);
          setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [value]);

  return (
    <span ref={ref}>
      {n.toLocaleString('en-US')}
      {n >= value ? suffix || '' : ''}
    </span>
  );
}

export function FaqNumbers({ numbers }: { numbers: FaqNumber[] }) {
  return (
    <dl className="faq-numbers">
      {numbers.map((n, i) => (
        <div
          key={n.label}
          className="faq-number"
          style={{ '--d': i * 80 + 'ms' } as React.CSSProperties}
        >
          <dd className="faq-number__value">
            <Count value={n.value} suffix={n.suffix} />
          </dd>
          <dt className="faq-number__label">{n.label}</dt>
        </div>
      ))}
    </dl>
  );
}
