'use client';
import { useState } from 'react';

type Verdict = 'ok' | 'dom_drift_listing' | 'dom_drift_detail' | 'blocked';

const DATA: Record<Verdict, { listingHits: number; detailPages: number; parseFailures: number; looksBlocked: boolean; why: string }> = {
  ok: { listingHits: 14, detailPages: 14, parseFailures: 0, looksBlocked: false, why: 'Nothing to fix.' },
  dom_drift_listing: { listingHits: 0, detailPages: 0, parseFailures: 0, looksBlocked: false, why: 'Fix the listing selector.' },
  dom_drift_detail: { listingHits: 14, detailPages: 14, parseFailures: 14, looksBlocked: false, why: 'Fix the title selector.' },
  blocked: { listingHits: 0, detailPages: 1, parseFailures: 0, looksBlocked: true, why: 'Warm browser profile needed.' },
};

const TABS: Verdict[] = ['ok', 'dom_drift_listing', 'dom_drift_detail', 'blocked'];

export default function Drift() {
  const [active, setActive] = useState<Verdict>('ok');
  const d = DATA[active];

  return (
    <section className="sec" data-fx="cross">
      <div className="w">
        <h2>Silent zeros, diagnosed.</h2>
        <div className="tabs">
          {TABS.map((t) => (
            <button key={t} className={active === t ? 'on' : ''} onClick={() => setActive(t)}>{t}</button>
          ))}
        </div>
        <div className="dr">
          <div><small>listingHits</small><strong>{d.listingHits}</strong></div>
          <div><small>detailPages</small><strong>{d.detailPages}</strong></div>
          <div><small>parseFailures</small><strong>{d.parseFailures}</strong></div>
          <div><small>looksBlocked</small><strong>{d.looksBlocked ? 'true' : 'false'}</strong></div>
        </div>
        <div id="vd" className={active === 'ok' ? 'ok' : ''}>
          <b>{active}</b>
          <span style={{ color: 'var(--m)' }}>{d.why}</span>
        </div>
      </div>
    </section>
  );
}
