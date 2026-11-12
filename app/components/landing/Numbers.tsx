'use client';
import { useEffect, useRef, useState } from 'react';

const STATS: { target: number; suffix: string; label: string }[] = [
  { target: 11000, suffix: '+', label: 'students' },
  { target: 101, suffix: '+', label: 'Discord servers' },
  { target: 9, suffix: '', label: 'categories' },
  { target: 3, suffix: '', label: 'delivery targets' },
];

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const ref = useRef<HTMLElement>(null);
  const [value, setValue] = useState(0);
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
          const v = Math.round(target * (1 - Math.pow(1 - p, 3)));
          setValue(v);
          if (p < 1) requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target]);

  const display = value >= target ? `${value.toLocaleString('en-US')}${suffix}` : value.toLocaleString('en-US');

  return <strong ref={ref}>{display}</strong>;
}

export default function Numbers() {
  return (
    <section className="sec" data-fx="big">
      <div className="w">
        <h2>Reach, in numbers.</h2>
        <div className="nm">
          {STATS.map((s) => (
            <div key={s.label}>
              <Counter target={s.target} suffix={s.suffix} />
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
