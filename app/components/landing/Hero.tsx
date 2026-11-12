'use client';
import { useEffect, useRef } from 'react';
import Btn from './Btn';

const SRC = [
  'Khalti', 'KataJaam', 'NepVents', 'Kgarira',
  'SathiJob', 'InternSathi', 'MeroJob', 'KumariJob',
  'ScholarshipsAds', 'Erasmus Mundus',
];

interface HeroProps { onSignIn: () => void; }

export default function Hero({ onSignIn }: HeroProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = canvasRef.current;
    if (!cv) return;
    return runBlackHole(cv);
  }, []);

  return (
    <section className="hero" data-fx="big">
      <canvas ref={canvasRef} id="bh" aria-hidden="true" />
      <div className="orb">
        <div className="orbit">
          {[0, 1, 2, 3, 4, 5].map((i) => {
            const a = (i / 6) * Math.PI * 2;
            return (
              <span
                key={i}
                style={{
                  left: `${(50 + 50 * Math.cos(a)).toFixed(3)}%`,
                  top: `${(50 + 50 * Math.sin(a)).toFixed(3)}%`,
                }}
              />
            );
          })}
        </div>
      </div>
      <div className="w hg">
        <div>
          <h1>Never miss what&apos;s on at campus.</h1>
          <p className="s">Events, jobs and scholarships from all over Nepal, together in one place.</p>
          <div className="bt">
            <Btn onClick={onSignIn}>Sign In</Btn>
            <Btn glass href="https://discord.gg/cQ5gxusATk" target="_blank" rel="noopener">Join Discord</Btn>
          </div>
        </div>
      </div>
      <div className="w" style={{ paddingBottom: '40px', position: 'relative', zIndex: 2, width: '100%' }}>
        <div className="mq">
          <div>
            <ul className="src">
              {SRC.map((s) => <li key={s}>{s}</li>)}
              <li className="new mo">+ yours</li>
            </ul>
            <ul className="src" aria-hidden="true">
              {SRC.map((s) => <li key={`${s}-dup`}>{s}</li>)}
              <li className="new mo">+ yours</li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}

// Black-hole canvas simulation. Ported verbatim from the mockup.
// Returns a cleanup function that removes listeners and IO.

interface Particle { x: number; y: number; vx: number; vy: number; h: number[]; c: string; z: number; }
interface Fragment { x: number; y: number; t: number; c: string; }

function runBlackHole(cv: HTMLCanvasElement): () => void {
  const x = cv.getContext('2d');
  if (!x) return () => {};

  let W = 0, H = 0, cx = 0, cy = 0, R = 0;
  const B: Particle[] = [];
  const fl: Fragment[] = [];
  let run = true, tm = 0, sc = 0;
  const G = 1600;
  const cl = ['#fff', '#fff', '#fff', '#f5a623', '#4cc9f0', '#3ecf8e', '#8b7cff'];

  const rs = () => {
    const D = Math.min(window.devicePixelRatio || 1, 2);
    const w = window.innerWidth;
    const m = w < 640;
    const t = w < 900;
    W = cv.clientWidth;
    H = cv.clientHeight;
    cv.width = W * D;
    cv.height = H * D;
    x.setTransform(D, 0, 0, D, 0, 0);
    cx = W * (m ? 0.5 : t ? 0.8 : 0.77);
    cy = m ? 118 : t ? 170 : H * 0.46;
    R = m ? 30 : t ? 46 : 62;
  };

  const sp = () => {
    const a = Math.random() * 6.283;
    const d = Math.max(W, H) * (0.5 + Math.random() * 0.25);
    const r = Math.random();
    const k = r < 0.4 ? 0.3 + Math.random() * 0.35 : r < 0.85 ? 0.8 + Math.random() * 0.25 : 1.2 + Math.random() * 0.25;
    const s = Math.random() < 0.5 ? 1 : -1;
    const v = Math.sqrt(G / d) * k;
    B.push({
      x: cx + Math.cos(a) * d,
      y: cy + Math.sin(a) * d * 0.85,
      vx: -Math.sin(a) * s * v,
      vy: Math.cos(a) * s * v,
      h: [],
      c: cl[Math.floor(Math.random() * cl.length)],
      z: 0.8 + Math.random() * 1.3,
    });
  };

  const st = (dt: number) => {
    tm += dt;
    sc -= dt;
    if (sc <= 0 && B.length < 11) { sp(); sc = 40 + Math.random() * 90; }
    for (let i = B.length - 1; i >= 0; i--) {
      const b = B[i];
      const dx = cx - b.x, dy = cy - b.y;
      const r2 = dx * dx + dy * dy + 400;
      const r = Math.sqrt(r2);
      const a = (G / r2 / r) * dt;
      b.vx += dx * a;
      b.vy += dy * a;
      const q = 1 - dt * (0.0005 + (r < 260 ? 0.006 * (1 - r / 260) : 0));
      b.vx *= q;
      b.vy *= q;
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.h.push(b.x, b.y);
      if (b.h.length > 110) b.h.splice(0, 2);
      if (r < R * 0.9) { fl.push({ x: b.x, y: b.y, t: 0, c: b.c }); B.splice(i, 1); }
      else if (r > Math.max(W, H) * 1.7) B.splice(i, 1);
    }
  };

  const dr = () => {
    x.clearRect(0, 0, W, H);
    x.globalCompositeOperation = 'lighter';
    x.globalAlpha = 1;

    const g = x.createRadialGradient(cx, cy, R * 0.9, cx, cy, R * 5);
    g.addColorStop(0, 'rgba(255,255,255,.2)');
    g.addColorStop(1, 'rgba(255,255,255,0)');
    x.fillStyle = g;
    x.beginPath();
    x.arc(cx, cy, R * 5, 0, 6.283);
    x.fill();

    x.lineCap = 'round';
    for (const b of B) {
      const n = b.h.length / 2;
      x.strokeStyle = b.c;
      for (let j = 1; j < n; j++) {
        x.globalAlpha = (j / n) * 0.8;
        x.lineWidth = (b.z * j) / n * 1.6;
        x.beginPath();
        x.moveTo(b.h[j * 2 - 2], b.h[j * 2 - 1]);
        x.lineTo(b.h[j * 2], b.h[j * 2 + 1]);
        x.stroke();
      }
      x.globalAlpha = 1;
      x.fillStyle = '#fff';
      x.beginPath();
      x.arc(b.x, b.y, b.z + 0.6, 0, 6.283);
      x.fill();
    }

    const tl = -0.32;
    for (let i = 0; i < 6; i++) {
      x.globalAlpha = 0.5 - i * 0.07;
      x.strokeStyle = i < 2 ? '#f5a623' : i === 5 ? '#3ecf8e' : '#fff';
      x.lineWidth = 1;
      x.beginPath();
      x.ellipse(cx, cy, R * (1.45 + i * 0.32), R * (0.38 + i * 0.09), tl, 0, 6.283);
      x.stroke();
    }

    for (let i = 0; i < 3; i++) {
      const a = tm * 0.012 * (1.6 - i * 0.4) + i * 2.1;
      x.globalAlpha = 0.9;
      x.strokeStyle = i ? '#fff' : '#f5a623';
      x.lineWidth = 2.2;
      x.beginPath();
      x.ellipse(cx, cy, R * (1.45 + i * 0.64), R * (0.38 + i * 0.18), tl, a, a + 0.7);
      x.stroke();
    }

    x.globalCompositeOperation = 'source-over';
    x.globalAlpha = 1;
    x.fillStyle = '#000';
    x.beginPath();
    x.arc(cx, cy, R, 0, 6.283);
    x.fill();
    x.strokeStyle = 'rgba(255,255,255,.85)';
    x.lineWidth = 1.5;
    x.stroke();
    x.strokeStyle = '#3ecf8e';
    x.beginPath();
    x.arc(cx, cy, R + 0.5, tm * 0.01, tm * 0.01 + 1.1);
    x.stroke();

    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      x.globalAlpha = 0.55 - i * 0.1;
      x.strokeStyle = i ? '#fff' : '#f5a623';
      x.lineWidth = 1.2;
      x.beginPath();
      x.ellipse(cx, cy, R * (1.45 + i * 0.32), R * (0.38 + i * 0.09), tl, 0, Math.PI);
      x.stroke();
    }

    for (let i = fl.length - 1; i >= 0; i--) {
      const f = fl[i];
      f.t += 0.05;
      if (f.t >= 1) { fl.splice(i, 1); continue; }
      x.globalAlpha = 1 - f.t;
      x.strokeStyle = f.c;
      x.lineWidth = 1.5;
      x.beginPath();
      x.arc(f.x, f.y, 4 + f.t * 20, 0, 6.283);
      x.stroke();
    }
    x.globalAlpha = 1;
  };

  let last = 0;
  let rafId = 0;
  const lp = (n: number) => {
    if (run) { st(Math.min((n - last) / 16.7 || 1, 2.5)); dr(); }
    last = n;
    rafId = requestAnimationFrame(lp);
  };

  rs();
  window.addEventListener('resize', rs);
  for (let i = 0; i < 400; i++) st(1);

  if (typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dr();
    return () => window.removeEventListener('resize', rs);
  }

  rafId = requestAnimationFrame(lp);
  const io = new IntersectionObserver((entries) => { run = entries[0].isIntersecting; });
  io.observe(cv);

  return () => {
    cancelAnimationFrame(rafId);
    window.removeEventListener('resize', rs);
    io.disconnect();
  };
}
