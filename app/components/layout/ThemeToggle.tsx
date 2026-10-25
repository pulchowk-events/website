'use client'

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react'
import { Monitor, Moon, Sun, Check } from 'lucide-react'
import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  // Default to Sun before mount so SSR markup is deterministic
  const Icon = !mounted
    ? Sun
    : resolvedTheme === 'dark'
      ? Moon
      : Sun

  return (
    <Menu as="div" className="relative">
      <MenuButton
        aria-label="Toggle theme"
        className="inline-flex h-10 w-10 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground focus:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <Icon size={20} />
      </MenuButton>

      <MenuItems
        anchor="bottom end"
        transition
        className="z-50 mt-2 w-36 origin-top-right rounded-lg border border-border bg-popover p-1 text-popover-foreground shadow-lg transition duration-100 ease-out focus:outline-none data-[closed]:scale-95 data-[closed]:opacity-0"
      >
        <MenuItem>
          {({ focus }) => (
            <button
              onClick={() => setTheme('light')}
              className={`${focus ? 'bg-accent text-accent-foreground' : ''} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}
            >
              <Sun size={16} />
              <span>Light</span>
              {mounted && theme === 'light' && <Check size={14} className="ml-auto" />}
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button
              onClick={() => setTheme('dark')}
              className={`${focus ? 'bg-accent text-accent-foreground' : ''} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}
            >
              <Moon size={16} />
              <span>Dark</span>
              {mounted && theme === 'dark' && <Check size={14} className="ml-auto" />}
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button
              onClick={() => setTheme('system')}
              className={`${focus ? 'bg-accent text-accent-foreground' : ''} flex w-full items-center gap-2 rounded-md px-3 py-2 text-sm`}
            >
              <Monitor size={16} />
              <span>System</span>
              {mounted && theme === 'system' && <Check size={14} className="ml-auto" />}
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  )
}