'use client'

import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

type Mode = 'auto' | 'show' | 'hide'

const NETLIFY_HOST_SUFFIXES = ['.netlify.app', '.netlify.com']
const SLOW_THRESHOLD_MS = 2000
const DISMISS_KEY = 'cold-start-notice-dismissed'

function readMode(): Mode {
  if (typeof window === 'undefined') return 'auto'
  const raw = new URLSearchParams(window.location.search).get('coldstart')
  if (raw === 'show' || raw === 'hide' || raw === 'auto') return raw
  return 'auto'
}

export function ColdStartNotice() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const mode = readMode()

    if (mode === 'hide') {
      setVisible(false)
      return
    }

    if (mode === 'show') {
      setVisible(true)
      return
    }

    const host = window.location.hostname
    const isNetlify = NETLIFY_HOST_SUFFIXES.some((s) => host.endsWith(s))
    if (!isNetlify) return
    if (sessionStorage.getItem(DISMISS_KEY)) return
    if (performance.now() < SLOW_THRESHOLD_MS) return

    setVisible(true)
  }, [])

  const dismiss = () => {
    setVisible(false)
    sessionStorage.setItem(DISMISS_KEY, '1')
  }

  if (!visible) return null

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-lg border border-border bg-popover/95 p-3 text-sm text-foreground shadow-xl backdrop-blur">
      <div className="flex items-start gap-3">
        <span className="mt-0.5 select-none"><Clock width={16}/></span>
        <div className="flex-1">
          <p className="font-medium text-foreground">Waking up the server…</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            First load on Netlify can take a few seconds while the server cold-starts. Each page will load fast after it builds at least once.
          </p>
        </div>
        <button
          type="button"
          onClick={dismiss}
          aria-label="Dismiss"
          className="rounded p-1 text-muted-foreground transition hover:bg-accent hover:text-foreground"
        >
          ✕
        </button>
      </div>
    </div>
  )
}