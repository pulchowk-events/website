'use client';

import { useEffect } from 'react';

export function FaqInteractions() {
  useEffect(() => {
    document.documentElement.classList.add('faq-reveal-active');

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
        const next = (e.target as HTMLElement).closest?.('.faq-section') as HTMLElement | null;
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
      document.documentElement.classList.remove('faq-reveal-active');
    };
  }, []);

  return null;
}
