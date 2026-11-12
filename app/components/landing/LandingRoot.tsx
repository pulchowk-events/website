'use client';
import { useEffect, useState } from 'react';
import Cursor from './Cursor';
import ProgressBar from './ProgressBar';
import Nav from './Nav';
import Footer from './Footer';
import Hero from './Hero';
import Chaos from './Chaos';
import Rail from './Rail';
import DiscordSim from './DiscordSim';
import Personas from './Personas';
import Feed from './Feed';
import Compare from './Compare';
import Bento from './Bento';
import Numbers from './Numbers';
import UnderTheHood from './UnderTheHood';
import Terminal from './Terminal';
import Pipeline from './Pipeline';
import Layers from './Layers';
import MarkerRace from './MarkerRace';
import Drift from './Drift';
import TechMarquee from './TechMarquee';
import OpenSource from './OpenSource';
import FinalCTA from './FinalCTA';
import SignInModal from '@/app/components/signIn/SignInModal';

export default function LandingRoot() {
  const [signInOpen, setSignInOpen] = useState(false);

  useEffect(() => {
    let section: HTMLElement | null = null;
    let rect: DOMRect | null = null;
    let cx = 0, cy = 0, raf = 0;
    let lastTarget: EventTarget | null = null;

    const apply = () => {
      raf = 0;
      if (!section) return;
      if (!rect) rect = section.getBoundingClientRect();
      section.style.setProperty('--mx', `${cx - rect.left}px`);
      section.style.setProperty('--my', `${cy - rect.top}px`);
    };
    const onMove = (e: MouseEvent) => {
      cx = e.clientX;
      cy = e.clientY;
      if (e.target !== lastTarget) {
        lastTarget = e.target;
        const next = (e.target as HTMLElement).closest?.('section[data-fx]') as HTMLElement | null;
        if (next !== section) { section = next; rect = null; }
      }
      if (section && !raf) raf = requestAnimationFrame(apply);
    };
    const invalidate = () => { rect = null; };

    document.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      document.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
    };
  }, []);

  return (
    <div className="landing-root">
      <Cursor />
      <ProgressBar />
      <Nav onSignIn={() => setSignInOpen(true)} />
      <main id="top">
        <Hero onSignIn={() => setSignInOpen(true)} />
        <Chaos />
        <Rail />
        <DiscordSim />
        <Personas />
        <Feed />
        <Compare />
        <Bento />
        <Numbers />
        <UnderTheHood />
        <Terminal />
        <Pipeline />
        <Layers />
        <MarkerRace />
        <Drift />
        <TechMarquee />
        <OpenSource />
        <FinalCTA onSignIn={() => setSignInOpen(true)} />
      </main>
      <Footer />
      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </div>
  );
}
