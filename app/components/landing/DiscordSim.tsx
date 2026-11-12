'use client';
import { useEffect, useState } from 'react';
import type { CSSProperties } from 'react';

const ICON = {
  mega: 'M3 10v4a1 1 0 001 1h2l5 4V5L6 9H4a1 1 0 00-1 1zm13.5 2A4.5 4.5 0 0014 8v8a4.5 4.5 0 002.5-4z',
  hash: 'M5.9 21l.9-4H3l.4-2h3.8l1-4.5H4.5l.4-2h3.8l.9-4h2l-.9 4h4.5l.9-4h2l-.9 4H20l-.4 2h-3.8l-1 4.5h3.7l-.4 2h-3.8l-.9 4h-2l.9-4H8l-.9 4zM9.6 15h4.5l1-4.5h-4.5z',
  chk: 'M5 3h14a2 2 0 012 2v14a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2zm2 9l3 3 6-6-1.4-1.4L10 12.2 8.4 10.6z',
  cal: 'M7 2v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2zM5 9h14v10H5z',
  list: 'M3 5h14v2H3zm0 6h14v2H3zm0 6h8v2H3zm15-2a3 3 0 110-6 3 3 0 010 6zm1.5 1l3 3-1.5 1.5-3-3z',
  ppl: 'M9 11a4 4 0 100-8 4 4 0 000 8zm8 0a3 3 0 100-6 3 3 0 000 6zM9 13c-3 0-7 1.5-7 4v3h14v-3c0-2.5-4-4-7-4zm8 0c-.5 0-1 0-1.5.1 1.5 1 2.5 2.2 2.5 3.9v3h4v-3c0-2-3-4-5-4z',
  bst: 'M12 2l8.5 5v10L12 22l-8.5-5V7zm0 5l-4 4h3v5h2v-5h3z',
  inv: 'M15 12a4 4 0 100-8 4 4 0 000 8zm-9 1V10H4v3H1v2h3v3h2v-3h3v-2zm9 1c-3 0-8 1.5-8 4v2h16v-2c0-2.5-5-4-8-4z',
  gear: 'M19.4 13a7.5 7.5 0 000-2l2.1-1.6-2-3.5-2.5 1a7.3 7.3 0 00-1.7-1L15 3.2h-4l-.4 2.7a7.3 7.3 0 00-1.7 1l-2.5-1-2 3.5L6.6 11a7.5 7.5 0 000 2l-2.1 1.6 2 3.5 2.5-1c.5.4 1.1.7 1.7 1l.4 2.7h4l.4-2.7c.6-.3 1.2-.6 1.7-1l2.5 1 2-3.5zM12 15.5a3.5 3.5 0 110-7 3.5 3.5 0 010 7z',
  menu: 'M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z',
  search: 'M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  chev: 'M7.41 8.59 12 13.17l4.59-4.58L18 10l-6 6-6-6z',
  lock: 'M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z',
} as const;
type IconKey = keyof typeof ICON;

const Icon = ({ k, size = 18 }: { k: IconKey; size?: number }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} fill="currentColor" aria-hidden="true">
    <path d={ICON[k]} />
  </svg>
);

const TOP: [string, IconKey][] = [
  ['Events', 'cal'],
  ['Channels & Roles', 'list'],
  ['Members', 'ppl'],
  ['Server Boosts', 'bst'],
];

const CATS: { name: string; rows: [string, IconKey][] }[] = [
  { name: 'Server Information', rows: [['general', 'chk'], ['regulations', 'mega'], ['announcements', 'mega'], ['connections', 'mega']] },
  { name: 'Setup', rows: [['notifications', 'hash']] },
  {
    name: 'Events',
    rows: [
      ['sports', 'mega'], ['software', 'mega'], ['hardware', 'mega'], ['gaming', 'mega'],
      ['music', 'mega'], ['business', 'mega'], ['scholarships', 'mega'], ['jobs-internships', 'mega'],
    ],
  },
];

const LABELS = ['Time', 'Location', 'Price', 'Category', 'Mode'];

interface Ev { title: string; desc: string; org: string; color: string; details: string[]; tags: string }
const DE: Record<string, Ev> = {
  sports: { title: 'Inter-College Futsal Cup 2026: Group Stage', desc: 'Eight teams, one weekend. Cheer on your college or bring a squad of your own.', org: 'Example Sports Club', color: '#3ecf8e', details: ['2026-12-12', 'Example Ground, Lalitpur', 'Rs. 200 per team', 'tournaments', 'in-person'], tags: 'futsal, teams, campus' },
  software: { title: 'Campus Code Sprint: Open Workshop #1', desc: 'Get ready for a hands-on online workshop hosted by the Example Tech Club. Build something small, learn modern tools and meet other builders.', org: 'Example Tech Club', color: '#f5a623', details: ['2026-12-05', 'Online Access', 'Free', 'workshops', 'online'], tags: 'web, community, beginners' },
  hardware: { title: 'Robotics Build Night', desc: 'Bring a half-finished project or start a new one. Mentors and spare parts will be around.', org: 'Example Robotics Lab', color: '#4cc9f0', details: ['2026-12-08', 'Example Lab, Block C', 'Free', 'meetups', 'in-person'], tags: 'arduino, robotics, iot' },
  gaming: { title: 'Campus Game Jam 2026', desc: 'Forty-eight hours to make a tiny game around a surprise theme. Solo or in a team.', org: 'Example Game Dev Club', color: '#8b7cff', details: ['2026-12-19', 'Online Access', 'Free', 'game jams', 'online'], tags: 'game-dev, indie, design' },
  music: { title: 'Open Mic Evening', desc: 'Acoustic sets, spoken word and good company. Sign up for a slot or just come to listen.', org: 'Example Music Society', color: '#ff6b9d', details: ['2026-12-11', 'Example Cafe, Patan', 'Rs. 300', 'concerts', 'in-person'], tags: 'live, acoustic, community' },
  business: { title: 'Startup Pitch Night', desc: 'Five student teams pitch to a small panel. Questions from the audience are welcome.', org: 'Example Startup Hub', color: '#3ecf8e', details: ['2026-12-15', 'Example Hub, Kathmandu', 'Free', 'pitch events', 'hybrid'], tags: 'startups, founders, networking' },
  scholarships: { title: 'Example Merit Scholarship 2027', desc: 'A fully funded call for students with strong results. Read the eligibility notes before applying.', org: 'Example Foundation', color: '#8b7cff', details: ['2027-01-10 (deadline)', 'Apply online', 'Fully funded', 'scholarships', 'online'], tags: 'masters, funding, abroad' },
  'jobs-internships': { title: 'Junior Frontend Intern', desc: 'Join a small product team and ship real features. Basic React knowledge helps.', org: 'Example Studio', color: '#f5a623', details: ['2026-12-20 (apply by)', 'Kathmandu', 'Paid', 'internships', 'hybrid'], tags: 'react, frontend, internship' },
};

function MessageBody({ channel }: { channel: string }) {
  const d = DE[channel];
  if (!d) return <p>This is a sample view. Pick one of the event channels to see how a post looks.</p>;
  const i = d.title.indexOf(':');
  const big = i > 0 ? d.title.slice(0, i).trim() : d.title;
  const sub = i > 0 ? d.title.slice(i + 1).trim() : d.org;
  return (
    <>
      <h6>{d.title}</h6>
      <p>{d.desc}</p>
      <div className="dd"><b>Event Details</b></div>
      <p>
        {LABELS.map((label, n) => (
          <span key={label}>
            <b>{label}:</b> {d.details[n]}
            {n < LABELS.length - 1 && <br />}
          </span>
        ))}
      </p>
      <p><b>Register Here:</b> <span className="lnk">Click here</span></p>
      <p><b>Tags:</b> {d.tags}</p>
      <div className="pst" style={{ '--c': d.color } as CSSProperties}>
        <div className="bk">{big}<span>{sub}</span></div>
        <div className="sh"><u /><u /></div>
      </div>
    </>
  );
}

export default function DiscordSim() {
  const [active, setActive] = useState('software');
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  const pick = (key: string) => { setActive(key); setOpen(false); };
  const headerIcon: IconKey = DE[active] ? 'mega' : 'hash';

  return (
    <section className="sec" data-fx="ring">
      <div className="w">
        <h2>Right where students already hang out.</h2>
        <p className="s">New posts land in Discord the moment they&apos;re approved.</p>
        <div className="dc" data-open={open ? '1' : '0'}>
          <aside className="dsb" id="dc-drawer" aria-label="Channels">
            <div className="dsh">
              <img className="sv" src="https://avatars.githubusercontent.com/u/208609754?s=200&v=4" alt="" width={22} height={22} />Pulchowk Events
              <span className="ia"><Icon k="chev" /></span>
            </div>
            <div className="dsc">
              <div className="dtp">
                {TOP.map(([label, ic]) => (
                  <button key={label} type="button" className="dr2"><Icon k={ic} /><span className="cn">{label}</span></button>
                ))}
              </div>
              {CATS.map((c) => (
                <div key={c.name} className="dcg">
                  <div className="dcat">
                    <span className="dcn"><Icon k="chev" size={12} />{c.name}</span>
                    <span className="dcp">+</span>
                  </div>
                  {c.rows.map(([key, ic]) => (
                    <button
                      key={key}
                      type="button"
                      className={`dr2${active === key ? ' on' : ''}`}
                      aria-current={active === key ? 'page' : undefined}
                      onClick={() => pick(key)}
                    >
                      <Icon k={ic} />
                      <span className="cn">{key}</span>
                      <span className="ac"><Icon k="inv" /><Icon k="gear" /></span>
                    </button>
                  ))}
                </div>
              ))}
            </div>
          </aside>

          <div className="dscrim" onClick={() => setOpen(false)} aria-hidden="true" />

          <div className="dmsg">
            <div className="dhd">
              <button
                type="button"
                className="dmb"
                aria-label="Open channels"
                aria-expanded={open}
                aria-controls="dc-drawer"
                onClick={() => setOpen(true)}
              >
                <Icon k="menu" size={22} />
              </button>
              <Icon k={headerIcon} />
              <span>{active}</span>
              <span className="dhr"><Icon k="search" /><Icon k="ppl" /></span>
            </div>
            <div className="dfd">
              <div className="dm">
                <img className="dav" src="https://avatars.githubusercontent.com/u/208609754?s=200&v=4" alt="Pulchowk Events" width={40} height={40} />
                <div className="dbd">
                  <div className="dn">
                    <b>Pulchowk Events</b><i>APP</i><em>11/12/2026 10:43 AM</em>
                  </div>
                  <MessageBody channel={active} />
                </div>
              </div>
            </div>
            <div className="dinp">
              <Icon k="lock" />You do not have permission to send messages in this channel.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
