'use client';
import { useState } from 'react';

type Persona = {
  headline: string;
  rows: [string, string][];
};

const P: Record<string, Persona> = {
  Students: {
    headline: 'Today near you',
    rows: [
      ['Hackathon this Saturday', '#3ecf8e'],
      ['Paid internship opens', '#f5a623'],
      ['Scholarship deadline soon', '#8b7cff'],
    ],
  },
  Clubs: {
    headline: 'Reach everyone',
    rows: [
      ['Share your event', '#3ecf8e'],
      ['Seen by thousands of students', '#4cc9f0'],
      ['Free to post', '#3ecf8e'],
    ],
  },
  Employers: {
    headline: 'Hire local talent',
    rows: [
      ['List an open role', '#f5a623'],
      ['Reach student engineers', '#4cc9f0'],
      ['Shown on Discord and web', '#5865f2'],
    ],
  },
};

export default function Personas() {
  const [active, setActive] = useState<keyof typeof P>('Students');
  const p = P[active];

  return (
    <section className="sec" data-fx="sq">
      <div className="w sp2">
        <div>
          <h2>Made for you.</h2>
          <div className="tabs">
            {(Object.keys(P) as (keyof typeof P)[]).map((k) => (
              <button key={k} className={active === k ? 'on' : ''} onClick={() => setActive(k)}>
                {k}
              </button>
            ))}
          </div>
        </div>
        <div className="ph">
          <h4>{p.headline}</h4>
          {p.rows.map(([label, color], i) => (
            <div
              key={label}
              className="pr"
              style={{ '--c': color, animationDelay: `${i * 0.1}s` } as React.CSSProperties}
            >
              <i />{label}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
