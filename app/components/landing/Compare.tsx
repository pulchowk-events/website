'use client';
import { useState } from 'react';

const VETTED = [
  'Hackathon 2026',
  'Robotics workshop',
  'Internship opening',
  'Scholarship call',
];

const RAW: [string, boolean][] = [
  ['Hackathon 2026', false],
  ['hackathon 2026 (again)', true],
  ['WIN FREE PHONE click here', true],
  ['Robotics workshop', false],
  ['Robotics Workshop!!', true],
  ['Internship opening', false],
  ['Scholarship call (copy)', true],
  ['Scholarship call', false],
];

export default function Compare() {
  const [p, setP] = useState(50);

  return (
    <section className="sec" data-fx="bar2">
      <div className="w">
        <h2>Less noise. More signal.</h2>
        <div className="cmp" style={{ '--p': `${p}%` } as React.CSSProperties}>
          <div className="lay ok">
            <small>Vetted</small>
            {VETTED.map((t) => <div key={t}>{t}</div>)}
          </div>
          <div className="lay raw">
            <small>Raw</small>
            {RAW.map(([t, bad], i) => (
              <div key={i} className={bad ? 'x' : ''}>{t}</div>
            ))}
          </div>
          <div className="hd" />
          <input
            type="range"
            min="0"
            max="100"
            value={p}
            onChange={(e) => setP(parseInt(e.target.value, 10))}
            aria-label="Compare raw and vetted"
          />
        </div>
        <p className="mo" style={{ fontSize: 12, color: 'var(--m)', marginTop: 16 }}>
          Drag to compare
        </p>
      </div>
    </section>
  );
}
