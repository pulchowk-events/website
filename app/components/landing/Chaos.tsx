'use client';
import { useEffect, useState } from 'react';
import Btn from './Btn';

const CH: [string, string][] = [
  ['Discord chat', '#5865f2'],
  ['Facebook group', '#4c8bf5'],
  ['Notice board', '#f5a623'],
  ['Event page', '#3ecf8e'],
  ['Job site', '#f5a623'],
  ['Email chain', '#a1a1a1'],
  ['Poster photo', '#ff6b9d'],
  ['Group chat', '#5865f2'],
  ['Scholarship site', '#8b7cff'],
];

interface Chip {
  label: string;
  color: string;
  sx: string;
  sy: string;
  sr: string;
  tx: string;
  ty: string;
}

export default function Chaos() {
  const [chips, setChips] = useState<Chip[]>([]);
  const [tidied, setTidied] = useState(false);

  useEffect(() => {
    const rn = (n: number) => Math.random() * n;
    setChips(
      CH.map(([label, color], i) => ({
        label,
        color,
        sx: `${rn(54).toFixed(0)}%`,
        sy: `${rn(300).toFixed(0)}px`,
        sr: `${(rn(24) - 12).toFixed(0)}deg`,
        tx: i % 2 ? '54%' : '0%',
        ty: `${Math.floor(i / 2) * 58}px`,
      }))
    );
  }, []);

  return (
    <section className="sec" data-fx="big">
      <div className="w sp2">
        <div>
          <h2>Campus news lives everywhere.</h2>
          <p className="s">Chats, groups, notice boards. Most of it reaches you too late.</p>
          <div style={{ marginTop: 28 }}>
            <Btn onClick={() => setTidied((v) => !v)}>
              {tidied ? 'Make it messy' : 'Sort it out'}
            </Btn>
          </div>
        </div>
        <div className={`chaos${tidied ? ' t' : ''}`}>
          {chips.map((c, i) => (
            <div
              key={i}
              className="chip"
              style={{
                '--c': c.color,
                '--sx': c.sx,
                '--sy': c.sy,
                '--sr': c.sr,
                '--tx': c.tx,
                '--ty': c.ty,
              } as React.CSSProperties}
            >
              <i />
              <span>{c.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
