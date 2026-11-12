'use client';
import { useEffect, useRef } from 'react';

export default function Rail() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.classList.add('go');
          io.disconnect();
        }
      },
      { threshold: 0.5 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="sec" data-fx="ring">
      <div className="w">
        <h2>Three steps. No effort.</h2>
        <div className="rail-steps" ref={ref}>
          <div className="stp" style={{ '--c': 'var(--a)' } as React.CSSProperties}>
            <span className="ic">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round">
                <circle cx="11" cy="11" r="6" />
                <path d="m20 20-4.5-4.5" />
              </svg>
            </span>
            <h3>We find it</h3>
            <p>We read the places students already post.</p>
          </div>
          <div className="stp" style={{ '--c': 'var(--g)' } as React.CSSProperties}>
            <span className="ic">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z" />
                <path d="m9 12 2 2 4-4" />
              </svg>
            </span>
            <h3>We check it</h3>
            <p>Copies and junk are removed. A person approves.</p>
          </div>
          <div className="stp" style={{ '--c': 'var(--v)' } as React.CSSProperties}>
            <span className="ic">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21 3-9 18-2-8-8-2z" />
              </svg>
            </span>
            <h3>You see it</h3>
            <p>On Discord and on the website, within seconds.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
