'use client';
import { useEffect, useRef, useState } from 'react';

type Node = {
  x: number; y: number; w: number; h: number;
  label: string; sub: string; desc: string;
};

const NODES: Record<string, Node> = {
  src: { x: 10, y: 130, w: 130, h: 200, label: 'Sources', sub: '', desc: 'Each source is a plugin. Two files, found at boot.' },
  scr: { x: 190, y: 202, w: 120, h: 56, label: 'Scrape', sub: 'puppeteer', desc: 'Runs in parallel on a cron. Reports how the run went.' },
  san: { x: 340, y: 202, w: 120, h: 56, label: 'Sanitize', sub: 'flag fields', desc: 'Catches mislabeled fields and flags them for review.' },
  ded: { x: 490, y: 202, w: 120, h: 56, label: 'Dedup', sub: 'key + fuzzy', desc: 'Exact key plus Levenshtein within the same date.' },
  rev: { x: 640, y: 202, w: 120, h: 56, label: 'Review', sub: '/pending', desc: 'A human posts, customizes or skips. Every choice is audited.' },
  pst: { x: 790, y: 202, w: 120, h: 56, label: 'Post', sub: '4 gates', desc: 'One choke point. Gates, marker, send, confirm.' },
  dc: { x: 960, y: 70, w: 120, h: 56, label: 'Discord', sub: 'students', desc: 'Live and test channels. Pings only in the live window.' },
  ws: { x: 960, y: 202, w: 120, h: 56, label: 'Web DB', sub: 'supabase', desc: 'Upserts on a deterministic ID, then a cache webhook.' },
  bs: { x: 960, y: 334, w: 120, h: 56, label: 'Bot DB', sub: 'archive', desc: 'Full records kept for forensics.' },
  site: { x: 1110, y: 202, w: 120, h: 56, label: 'Site', sub: 'ISR', desc: 'Reads vetted rows only. Detail pages ship JSON-LD.' },
};

const EDGES: [string, string][] = [
  ['src', 'scr'], ['scr', 'san'], ['san', 'ded'], ['ded', 'rev'],
  ['rev', 'pst'], ['pst', 'dc'], ['pst', 'ws'], ['pst', 'bs'], ['ws', 'site'],
];

const AUDIT_ROW = ['scr', 'san', 'ded', 'rev', 'pst'];
const SOURCES = ['Khalti', 'KataJaam', 'NepVents', 'Kgarira'];

const MOBILE_STEPS = [
  { ...NODES.src },
  { ...NODES.scr },
  { ...NODES.san },
  { ...NODES.ded },
  { ...NODES.rev },
  { ...NODES.pst },
];
const MOBILE_FAN = [NODES.dc, NODES.ws, NODES.bs];

export default function Pipeline() {
  const [active, setActive] = useState<string | null>(null);
  const [mobileIdx, setMobileIdx] = useState(0);
  const plsRef = useRef<HTMLDivElement>(null);
  const [plsIn, setPlsIn] = useState(false);

  useEffect(() => {
    const el = plsRef.current;
    if (!el) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setPlsIn(true);
      return;
    }
    let timer: ReturnType<typeof setInterval> | null = null;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setPlsIn(true);
          timer = setInterval(() => setMobileIdx((i) => (i + 1) % 7), 2300);
        } else if (timer) {
          clearInterval(timer);
          timer = null;
        }
      },
      { threshold: 0.25 }
    );
    io.observe(el);
    return () => { io.disconnect(); if (timer) clearInterval(timer); };
  }, []);

  const caption = active ? NODES[active] : null;

  const renderMobileStep = (n: Node, i: number, stepKey: string) => {
    const isOn = mobileIdx === i;
    const isDone = mobileIdx > i;
    return (
      <div
        key={stepKey}
        className={`s2${isOn ? ' on' : ''}${isDone ? ' done' : ''}`}
        style={{ '--i': i } as React.CSSProperties}
        onClick={() => setMobileIdx(i)}
      >
        <b>{n.label}</b>
        {n.sub && <small>{n.sub}</small>}
        <p>{n.desc}</p>
        {stepKey === 'fan' && (
          <div className="fan">
            {MOBILE_FAN.map((f) => (
              <div key={f.label}>
                <b>{f.label}</b>
                {f.sub && <small>{f.sub}</small>}
                <p>{f.desc}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <section className="sec" data-fx="cross" id="pipeline">
      <div className="w">
        <h2>Scrape to site, in seconds.</h2>
        <div className="dg">
          <svg viewBox="0 0 1240 470" role="img" aria-label="Pipeline architecture">
            {/* Edges */}
            {EDGES.map(([a, b], i) => {
              const na = NODES[a], nb = NODES[b];
              const x1 = na.x + na.w, y1 = na.y + na.h / 2;
              const x2 = nb.x, y2 = nb.y + nb.h / 2;
              const d = `M${x1} ${y1} C${x1 + 40} ${y1} ${x2 - 40} ${y2} ${x2} ${y2}`;
              return (
                <g key={i}>
                  <path id={`e${i}`} className="ed" d={d} />
                  <circle r="3" className="pk">
                    <animateMotion dur="2.2s" begin={`${i * 0.28}s`} repeatCount="indefinite">
                      <mpath href={`#e${i}`} />
                    </animateMotion>
                  </circle>
                </g>
              );
            })}

            {/* Audit dashed lines */}
            {AUDIT_ROW.map((k) => {
              const n = NODES[k];
              return (
                <path key={k} className="ed d" d={`M${n.x + 60} ${n.y + n.h} V418`} />
              );
            })}
            <rect x="190" y="418" width="720" height="32" rx="8" fill="none" stroke="rgba(255,255,255,.22)" strokeDasharray="4 5" />
            <text x="550" y="439" fill="#8a8a8a" fontFamily="var(--font-geist-mono),monospace" fontSize="12" textAnchor="middle">
              audit-log.jsonl
            </text>

            {/* Nodes */}
            {Object.entries(NODES).map(([k, n]) => {
              const isOn = active === k;
              const yLabel = k === 'src' ? n.y + 28 : n.y + (n.sub ? 26 : 34);
              return (
                <g
                  key={k}
                  className={`nd${isOn ? ' on' : ''}`}
                  tabIndex={0}
                  onMouseEnter={() => setActive(k)}
                  onFocus={() => setActive(k)}
                  onClick={() => setActive(k)}
                  style={{ cursor: 'pointer' }}
                >
                  <rect x={n.x} y={n.y} width={n.w} height={n.h} rx="9" />
                  <text x={n.x + n.w / 2} y={yLabel}>{n.label}</text>
                  {n.sub && <text className="sb" x={n.x + n.w / 2} y={n.y + 43}>{n.sub}</text>}
                </g>
              );
            })}

            {/* Source labels inside src node */}
            {SOURCES.map((s, i) => (
              <text key={s} className="sb" x="75" y={190 + i * 26} textAnchor="middle">{s}</text>
            ))}
            <text className="sb" x="75" y="304" textAnchor="middle" fill="#3ecf8e">+ plugin</text>
          </svg>
          <div className="cp">
            {caption ? (
              <><b>{caption.label}</b> — {caption.desc}</>
            ) : (
              'Hover or tap a node.'
            )}
          </div>
        </div>

        {/* Mobile accordion */}
        <div className={`pls${plsIn ? ' in' : ''}`} ref={plsRef}>
          {renderMobileStep(MOBILE_STEPS[0], 0, 'src')}
          {renderMobileStep(MOBILE_STEPS[1], 1, 'scr')}
          {renderMobileStep(MOBILE_STEPS[2], 2, 'san')}
          {renderMobileStep(MOBILE_STEPS[3], 3, 'ded')}
          {renderMobileStep(MOBILE_STEPS[4], 4, 'rev')}
          {renderMobileStep(MOBILE_STEPS[5], 5, 'pst')}
          <div
            className={`s2${mobileIdx === 6 ? ' on' : ''}`}
            style={{ '--i': 6 } as React.CSSProperties}
            onClick={() => setMobileIdx(6)}
          >
            <b>Fans out to</b>
            <div className="fan">
              {MOBILE_FAN.map((f) => (
                <div key={f.label}>
                  <b>{f.label}</b>
                  {f.sub && <small>{f.sub}</small>}
                  <p>{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
          <div
            className={`s2${mobileIdx === 7 ? ' on' : ''}`}
            style={{ '--i': 7 } as React.CSSProperties}
            onClick={() => setMobileIdx(7)}
          >
            <b>{NODES.site.label}</b>
            {NODES.site.sub && <small>{NODES.site.sub}</small>}
            <p>{NODES.site.desc}</p>
          </div>
          <p className="hint">Tap a step to pause on it</p>
        </div>
      </div>
    </section>
  );
}
