'use client';
import { useState } from 'react';

const F: [string, string, string][] = [
  ['Event', 'Inter-college hackathon', 'Pulchowk · Sat'],
  ['Job', 'Software intern', 'Kathmandu'],
  ['Scholarship', "Erasmus Mundus master's", 'Europe'],
  ['Event', 'Live music night', 'Lalitpur'],
  ['Job', 'Junior web developer', 'Remote'],
  ['Scholarship', 'Merit scholarship call', 'Nepal'],
  ['Event', 'Robotics workshop', 'Pulchowk · Sun'],
];

const FC: Record<string, string> = {
  Event: '#3ecf8e',
  Job: '#f5a623',
  Scholarship: '#8b7cff',
};

const LABEL: Record<string, string> = {
  Event: 'Event',
  Job: 'Job',
  Scholarship: 'Grant',
};

const TABS = ['All', 'Event', 'Job', 'Scholarship'];

export default function Feed() {
  const [active, setActive] = useState('All');

  return (
    <section className="sec" data-fx="cross">
      <div className="w">
        <h2>Find what fits.</h2>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={active === t ? 'on' : ''} onClick={() => setActive(t)}>
              {t}
            </button>
          ))}
        </div>
        <div className="fl">
          {F.map(([type, title, meta]) => (
            <div
              key={title}
              className={`fi${active !== 'All' && active !== type ? ' h' : ''}`}
              style={{ '--c': FC[type] } as React.CSSProperties}
            >
              <em>{LABEL[type] ?? type}</em>
              <b>{title}</b>
              <span>{meta}</span>
            </div>
          ))}
        </div>
        <p className="mo" style={{ fontSize: 12, color: 'var(--m)', marginTop: 16 }}>Sample items</p>
      </div>
    </section>
  );
}
