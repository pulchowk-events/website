'use client';

import { useEffect, useState } from 'react';
import { Clock, X } from 'lucide-react';

type Mode = 'auto' | 'show' | 'hide';

const NETLIFY_HOST_SUFFIXES = ['.netlify.app', '.netlify.com'];
const SLOW_THRESHOLD_MS = 2000;
const DISMISS_KEY = 'cold-start-notice-dismissed';

function readMode(): Mode {
  if (typeof window === 'undefined') return 'auto';
  const raw = new URLSearchParams(window.location.search).get('coldstart');
  if (raw === 'show' || raw === 'hide' || raw === 'auto') return raw;
  return 'auto';
}

export function ColdStartNotice() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const mode = readMode();

    if (mode === 'hide') {
      setVisible(false);
      return;
    }
    if (mode === 'show') {
      setVisible(true);
      return;
    }

    const host = window.location.hostname;
    const isNetlify = NETLIFY_HOST_SUFFIXES.some((s) => host.endsWith(s));
    if (!isNetlify) return;
    if (sessionStorage.getItem(DISMISS_KEY)) return;
    if (performance.now() < SLOW_THRESHOLD_MS) return;

    setVisible(true);
  }, []);

  const dismiss = () => {
    setVisible(false);
    sessionStorage.setItem(DISMISS_KEY, '1');
  };

  if (!visible) return null;

  return (
    <div className="cold-notice" role="status">
      <Clock size={16} className="cold-notice__icon" aria-hidden="true" />
      <div className="cold-notice__body">
        <p className="cold-notice__title">Waking up the server…</p>
        <p className="cold-notice__text">
          First load on Netlify can take a few seconds while the server cold-starts. Each
          page loads fast after that.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss"
        className="cold-notice__close"
      >
        <X size={14} />
      </button>
    </div>
  );
}
