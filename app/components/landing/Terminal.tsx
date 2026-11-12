'use client';
import { useEffect, useRef, useState } from 'react';

type Seg = { text: string; cls: string };

const SEGMENTS: Seg[] = [
  { text: '// sources/events/mynewsite.js\n', cls: 'k' },
  { text: "module.exports = {\n  name: 'mynewsite',\n  type: 'events',\n  scrape: (ctx) => runSource('mynewsite', 'events', ctx)\n};\n\n", cls: '' },
  { text: '// extractors/events/mynewsite.js\n', cls: 'k' },
  { text: 'async extract(page, { meta }) {\n  return { items, meta };\n}\n\n', cls: '' },
  { text: '$ node scripts/verify-source.js mynewsite\n', cls: 'k' },
  { text: 'verdict: ok · registry picked it up\n', cls: 'gr' },
];

const CUM_LEN: number[] = (() => {
  const out: number[] = [];
  let t = 0;
  for (const s of SEGMENTS) { t += s.text.length; out.push(t); }
  return out;
})();
const TOTAL = CUM_LEN[CUM_LEN.length - 1];

function renderTyped(progress: number) {
  return SEGMENTS.map((s, i) => {
    const start = i === 0 ? 0 : CUM_LEN[i - 1];
    if (progress <= start) return null;
    const visibleEnd = Math.min(progress, CUM_LEN[i]) - start;
    const visible = s.text.slice(0, visibleEnd);
    return <span key={i} className={s.cls}>{visible}</span>;
  });
}

export default function Terminal() {
  const preRef = useRef<HTMLPreElement>(null);
  const [progress, setProgress] = useState(0);
  const startedRef = useRef(false);

  useEffect(() => {
    const el = preRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setProgress(TOTAL);
      return;
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting || startedRef.current) return;
        startedRef.current = true;
        io.disconnect();
        let i = 0;
        const tick = () => {
          i++;
          setProgress(i);
          if (i < TOTAL) {
            let seg = 0;
            for (let j = 0; j < CUM_LEN.length; j++) {
              if (i <= CUM_LEN[j]) { seg = j; break; }
            }
            const delay = SEGMENTS[seg].cls === 'k' ? 8 : 18;
            setTimeout(tick, delay);
          }
        };
        setTimeout(tick, 0);
      },
      { threshold: 0.4 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <section className="sec" data-fx="ring" id="plugins">
      <div className="w sp2">
        <div>
          <h2>Sources are plugins.</h2>
          <p className="s">Add one while the bot runs. The registry finds it at boot.</p>
        </div>
        <div className="term">
          <div className="tb">
            <i /><i /><i />
            <span className="mo" style={{ marginLeft: 8 }}>src/scrapers</span>
          </div>
          <pre ref={preRef}>
            {renderTyped(progress)}
            {progress < TOTAL && <span className="caret" />}
          </pre>
        </div>
      </div>
    </section>
  );
}
