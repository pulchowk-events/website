'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Calendar, Briefcase, LucideBox, MessageCircle,
  Info, Heart, LayoutGrid, Home,
} from 'lucide-react';
import { useIsAdmin } from '@/app/hooks/useIsAdmin';

const GROUPS = [
  {
    label: 'Browse',
    items: [
      { href: '/', label: 'Home', icon: Home },
      { href: '/events', label: 'Events', icon: Calendar },
      { href: '/jobs', label: 'Jobs', icon: Briefcase },
      { href: '/product-hunt', label: 'Projects', icon: LucideBox },
      { href: '/lounge', label: 'Lounge', icon: MessageCircle },
    ],
  },
  {
    label: 'Community',
    items: [
      { href: '/donate', label: 'Donate', icon: Heart },
      { href: '/about', label: 'About', icon: Info },
    ],
  },
];

export default function Sidebar() {
  const pathname = usePathname();
  const isAdmin = useIsAdmin();

  const groups = isAdmin === true
    ? [...GROUPS, { label: 'Admin', items: [{ href: '/admin', label: 'Dashboard', icon: LayoutGrid }] }]
    : GROUPS;

  const active = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(href + '/');

  return (
    <aside className="sidebar" aria-label="Primary navigation">
      {groups.map((g) => (
        <div key={g.label} className="sidebar__group">
          <p className="sidebar__group-label">{g.label}</p>
          {g.items.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="sidebar__link"
                aria-current={active(item.href) ? 'page' : undefined}
              >
                <Icon size={16} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      ))}
    </aside>
  );
}
