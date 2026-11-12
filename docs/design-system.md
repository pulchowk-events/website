Save as `docs/design-system.md`.

---

# Pulchowk Events — Design System

**Version:** 1.0
**References:** Vercel dashboard (primary), Pulchowk Events landing, Notion (select affordances).
**Source of truth for tokens:** the landing mockup CSS. Where the Vercel dashboard differs from our tokens, ours win.

**Priority order, locked:**
1. Performance on Netlify free tier.
2. SEO.
3. Visual consistency (Vercel-dashboard-derived).

Any decision that trades 1 or 2 for 3 is wrong.

---

## 1. Color Tokens

### 1.1 Foundation

| Token | Value | Use |
|---|---|---|
| `--bg` | `#000000` | Page background |
| `--t` | `#ededed` | Primary text |
| `--m` | `#a1a1a1` | Secondary text, metadata, disabled |
| `--l` | `rgba(255,255,255,.14)` | Standard borders, rings |
| `--l2` | `rgba(255,255,255,.08)` | Subtle borders, hairline dividers |

### 1.2 Accents

Semantic only. Never decorative fills.

| Token | Value | Semantic role |
|---|---|---|
| `--g` | `#3ecf8e` | Primary action, success, "verified", live status |
| `--a` | `#f5a623` | Warning, jobs, secondary emphasis |
| `--v` | `#8b7cff` | Tertiary, scholarships, admin |
| `--c` | `#4cc9f0` | Info, tech/hardware, links in illustrations |
| `--danger` | `#ff5c5c` | Destructive actions, errors |

### 1.3 Surface ladder

| Token | Value | Use |
|---|---|---|
| `--surface-0` | `#000000` | Page background |
| `--surface-1` | `#050505` | Cards, terminals, diagram backgrounds |
| `--surface-2` | `#0d0d0d` | Inputs, list rows |
| `--surface-3` | `#1c1c1c` | Chips, progress-bar tracks, small tags |

### 1.4 Semantic aliases

| Alias | Resolves to |
|---|---|
| `--success` | `--g` |
| `--warning` | `--a` |
| `--info` | `--c` |
| `--error` | `--danger` |

### 1.5 Component-local (do not promote)

These appear only where a specific component needs them. Do not use as system tokens.

| Value | Where |
|---|---|
| `#262626` | Scrollbar thumb |
| `#2a2a2a` | Terminal toolbar dots |
| `#cfcfcf` | Marquee source logos |
| `#d4d4d4` | Terminal output, command text |
| `#8a8a8a` | Diagram secondary labels, struck-through state |
| `#7d7d7d` | Terminal comments |
| `#111111` | Compare slot background |
| `#141414` | Diagram node hover fill |

### 1.6 Rendered examples

**Background ladder**

```jsx
<div style={{ background: 'var(--surface-0)', padding: 24 }}>
  <div style={{ background: 'var(--surface-1)', border: '1px solid var(--l)', borderRadius: 12, padding: 20 }}>
    <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: 12 }}>
      <div style={{ background: 'var(--surface-3)', borderRadius: 6, padding: 8 }} />
    </div>
  </div>
</div>
```

**Text tiers**

```jsx
<div>
  <p style={{ color: 'var(--t)', fontSize: 16 }}>Primary text sits on --t.</p>
  <p style={{ color: 'var(--m)', fontSize: 14, marginTop: 4 }}>Secondary metadata uses --m.</p>
  <p style={{ color: 'var(--m)', fontSize: 13, marginTop: 4 }}>Tertiary meta stays at --m with a smaller size.</p>
</div>
```

**Accents in real context**

```jsx
<span style={{ background: 'rgba(62,207,142,.14)', color: 'var(--g)', padding: '3px 9px', borderRadius: 6, font: '500 11px var(--font-geist-mono), monospace' }}>verified</span>
<span style={{ background: 'rgba(245,166,35,.14)', color: 'var(--a)', padding: '3px 9px', borderRadius: 6, font: '500 11px var(--font-geist-mono), monospace' }}>job</span>
<span style={{ background: 'rgba(139,124,255,.14)', color: 'var(--v)', padding: '3px 9px', borderRadius: 6, font: '500 11px var(--font-geist-mono), monospace' }}>scholarship</span>
<span style={{ background: 'rgba(76,201,240,.14)', color: 'var(--c)', padding: '3px 9px', borderRadius: 6, font: '500 11px var(--font-geist-mono), monospace' }}>event</span>
```

**Borders vs rings**

```jsx
{/* Ring: does not affect layout, preferred for interactive elements */}
<button style={{ boxShadow: '0 0 0 1px var(--l)', background: 'var(--surface-1)', border: 0, borderRadius: 8, padding: '8px 12px', color: 'var(--t)' }}>
  Ringed
</button>

{/* Border: for structural containers */}
<div style={{ border: '1px solid var(--l)', borderRadius: 12, background: 'var(--surface-1)' }} />
```

---

## 2. Typography

**Family:** Geist (UI, headings, body). Geist Mono (terminal, tags, chips, counters, diagram labels, breadcrumbs, table headers).

Loaded once via `next/font/google` in `app/landing/layout.tsx`. Exposed as `--font-geist-sans` and `--font-geist-mono`. No other web fonts permitted.

**Weight:** headings `400`. Buttons and bold labels `500`. Never `600` or `700`.

**Letter-spacing:** headings `-.055em`. Card titles `-.04em`. All body text at `0`.

### 2.1 Scale

| Role | Size | Line-height | Letter-spacing | Weight | Color |
|---|---|---|---|---|---|
| `h1` landing | `clamp(44px, 7.2vw, 92px)` | 1 | `-.055em` | 400 | `--t` |
| `h1` app page | `clamp(36px, 5vw, 56px)` | 1.05 | `-.055em` | 400 | `--t` |
| `h2` landing | `clamp(34px, 5vw, 64px)` | 1 | `-.055em` | 400 | `--t` |
| `h2` app section | `clamp(28px, 3.4vw, 40px)` | 1.1 | `-.055em` | 400 | `--t` |
| `h3` card title | 22px | 1.2 | `-.04em` | 400 | `--t` |
| `h4` sub-card | 18px | 1.3 | `-.03em` | 500 | `--t` |
| Body | 16px | 1.5 | 0 | 400 | `--t` |
| Subhead (`p.s`) | 16px | 1.5 | 0 | 400 | `--m` |
| Button label | 15px | 1 | 0 | 500 | invert |
| Nav link | 14px | 1.4 | 0 | 400 | `--m` → `--t` on hover |
| Meta / small | 13px | 1.4 | 0 | 400 | `--m` |
| Mono label | 12px | 1.4 | 0 | 400 | `--m` · Geist Mono |
| Eyebrow | 11px | 1.2 | `0.06em` (uppercase) | 500 | `--m` · Geist Mono |
| Terminal | 13px | 1.7 | 0 | 400 | `#d4d4d4` · Geist Mono |

`text-wrap: balance` on `h1`, `h2`, and `p.s`.

### 2.2 Rendered examples

**Landing h1**

```jsx
<h1 style={{
  fontSize: 'clamp(44px, 7.2vw, 92px)',
  lineHeight: 1,
  letterSpacing: '-.055em',
  fontWeight: 400,
  textWrap: 'balance',
  color: 'var(--t)',
}}>
  Never miss what&rsquo;s on at campus.
</h1>
```

**App page h1 with eyebrow and description**

```jsx
<header style={{ maxWidth: 720 }}>
  <p style={{
    fontFamily: 'var(--font-geist-mono), monospace',
    fontSize: 11,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    color: 'var(--m)',
    marginBottom: 12,
  }}>
    Events
  </p>
  <h1 style={{
    fontSize: 'clamp(36px, 5vw, 56px)',
    lineHeight: 1.05,
    letterSpacing: '-.055em',
    fontWeight: 400,
    color: 'var(--t)',
  }}>
    Vetted campus events.
  </h1>
  <p style={{ color: 'var(--m)', fontSize: 16, marginTop: 16, maxWidth: 560 }}>
    Filter by category, month, or city. Every listing is human-reviewed before it appears here.
  </p>
</header>
```

**Section header**

```jsx
<div style={{ marginBottom: 40 }}>
  <h2 style={{
    fontSize: 'clamp(28px, 3.4vw, 40px)',
    lineHeight: 1.1,
    letterSpacing: '-.055em',
    fontWeight: 400,
    color: 'var(--t)',
  }}>
    Recently shipped
  </h2>
  <p style={{ color: 'var(--m)', marginTop: 16, maxWidth: 420 }}>
    The three most recent additions to the index.
  </p>
</div>
```

**Card title + subtitle**

```jsx
<div>
  <h3 style={{ fontSize: 22, fontWeight: 400, letterSpacing: '-.04em', color: 'var(--t)' }}>Events</h3>
  <p style={{ color: 'var(--m)', fontSize: 14, marginTop: 4 }}>Filter by tab, category, month, city.</p>
</div>
```

**Mono label in a table header**

```jsx
<th style={{
  fontFamily: 'var(--font-geist-mono), monospace',
  fontSize: 12,
  fontWeight: 400,
  color: 'var(--m)',
  textAlign: 'left',
  padding: '10px 12px',
}}>
  posted_at
</th>
```

---

## 3. Spacing

Base unit: **4px**. Every spacing value must come from the scale below. No arbitrary values.

### 3.1 Scale

`0 4 8 12 16 20 24 28 32 40 48 56 64 72 80 96 130`

Named:

| Token | Value |
|---|---|
| `--gap-xs` | 4px |
| `--gap-sm` | 8px |
| `--gap-md` | 16px |
| `--gap-lg` | 24px |
| `--gap-xl` | 40px |
| `--gap-2xl` | 56px |
| `--section-y` | 130px desktop · 90px ≤900 · 72px ≤640 |
| `--container-x` | 24px desktop · 20px ≤640 |

### 3.2 Rendered examples

**Section**

```jsx
<section style={{ paddingTop: 'var(--section-y)', paddingBottom: 'var(--section-y)', borderTop: '1px solid var(--l2)' }}>
  <div className="w">{/* max-width 1280, padding 0 var(--container-x) */}</div>
</section>
```

**Card internal**

```jsx
<div style={{ padding: 24, display: 'grid', gap: 8 }}>
  {/* title, description, content, footer — 8px between rows */}
</div>
```

**Row**

```jsx
<div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px' }} />
```

---

## 4. Radius

| Value | Use |
|---|---|
| 6px | Small tags, chips, mono badges |
| 8px | Inputs (non-pill), list rows, small controls |
| 10px | Diagram nodes, dense cards |
| 12px | Standard cards, terminals, split panels |
| 14px | Hero cards, Discord mockups |
| 40px | Phone frame (only `.ph`) |
| 99px | Pills, buttons, tabs, avatars, round inputs |

Do not invent radii. If a 12px card feels wrong, the card is wrong, not the radius.

### 4.1 Rendered examples

```jsx
<button style={{ borderRadius: 99, height: 40, padding: '0 18px', background: '#ededed', color: '#0a0a0a', border: 0, font: '500 15px/1 var(--font-geist-sans)' }}>Primary</button>

<input style={{ height: 40, borderRadius: 99, padding: '0 16px', background: 'var(--surface-2)', boxShadow: '0 0 0 1px var(--l)', border: 0, color: 'var(--t)' }} />

<textarea style={{ borderRadius: 12, padding: '12px 16px', background: 'var(--surface-2)', boxShadow: '0 0 0 1px var(--l)', border: 0, color: 'var(--t)', minHeight: 120 }} />

<div style={{ borderRadius: 12, border: '1px solid var(--l)', background: 'var(--surface-1)', padding: 20 }}>Card</div>

<div style={{ borderRadius: 14, border: '1px solid var(--l)', background: 'var(--surface-1)', padding: 24 }}>Bento card</div>

<span style={{ borderRadius: 6, padding: '3px 9px', font: '500 11px var(--font-geist-mono)', background: 'var(--surface-3)', color: 'var(--m)' }}>chip</span>
```

---

## 5. Shadows and Rings

The system uses **rings** (`box-shadow: 0 0 0 1px …`) for interactive elements and **borders** for structural containers. This lets a component change state without reflow.

### 5.1 Ring scale

| Ring | Use |
|---|---|
| `0 0 0 1px var(--l)` | Standard border (buttons, pills, inputs) |
| `0 0 0 1px var(--l2)` | Subtle border (dense rows, chips) |
| `0 0 0 1px var(--g)` | Focused/active pill or input |
| `0 0 0 1px rgba(62,207,142,.4)` | Success state |
| `outline: 2px solid var(--g); outline-offset: 3px` | Keyboard focus on any element |

### 5.2 Depth

| Value | Use |
|---|---|
| None | Default for cards and rows |
| `0 0 0 1px var(--l), 0 0 0 8px #0a0a0a, 0 0 0 9px var(--l)` | Phone frame only |
| `filter: blur(…)` | Only `.term` focus glow and `.ph` halo |

No drop-shadows on text, buttons, or cards. No `filter: drop-shadow()` outside the peel triangle in the mockup.

### 5.3 Rendered examples

**Glass button**

```jsx
<button style={{
  height: 40,
  padding: '0 18px',
  borderRadius: 99,
  background: 'rgba(255,255,255,.04)',
  color: 'var(--t)',
  border: 0,
  boxShadow: '0 0 0 1px var(--l)',
  backdropFilter: 'blur(12px)',
  font: '500 15px/1 var(--font-geist-sans)',
}}>Secondary</button>
```

**Focused input**

```jsx
<input style={{
  height: 40,
  borderRadius: 99,
  padding: '0 16px',
  background: 'var(--surface-2)',
  border: 0,
  boxShadow: '0 0 0 1px var(--g)',
  color: 'var(--t)',
  outline: 'none',
}} />
```

**Success pill**

```jsx
<span style={{
  padding: '4px 10px',
  borderRadius: 6,
  color: 'var(--g)',
  boxShadow: '0 0 0 1px rgba(62,207,142,.4)',
  font: '500 12px var(--font-geist-mono)',
}}>verified</span>
```

---

## 6. Motion

Easing token: `--e: cubic-bezier(.22,1,.36,1)`. Use it for every transform/position transition. Use `ease` or `linear` only for opacity/color.

### 6.1 Durations

| Pattern | Duration | Easing |
|---|---|---|
| Button label slide (`.b .label--*`) | 550ms | `--e` |
| Button press (`.b:active`) | 200ms | `--e` |
| Nav scroll state | 300ms | `ease` |
| Tab switch | 200ms | `ease` |
| Focus ring | instantaneous | — |
| Reveal on scroll (opacity + translateY) | 600–900ms | `--e` |
| Counter count-up | 1400ms | custom RAF, ease-out |
| Panel/drawer | 300ms | `--e` |
| Marquee | 46s / 60s | linear |
| Terminal typewriter | 8–22ms per character | step |
| Diagram particle motion | 2200ms per edge | linear |

### 6.2 Rules

- Everything under `@media (prefers-reduced-motion: reduce)` collapses to `animation: none; transition: none`.
- Interactive state changes (hover/focus/active) never exceed 600ms.
- Ambient motion (marquee, particle, counter) is unbounded but must pause when off-screen (`IntersectionObserver`).
- No animation on page load that shifts layout. Reveal via `opacity` and `translateY` only, never `height`/`display` unless it's an accordion.

### 6.3 Rendered example — reveal on scroll

```tsx
'use client';
import { useEffect, useRef } from 'react';

export function Reveal({ children }: { children: React.ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          el.style.opacity = '1';
          el.style.transform = 'none';
          io.disconnect();
        }
      },
      { threshold: 0.15 }
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <div
      ref={ref}
      style={{
        opacity: 0,
        transform: 'translateY(16px)',
        transition: 'opacity 900ms var(--e), transform 900ms var(--e)',
      }}
    >
      {children}
    </div>
  );
}
```

---

## 7. Layout Primitives

### 7.1 Container

```jsx
.w — max-width: 1280px; margin-inline: auto; padding-inline: 24px (20px ≤640)
```

### 7.2 Grid helpers

| Class | Definition |
|---|---|
| `.sp2` | `grid-template-columns: 1fr 1.15fr; gap: 56px` — stacks to 1 col ≤900 |
| `.bg` | 10-col bento grid; spans `.s6` (6) and `.s4` (4) — stacks ≤900 |
| `.nm` | 4 equal cols — 2 cols ≤900, 1 col ≤640 |
| `.dr` | 4 equal cols — same responsive behavior |
| `.rail` | 3 equal cols — stacks ≤900 |
| `.rc` | 2 equal cols — stacks ≤900 |
| `.dc` | `252px minmax(0,1fr)` — mobile: single column with drawer |

### 7.3 App page shell

```jsx
<div style={{ display: 'grid', gridTemplateColumns: '240px minmax(0, 1fr)' }}>
  <Sidebar />   {/* sticky, hidden ≤1024 */}
  <main className="w" style={{ paddingBlock: 40 }}>{children}</main>
</div>
```

No three-column layout. No right rail. The feed is centered but slightly wider than the landing's `.w` because it sits next to the sidebar.

### 7.4 Breakpoints

| Breakpoint | Changes |
|---|---|
| ≤ 1020px | Pipeline SVG hidden, mobile accordion shown |
| ≤ 900px | Nav collapses to hamburger; 2+ col grids → 1; section padding 130 → 90 |
| ≤ 640px | Container 24 → 20; h1/h2 shrink; section padding → 72; marquee text 26 → 20 |
| `pointer: coarse` | Button `height` 40 → 44; nav buttons 32 → 36; tabs 36 → 40 |

---

## 8. Components

Every component below is a spec: markup + CSS + usage note. Copy markup directly into the codebase. Replace inline styles with classes only after the CSS block is registered in `globals.css`.

### 8.1 Button

Two variants: solid (`--primary`) and glass (`--secondary`).

```tsx
// components/ui/Button.tsx
'use client';
import { forwardRef, type ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
  size?: 'md' | 'sm';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...rest }, ref) => (
    <button
      ref={ref}
      type="button"
      className={`btn btn--${variant} btn--${size} ${className}`}
      {...rest}
    >
      <span className="btn__label">{children}</span>
      <span className="btn__label btn__label--dup" aria-hidden="true">{children}</span>
    </button>
  )
);
Button.displayName = 'Button';
```

```css
.btn {
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  padding: 0 18px;
  border-radius: 99px;
  border: 0;
  overflow: hidden;
  cursor: pointer;
  font: 500 15px/1 var(--font-geist-sans), sans-serif;
  white-space: nowrap;
  transition: transform 200ms var(--e), opacity 200ms;
}
.btn:active { transform: scale(.97); opacity: .85; }
.btn:focus-visible { outline: 2px solid var(--g); outline-offset: 3px; }

.btn--primary { background: #ededed; color: #0a0a0a; }
.btn--secondary {
  background: rgba(255,255,255,.04);
  color: var(--t);
  box-shadow: 0 0 0 1px var(--l);
  backdrop-filter: blur(12px);
}
.btn--sm { height: 32px; padding: 0 14px; font-size: 14px; }
@media (pointer: coarse) {
  .btn { height: 44px; }
  .btn--sm { height: 36px; }
}

.btn__label {
  display: flex;
  align-items: center;
  align-self: stretch;
  transition: transform 550ms var(--e);
}
.btn__label--dup {
  position: absolute;
  inset: 0;
  justify-content: center;
  transform: translateY(100%);
}
.btn--secondary .btn__label--dup { background: #ededed; color: #000; }
@media (hover: hover) {
  .btn:hover .btn__label { transform: translateY(-100%); }
  .btn:hover .btn__label--dup { transform: none; }
}
```

Usage: `<Button>Deploy now</Button>` / `<Button variant="secondary">Talk to sales</Button>`.

### 8.2 Pill

Non-interactive label.

```css
.pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 28px;
  padding: 0 12px;
  border-radius: 99px;
  box-shadow: 0 0 0 1px var(--l);
  font-size: 12px;
  color: var(--m);
}
.pill i {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--g);
  box-shadow: 0 0 10px var(--g);
}
```

Usage: `<span className="pill"><i />Live</span>`.

### 8.3 Tag

Mono chip for categories, statuses, and filters.

```css
.tag {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 56px;
  padding: 3px 9px;
  border-radius: 6px;
  font: 500 11px/1.2 var(--font-geist-mono), monospace;
  color: var(--c);
  background: color-mix(in srgb, var(--c) 14%, transparent);
  flex: none;
  text-align: center;
}
.tag--event { --c: var(--g); }
.tag--job { --c: var(--a); }
.tag--scholarship { --c: var(--v); }
.tag--danger { --c: var(--danger); }
```

Usage: `<span className="tag tag--job">Job</span>`.

### 8.4 Card

```css
.card {
  border: 1px solid var(--l);
  border-radius: 14px;
  padding: 24px;
  background: var(--surface-1);
  display: flex;
  flex-direction: column;
  transition: border-color 200ms;
}
.card:hover { border-color: rgba(255,255,255,.4); }
.card__title { font-size: 22px; font-weight: 400; letter-spacing: -.04em; color: var(--t); }
.card__sub { color: var(--m); font-size: 14px; margin-top: 4px; }
```

Usage: `<article className="card"><h3 className="card__title">Events</h3><p className="card__sub">Filter by tab, category, month, city.</p></article>`.

### 8.5 Tabs

```tsx
interface TabsProps {
  items: string[];
  value: string;
  onChange: (v: string) => void;
}
export function Tabs({ items, value, onChange }: TabsProps) {
  return (
    <div role="tablist" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {items.map((item) => (
        <button
          key={item}
          role="tab"
          aria-selected={item === value}
          className={`tab${item === value ? ' tab--on' : ''}`}
          onClick={() => onChange(item)}
        >
          {item}
        </button>
      ))}
    </div>
  );
}
```

```css
.tab {
  height: 36px;
  padding: 0 16px;
  border-radius: 99px;
  border: 0;
  background: transparent;
  color: var(--m);
  box-shadow: 0 0 0 1px var(--l);
  font: 500 13px var(--font-geist-mono), monospace;
  cursor: pointer;
  transition: color 200ms, background 200ms, box-shadow 200ms;
}
.tab--on { background: #ededed; color: #000; }
.tab:focus-visible { outline: 2px solid var(--g); outline-offset: 3px; }
```

### 8.6 Input

```css
.input {
  height: 40px;
  padding: 0 16px;
  border-radius: 99px;
  border: 0;
  background: var(--surface-2);
  box-shadow: 0 0 0 1px var(--l);
  color: var(--t);
  font: 400 16px var(--font-geist-sans);
  outline: none;
  width: 100%;
}
.input:focus { box-shadow: 0 0 0 1px var(--g); }
.input--multi {
  height: auto;
  min-height: 120px;
  border-radius: 12px;
  padding: 12px 16px;
  resize: vertical;
}
.input::placeholder { color: var(--m); }
```

### 8.7 Terminal

```css
.terminal {
  border: 1px solid var(--l);
  border-radius: 12px;
  background: var(--surface-1);
  overflow: hidden;
}
.terminal__bar {
  display: flex;
  gap: 7px;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid var(--l2);
  font-size: 12px;
  color: var(--m);
}
.terminal__dot { width: 9px; height: 9px; border-radius: 50%; background: #2a2a2a; }
.terminal__body {
  padding: 20px;
  font: 400 13px/1.7 var(--font-geist-mono), monospace;
  color: #d4d4d4;
  white-space: pre-wrap;
  overflow: auto;
  min-height: 300px;
}
```

### 8.8 Table row

Used in admin, lists, and the empty/loading states.

```css
.row {
  display: flex;
  align-items: center;
  gap: 10px;
  height: 34px;
  padding: 0 10px;
  border-radius: 8px;
  background: var(--surface-2);
  box-shadow: 0 0 0 1px var(--l2);
  font-size: 12px;
  color: var(--m);
}
.row__id {
  font: 500 11px var(--font-geist-mono), monospace;
  padding: 2px 7px;
  border-radius: 5px;
  background: var(--surface-3);
  color: #ddd;
}
.row__bar { flex: 1; height: 6px; border-radius: 3px; background: #1f1f1f; }
.row__bar--filled {
  background: linear-gradient(90deg, #fff var(--w), #1f1f1f var(--w));
}
```

### 8.9 Page header (app pages)

The only "hero" that app pages get. No canvas, no gradient, no accent ring.

```tsx
interface PageHeaderProps {
  eyebrow: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
}

export function PageHeader({ eyebrow, title, description, action }: PageHeaderProps) {
  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        gap: 24,
        marginBottom: 40,
        flexWrap: 'wrap',
      }}
    >
      <div style={{ maxWidth: 720 }}>
        <p
          style={{
            fontFamily: 'var(--font-geist-mono), monospace',
            fontSize: 11,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--m)',
            marginBottom: 12,
          }}
        >
          {eyebrow}
        </p>
        <h1
          style={{
            fontSize: 'clamp(36px, 5vw, 56px)',
            lineHeight: 1.05,
            letterSpacing: '-.055em',
            fontWeight: 400,
            color: 'var(--t)',
            textWrap: 'balance',
          }}
        >
          {title}
        </h1>
        {description && (
          <p style={{ color: 'var(--m)', fontSize: 16, marginTop: 16, maxWidth: 560 }}>
            {description}
          </p>
        )}
      </div>
      {action && <div style={{ display: 'flex', gap: 12 }}>{action}</div>}
    </header>
  );
}
```

Usage:

```tsx
<PageHeader
  eyebrow="Events"
  title="Vetted campus events."
  description="Every listing is human-reviewed before it appears here."
  action={<Button>Submit an event</Button>}
/>
```

### 8.10 Section header

Same pattern, smaller scale.

```css
.section-header { margin-bottom: 40px; }
.section-header__title {
  font-size: clamp(28px, 3.4vw, 40px);
  line-height: 1.1;
  letter-spacing: -.055em;
  font-weight: 400;
  color: var(--t);
}
.section-header__desc { color: var(--m); margin-top: 16px; max-width: 420px; }
```

### 8.11 Diagram node (SVG)

```css
.node rect { fill: #0a0a0a; stroke: rgba(255,255,255,.22); transition: stroke 200ms, fill 200ms; }
.node:hover rect, .node:focus rect { stroke: #fff; fill: #141414; }
.node text { fill: var(--t); font: 500 15px var(--font-geist-sans); text-anchor: middle; pointer-events: none; }
.node .sub { fill: #8a8a8a; font: 400 10.5px var(--font-geist-mono); }
```

### 8.12 Marquee — landing only

```css
.marquee {
  overflow: hidden;
  mask: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
  -webkit-mask: linear-gradient(90deg, transparent, #000 12%, #000 88%, transparent);
}
.marquee > div {
  display: flex;
  width: max-content;
  animation: marquee 46s linear infinite;
}
.marquee--reverse > div { animation-direction: reverse; animation-duration: 60s; }
.marquee:hover > div { animation-play-state: paused; }
.marquee ul {
  display: flex;
  gap: 64px;
  padding-right: 64px;
  list-style: none;
  align-items: center;
}
@keyframes marquee { to { transform: translateX(-50%); } }
@media (prefers-reduced-motion: reduce) {
  .marquee > div { animation: none; overflow-x: auto; }
}
```

**Do not use marquee on any app page.**

---

## 9. Navbar and Sidebar

The revamp replaces the current Facebook-style top + bottom nav with a Vercel-dashboard-style shell: fixed top bar with a global search, sticky left sidebar on desktop, drawer on mobile. No bottom nav.

### 9.1 Navbar (top, fixed)

```tsx
'use client';
import { useEffect, useState } from 'react';

export function Navbar({ onOpenCommand }: { onOpenCommand: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        left: 0,
        right: 0,
        height: 64,
        zIndex: 50,
        display: 'flex',
        alignItems: 'center',
        padding: '0 24px',
        background: scrolled ? 'rgba(0,0,0,.72)' : 'transparent',
        boxShadow: scrolled ? '0 1px 0 var(--l2)' : 'none',
        backdropFilter: scrolled ? 'blur(14px)' : 'none',
        transition: 'background 300ms, box-shadow 300ms',
      }}
    >
      <a href="/" style={{ fontWeight: 500, letterSpacing: '-.04em', fontSize: 19, color: 'var(--t)' }}>
        Pulchowk Events
      </a>

      <button
        type="button"
        onClick={onOpenCommand}
        style={{
          marginLeft: 32,
          height: 32,
          padding: '0 12px',
          borderRadius: 8,
          border: 0,
          background: 'var(--surface-2)',
          boxShadow: '0 0 0 1px var(--l)',
          color: 'var(--m)',
          fontSize: 13,
          display: 'flex',
          alignItems: 'center',
          gap: 8,
          cursor: 'pointer',
        }}
      >
        <span>Search</span>
        <kbd
          style={{
            fontFamily: 'var(--font-geist-mono)',
            fontSize: 11,
            padding: '2px 6px',
            borderRadius: 4,
            background: 'var(--surface-3)',
            color: 'var(--m)',
          }}
        >
          ⌘K
        </kbd>
      </button>

      <nav style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
        {/* theme toggle, notifications, avatar, sign-in — see 9.3 */}
      </nav>
    </header>
  );
}
```

### 9.2 Sidebar (desktop only, sticky)

```tsx
const GROUPS = [
  { label: 'Browse', items: [
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/jobs', label: 'Jobs', icon: Briefcase },
    { href: '/product-hunt', label: 'Projects', icon: Box },
    { href: '/lounge', label: 'Lounge', icon: MessageCircle },
  ]},
  { label: 'About', items: [
    { href: '/about', label: 'About', icon: Info },
    { href: '/donate', label: 'Donate', icon: Heart },
  ]},
];

export function Sidebar() {
  const pathname = usePathname();
  return (
    <aside
      aria-label="Primary"
      style={{
        position: 'sticky',
        top: 64,
        height: 'calc(100vh - 64px)',
        width: 240,
        padding: '24px 12px',
        borderRight: '1px solid var(--l2)',
        overflowY: 'auto',
      }}
    >
      {GROUPS.map((g) => (
        <div key={g.label} style={{ marginBottom: 24 }}>
          <p
            style={{
              fontFamily: 'var(--font-geist-mono)',
              fontSize: 11,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              color: 'var(--m)',
              padding: '0 12px 8px',
            }}
          >
            {g.label}
          </p>
          {g.items.map((item) => {
            const active = pathname === item.href || pathname?.startsWith(item.href + '/');
            const Icon = item.icon;
            return (
              <a
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '8px 12px',
                  borderRadius: 8,
                  fontSize: 14,
                  color: active ? 'var(--t)' : 'var(--m)',
                  background: active ? 'var(--surface-2)' : 'transparent',
                  transition: 'background 200ms, color 200ms',
                }}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </a>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
```

On mobile (`≤1024px`), the sidebar becomes a drawer toggled by a hamburger button in the navbar. No bottom nav anywhere.

### 9.3 Command palette

```tsx
'use client';
import { useEffect, useState } from 'react';

export function CommandPalette({ open, onClose }: { open: boolean; onClose: () => void }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Search"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(0,0,0,.6)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'flex-start',
        paddingTop: '15vh',
      }}
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(640px, 90vw)',
          background: 'var(--surface-1)',
          border: '1px solid var(--l)',
          borderRadius: 12,
          overflow: 'hidden',
          boxShadow: '0 24px 64px rgba(0,0,0,.5)',
        }}
      >
        <input
          autoFocus
          placeholder="Search events, jobs, projects, users…"
          style={{
            width: '100%',
            padding: '16px 20px',
            background: 'transparent',
            border: 0,
            borderBottom: '1px solid var(--l2)',
            color: 'var(--t)',
            fontSize: 16,
            outline: 'none',
          }}
        />
        <div style={{ maxHeight: 400, overflowY: 'auto', padding: 8 }}>
          {/* CommandItem list: <a> rows with icon + label + meta on the right */}
        </div>
      </div>
    </div>
  );
}
```

Bind `⌘K` / `Ctrl+K` globally. Registration lives in `Layout.tsx`, not in each page.

### 9.4 Command item (row inside palette)

```css
.cmd-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  font-size: 14px;
  color: var(--t);
  transition: background 120ms;
  cursor: pointer;
}
.cmd-item[data-active="true"],
.cmd-item:hover { background: var(--surface-2); }
.cmd-item__meta {
  margin-left: auto;
  font: 400 11px var(--font-geist-mono);
  color: var(--m);
}
```

---

## 10. Empty / Loading / Error States

Every page or panel that fetches must render all three states. No spinner outside a skeleton.

### 10.1 Skeleton row

```tsx
export function SkeletonRow() {
  return (
    <div
      aria-hidden="true"
      style={{
        height: 20,
        borderRadius: 6,
        background:
          'linear-gradient(90deg, var(--surface-2) 0%, var(--surface-3) 50%, var(--surface-2) 100%)',
        backgroundSize: '200% 100%',
        animation: 'sk 1400ms linear infinite',
      }}
    />
  );
}

// Inline keyframes in globals.css:
// @keyframes sk { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
```

Wrap six in a vertical stack with `gap: 10` for a typical list loading state.

### 10.2 Empty state

```tsx
interface EmptyStateProps {
  title: string;
  description: string;
  action?: React.ReactNode;
}
export function EmptyState({ title, description, action }: EmptyStateProps) {
  return (
    <div
      style={{
        border: '1px dashed var(--l)',
        borderRadius: 12,
        padding: 48,
        textAlign: 'center',
        background: 'var(--surface-1)',
      }}
    >
      <p style={{ fontSize: 18, color: 'var(--t)', marginBottom: 8 }}>{title}</p>
      <p style={{ fontSize: 14, color: 'var(--m)', marginBottom: 20 }}>{description}</p>
      {action}
    </div>
  );
}
```

### 10.3 Error state

Same shape as empty state, plus a destructive-toned eyebrow.

```tsx
<div style={{ border: '1px solid rgba(255,92,92,.3)', borderRadius: 12, padding: 32, background: 'var(--surface-1)' }}>
  <p style={{ fontFamily: 'var(--font-geist-mono)', fontSize: 11, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--danger)', marginBottom: 8 }}>
    Error
  </p>
  <p style={{ color: 'var(--t)', marginBottom: 8 }}>Could not load this page.</p>
  <p style={{ color: 'var(--m)', fontSize: 14, marginBottom: 20 }}>Check your connection and try again.</p>
  <Button variant="secondary" onClick={() => window.location.reload()}>Retry</Button>
</div>
```

---

## 11. Migration Map

The site currently ships two token systems: the OKLCH tokens in `app/globals.css` and the landing tokens in `app/landing/landing.css`. This design system replaces both.

### 11.1 Token rename table

| Current | Replacement |
|---|---|
| `--background` | `--bg` |
| `--foreground` | `--t` |
| `--card` | `--surface-1` |
| `--card-foreground` | `--t` |
| `--popover` | `--surface-1` |
| `--popover-foreground` | `--t` |
| `--primary` | *(deprecated — use `.btn--primary`)* |
| `--primary-foreground` | `#0a0a0a` |
| `--secondary` | `--surface-2` |
| `--muted` | `--surface-2` |
| `--muted-foreground` | `--m` |
| `--accent` | `--surface-2` |
| `--accent-foreground` | `--t` |
| `--border` | `--l` |
| `--input` | `--l` |
| `--ring` | `--g` |
| `--destructive` | `--danger` |
| `--sidebar*` | `--surface-*` |

### 11.2 Migration order

Land in this sequence. One page per commit, always on `main`.

1. `globals.css`: add the new tokens. No visual change yet.
2. `Navbar.tsx` + `Sidebar.tsx` (new) + `Layout.tsx` restructure.
3. `/events` — list, card, detail, filters.
4. `/jobs` — list, card, detail.
5. `/product-hunt` — list, detail, votes.
6. `/lounge` — list, detail, comments.
7. `/about`, `/donate`, `/profile`, `/search`.
8. `/admin` — one pass, highest surface.
9. Delete the OKLCH tokens from `globals.css`.
10. Delete `next-themes` usage, `ThemeProvider`, and `ThemeToggle`. Delete the `dark:` variant from `tailwind.config.js`.

### 11.3 Component rewrite checklist

For each component:

- Remove `bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, `text-primary`, `bg-accent`, all `dark:` variants.
- Remove `rounded-lg`, `rounded-xl`, `rounded-2xl` — use the radius scale.
- Remove `shadow-*` utilities — use rings.
- Remove `next-themes` `useTheme` if present.
- Replace old class names with the DS component names from §8.

---

## 12. Deprecated

The following are not to be used in any new code, and are to be removed from existing code as each component migrates.

| Deprecated | Reason |
|---|---|
| `bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-muted`, `text-muted-foreground`, `bg-accent`, `bg-popover` | Replaced by DS tokens |
| `bg-primary`, `text-primary`, `bg-secondary`, `text-secondary` | Replaced by `.btn--primary` / `.btn--secondary` |
| `dark:` Tailwind variant | Site is dark only |
| `next-themes`, `ThemeProvider`, `ThemeToggle` | Site is dark only |
| `shadow-sm`, `shadow-md`, `shadow-lg`, `shadow-xl` | No drop shadows in DS |
| `rounded-lg`, `rounded-xl`, `rounded-2xl` | Use radius scale |
| `font-semibold`, `font-bold` on headings | Headings are 400 |
| `bg-gradient-*`, `bg-[linear-gradient(...)]` (except `.orb`, `.rail::after`, `.bar` fill, `.gh` text) | No background gradients |
| Arbitrary Tailwind values `p-[37px]`, `mt-[13px]` | Use the spacing scale |
| Bottom navigation (mobile) | Replaced by drawer + navbar |
| `filter: drop-shadow()` | Not in DS |
| Any canvas outside the landing hero | Performance |

---

## 13. Bans

Five rules that override every other consideration.

1. **No new runtime dependency without sign-off.** A design system grows by composition, not by imports.
2. **No CSS-in-JS.** All styling via CSS classes and Tailwind utilities that resolve to DS tokens.
3. **No web fonts beyond Geist and Geist Mono.** No exceptions.
4. **No canvas outside the landing hero.** Performance on Netlify free tier.
5. **No scroll listener without `{ passive: true }`.** Ever.