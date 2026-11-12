'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useSession, signOut } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import {
  Menu, X, Search, Home, Calendar, Briefcase,
  MessageCircle, Info, Heart, LayoutGrid, LucideBox, User, HelpCircle,
} from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import SignInModal from '@/app/components/signIn/SignInModal';
import { ThemeToggle } from './ThemeToggle';
import { useIsAdmin } from '@/app/hooks/useIsAdmin';

const NAV_LINKS = [
  { href: '/events', label: 'Events', icon: Calendar },
  { href: '/jobs', label: 'Jobs', icon: Briefcase },
  { href: '/product-hunt', label: 'Projects', icon: LucideBox },
  { href: '/lounge', label: 'Lounge', icon: MessageCircle },
  { href: '/faq', label: 'FAQ', icon: HelpCircle },
  { href: '/donate', label: 'Donate', icon: Heart },
];

export default function Navbar() {
  const { data: session } = useSession();
  const isAdmin = useIsAdmin();
  const pathname = usePathname();
  const router = useRouter();

  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [avatarOpen, setAvatarOpen] = useState(false);
  const [signInOpen, setSignInOpen] = useState(false);

  const avatarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (avatarRef.current && !avatarRef.current.contains(e.target as Node)) {
        setAvatarOpen(false);
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setAvatarOpen(false);
        setDrawerOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    setAvatarOpen(false);
  }, [pathname]);

  const links = isAdmin === true
    ? [...NAV_LINKS, { href: '/admin', label: 'Admin', icon: LayoutGrid }]
    : NAV_LINKS;

  const goSearch = () => router.push('/search');
  const active = (href: string) => pathname === href || pathname?.startsWith(href + '/');

  return (
    <>
      <header className="navbar" data-scrolled={scrolled}>
        <button
          className="navbar__hamburger"
          onClick={() => setDrawerOpen(true)}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>

        <Link href="/" className="navbar__logo">
          Pulchowk Events
        </Link>

        <button className="navbar__search" onClick={goSearch} type="button">
          <Search size={14} />
          <span>Search</span>
        </button>

        <div className="navbar__actions">
          <ThemeToggle />
          {session && (
            <div className="navbar__icon-slot">
              <NotificationDropdown />
            </div>
          )}
          {session ? (
            <div className="navbar__avatar-wrap" ref={avatarRef}>
              <button
                className="navbar__avatar"
                onClick={() => setAvatarOpen((v) => !v)}
                aria-label="Account menu"
                aria-expanded={avatarOpen}
              >
                <Image
                  src={session.user.image || '/default-avatar.png'}
                  alt={session.user.name || 'User'}
                  fill
                  sizes="28px"
                  className="navbar__avatar-img"
                />
              </button>
              {avatarOpen && (
                <div className="navbar__menu" role="menu">
                  <div className="navbar__menu-head">
                    <p className="navbar__menu-name">{session.user.name || 'Anonymous'}</p>
                    <p className="navbar__menu-email">{session.user.email}</p>
                  </div>
                  <Link
                    href={'/profile/' + session.user.id}
                    className="navbar__menu-item"
                    onClick={() => setAvatarOpen(false)}
                  >
                    <User size={14} />
                    Profile
                  </Link>
                  <button
                    className="navbar__menu-item"
                    onClick={() => { setAvatarOpen(false); signOut(); }}
                  >
                    <X size={14} />
                    Sign out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              className="btn btn--primary btn--sm"
              onClick={() => setSignInOpen(true)}
            >
              <span className="btn__label">Sign in</span>
              <span className="btn__label btn__label--dup" aria-hidden="true">Sign in</span>
            </button>
          )}
        </div>
      </header>

      {drawerOpen && (
        <div className="navbar__drawer-scrim" onClick={() => setDrawerOpen(false)} />
      )}

      <aside
        className={'navbar__drawer' + (drawerOpen ? ' navbar__drawer--open' : '')}
        aria-hidden={!drawerOpen}
      >
        <div className="navbar__drawer-head">
          <Link href="/" className="navbar__logo" onClick={() => setDrawerOpen(false)}>
            Pulchowk Events
          </Link>
          <button
            className="navbar__hamburger"
            onClick={() => setDrawerOpen(false)}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>
        <nav>
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <Link
                key={l.href}
                href={l.href}
                className="sidebar__link"
                aria-current={active(l.href) ? 'page' : undefined}
                onClick={() => setDrawerOpen(false)}
              >
                <Icon size={16} />
                <span>{l.label}</span>
              </Link>
            );
          })}
        </nav>
      </aside>

      <SignInModal isOpen={signInOpen} onClose={() => setSignInOpen(false)} />
    </>
  );
}
