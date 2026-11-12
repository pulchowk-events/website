'use client';

import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/react';
import { Monitor, Moon, Sun, Check } from 'lucide-react';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const Icon = !mounted ? Sun : resolvedTheme === 'dark' ? Moon : Sun;

  return (
    <Menu as="div" className="theme-toggle">
      <MenuButton aria-label="Toggle theme" className="theme-toggle__btn">
        <Icon size={16} />
      </MenuButton>

      <MenuItems anchor="bottom end" transition className="theme-toggle__menu">
        <MenuItem>
          {({ focus }) => (
            <button
              type="button"
              onClick={() => setTheme('light')}
              className={'theme-toggle__item' + (focus ? ' theme-toggle__item--focus' : '')}
            >
              <Sun size={14} />
              <span>Light</span>
              {mounted && theme === 'light' && <Check size={12} className="theme-toggle__check" />}
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button
              type="button"
              onClick={() => setTheme('dark')}
              className={'theme-toggle__item' + (focus ? ' theme-toggle__item--focus' : '')}
            >
              <Moon size={14} />
              <span>Dark</span>
              {mounted && theme === 'dark' && <Check size={12} className="theme-toggle__check" />}
            </button>
          )}
        </MenuItem>
        <MenuItem>
          {({ focus }) => (
            <button
              type="button"
              onClick={() => setTheme('system')}
              className={'theme-toggle__item' + (focus ? ' theme-toggle__item--focus' : '')}
            >
              <Monitor size={14} />
              <span>System</span>
              {mounted && theme === 'system' && <Check size={12} className="theme-toggle__check" />}
            </button>
          )}
        </MenuItem>
      </MenuItems>
    </Menu>
  );
}
