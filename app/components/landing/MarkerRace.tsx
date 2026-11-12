'use client';
import { useRef, useState } from 'react';
import Btn from './Btn';

interface Step { text: string; cls: string; }

const A_STEPS: [number, Step][] = [
  [0, { text: 'reserve(wx)', cls: '' }],
  [450, { text: 'reserved', cls: 'ok' }],
  [900, { text: 'send', cls: '' }],
  [1500, { text: 'confirm', cls: 'ok' }],
  [1900, { text: 'posted', cls: 'ok' }],
];
const B_STEPS: [number, Step][] = [
  [0, { text: 'reserve(wx)', cls: '' }],
  [450, { text: 'EEXIST', cls: 'no' }],
  [900, { text: 'skipped', cls: 'no' }],
];

export default function MarkerRace() {
  const [laneA, setLaneA] = useState<Step[]>([]);
  const [laneB, setLaneB] = useState<Step[]>([]);
  const [marker, setMarker] = useState('marker: none');
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  const fire = () => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
    setLaneA([]);
    setLaneB([]);
    setMarker('marker: none');

    A_STEPS.forEach(([t, s]) => {
      timers.current.push(setTimeout(() => setLaneA((p) => [...p, s]), t));
    });
    B_STEPS.forEach(([t, s]) => {
      timers.current.push(setTimeout(() => setLaneB((p) => [...p, s]), t));
    });
    timers.current.push(setTimeout(() => setMarker('marker: reserved'), 450));
    timers.current.push(setTimeout(() => setMarker('marker: confirmed'), 1500));
  };

  return (
    <section className="sec" data-fx="bar2">
      <div className="w">
        <h2>One slot. One winner.</h2>
        <div className="rc">
          <div>
            <h3>post A</h3>
            <div>{laneA.map((s, i) => <div key={i} className={`st ${s.cls}`}>{s.text}</div>)}</div>
          </div>
          <div>
            <h3>post B</h3>
            <div>{laneB.map((s, i) => <div key={i} className={`st ${s.cls}`}>{s.text}</div>)}</div>
          </div>
        </div>
        <div style={{ marginTop: 24, display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
          <Btn onClick={fire}>Fire two posts</Btn>
          <span className="mo" style={{ fontSize: 13, color: 'var(--m)' }}>{marker}</span>
        </div>
        <div className="gates">
          <span>category paused?</span>
          <span>has image?</span>
          <span>has warnings?</span>
          <span>already posted?</span>
        </div>
      </div>
    </section>
  );
}
