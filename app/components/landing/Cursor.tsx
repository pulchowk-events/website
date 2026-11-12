'use client';
import { useEffect, useRef } from 'react';

export default function Cursor() {
  const ref = useRef<HTMLDivElement>(null);
  const s = useRef({ mx: 0, my: 0, cx: 0, cy: 0, visible: false, cls: '' });

  useEffect(() => {
    if (window.matchMedia('(hover: none)').matches) return;
    const el = ref.current;
    if (!el) return;
    let rafId = 0;

    const onMove = (e: MouseEvent) => {
      s.current.mx = e.clientX;
      s.current.my = e.clientY;
      s.current.visible = true;
      const target = e.target as HTMLElement;
      const fx = target.closest?.('[data-fx]') as HTMLElement | null;
      const next = target.closest('a,button') ? 'ring' : (fx?.dataset.fx || '');
      if (next !== s.current.cls) {
        el.className = next;
        s.current.cls = next;
      }
    };
    const onLeave = () => { s.current.visible = false; };
    const tick = () => {
      s.current.cx += (s.current.mx - s.current.cx) * 0.22;
      s.current.cy += (s.current.my - s.current.cy) * 0.22;
      el.style.transform = `translate(${s.current.cx}px,${s.current.cy}px)`;
      el.style.opacity = s.current.visible ? '1' : '0';
      rafId = requestAnimationFrame(tick);
    };
    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseleave', onLeave);
    tick();
    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('mousemove', onMove);
      document.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return <div id="cur" ref={ref} />;
}
