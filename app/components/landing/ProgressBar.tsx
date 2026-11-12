'use client';
import { useEffect, useRef } from 'react';

export default function ProgressBar() {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const onScroll = () => {
      const el = ref.current;
      if (!el) return;
      const total = document.documentElement.scrollHeight - window.innerHeight;
      el.style.width = `${total > 0 ? (window.scrollY / total) * 100 : 0}%`;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);
  return <div id="pg" ref={ref} />;
}
