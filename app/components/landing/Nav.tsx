'use client';
import { useEffect, useState } from 'react';
import Btn from './Btn';

interface NavProps { onSignIn: () => void; }

export default function Nav({ onSignIn }: NavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') setOpen(false); };
    const onResize = () => { if (window.innerWidth > 900) setOpen(false); };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => { window.removeEventListener('keydown', onKey); window.removeEventListener('resize', onResize); };
  }, []);

  const links = [
    { href: '#site', label: 'Site' },
    { href: '#plugins', label: 'Plugins' },
    { href: '#pipeline', label: 'Pipeline' },
    { href: '#layers', label: 'Layers' },
    { href: '#oss', label: 'Open source' },
  ];

  return (
    <nav className={`top${scrolled ? ' sc' : ''}${open ? ' open' : ''}`}>
      <div className="w">
        <a className="logo" href="#top">Pulchowk Events</a>
        <div className="lk">
          {links.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
        </div>
        <div className="r">
          <Btn onClick={onSignIn}>Sign In</Btn>
          <Btn glass href="/">Visit Site</Btn>
          <Btn glass href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener">Join Discord</Btn>
          <button className="mb" aria-label="Menu" aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            <span /><span />
          </button>
        </div>
      </div>
      <div className={`mm${open ? ' on' : ''}`}>
        {links.map((l) => (
          <a key={l.href} href={l.href} onClick={() => setOpen(false)}>{l.label}</a>
        ))}
        <div className="mb2">
          <Btn onClick={() => { setOpen(false); onSignIn(); }}>Sign In</Btn>
          <Btn glass href="/" onClick={() => setOpen(false)}>Visit Site</Btn>
          <Btn glass href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener">Join Discord</Btn>
        </div>
      </div>
    </nav>
  );
}
