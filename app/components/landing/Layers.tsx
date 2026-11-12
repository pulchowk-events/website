'use client';
import { useState } from 'react';

const LAYERS: [string, string, string][] = [
  ['config', 'env · constants · roles', 'static only'],
  ['core', 'audit · markers · cache · normalize', 'pure, no bot'],
  ['scrapers', 'registry · extractors · diagnostics', 'only puppeteer'],
  ['posting', 'dedup · gates · post · autopost', 'only cache writer'],
  ['discord · web', 'commands · handlers · api', 'thin transports'],
  ['integrations', 'supabase · websiteSync', 'async, fails loud'],
];

export default function Layers() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="sec" data-fx="sq" id="layers">
      <div className="w sp2">
        <div>
          <h2>Imports only flow down.</h2>
          <p className="s">Every layer owns one job. Hover to see the rule.</p>
        </div>
        <div className="lys">
          {LAYERS.map(([name, chips, rule]) => (
            <div
              key={name}
              className={`ly${active === name ? ' act' : ''}`}
              onClick={() => setActive((a) => (a === name ? null : name))}
            >
              <b>{name}</b>
              <div className="ch">
                {chips.split(' · ').map((c) => <i key={c}>{c}</i>)}
              </div>
              <em className="mo">{rule}</em>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
