'use client';

import { useEffect } from 'react';

/**
 * Site-wide bootstrapping for the About page:
 *   1. Adds `.about-reveal-active` to <html> so the initial invisible state
 *      only applies once JS has run (no-JS users see everything).
 *   2. Observes [data-reveal] elements, flips them to data-reveal="in"
 *      when they enter the viewport — CSS owns the transition.
 *   3. Tracks mouse position over the current .about-section and writes
 *      --mx/--my so the section's radial glow follows the cursor.
 */
export function AboutInteractions() {
  useEffect(() => {
    document.documentElement.classList.add('about-reveal-active');

    const els = Array.from(document.querySelectorAll<HTMLElement>('[data-reveal]'));
    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).setAttribute('data-reveal', 'in');
            io.unobserve(entry.target);
          }
        }
      },
      { threshold: 0.12, rootMargin: '0px 0px -8% 0px' }
    );
    els.forEach((el) => io.observe(el));

    let currentSection: HTMLElement | null = null;
    let currentRect: DOMRect | null = null;
    let rafId = 0;
    let mx = 0;
    let my = 0;
    let lastTarget: EventTarget | null = null;

    const apply = () => {
      rafId = 0;
      if (!currentSection) return;
      if (!currentRect) currentRect = currentSection.getBoundingClientRect();
      currentSection.style.setProperty('--mx', mx - currentRect.left + 'px');
      currentSection.style.setProperty('--my', my - currentRect.top + 'px');
    };

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (e.target !== lastTarget) {
        lastTarget = e.target;
        const next = (e.target as HTMLElement).closest?.('.about-section') as HTMLElement | null;
        if (next !== currentSection) {
          currentSection = next;
          currentRect = null;
        }
      }
      if (currentSection && !rafId) rafId = requestAnimationFrame(apply);
    };

    const invalidate = () => {
      currentRect = null;
    };

    document.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('scroll', invalidate, { passive: true });
    window.addEventListener('resize', invalidate);

    return () => {
      io.disconnect();
      if (rafId) cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMove);
      window.removeEventListener('scroll', invalidate);
      window.removeEventListener('resize', invalidate);
      document.documentElement.classList.remove('about-reveal-active');
    };
  }, []);

  return null;
}
