'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Menu, X, Bell, Home, Users,
        Calendar, Gift, LayoutGrid, Search as SearchIcon, LucideMail,
        LucideBox, LucideHammer,
        LucideCircleUser } from 'lucide-react';
import NotificationDropdown from '@/app/components/layout/NotificationDropdown';
import SignInModal from '@/app/components/signIn/SignInModal';
import { ThemeToggle } from '@/app/components/layout/ThemeToggle';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const [activeNav, setActiveNav] = useState('/');
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  const router = useRouter();

  const handleSearch = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const searchQuery = (e.currentTarget.elements.namedItem('search') as HTMLInputElement).value;
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery)}`);
      setShowMobileSearch(false);
    }
  };

  useEffect(() => {
    setActiveNav(window.location.pathname);
  }, []);

  useEffect(() => {
    const checkAdminStatus = async () => {
      if (!session?.user?.email) {
        setIsAdmin(false);
        return;
      }

      try {
        const response = await fetch(
          `/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`,
          {
            method: 'GET',
            headers: {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              'Pragma': 'no-cache',
              'Expires': '0'
            }
          }
        );

        if (!response.ok) {
          console.error('Admin check failed:', response.status);
          setIsAdmin(false);
          return;
        }

        const data = await response.json();
        setIsAdmin(data.isAdmin === true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    if (status === 'authenticated') {
      checkAdminStatus();
    } else {
      setIsAdmin(false);
    }
  }, [session, status]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowMobileNotifications(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowMobileSearch(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleAvatarClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMenu(prev => !prev);
  };

  const toggleMobileNotifications = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMobileNotifications(prev => !prev);
    if (!showMobileNotifications) {
      setShowMobileMenu(false);
      setShowMobileSearch(false);
    }
  };

  const toggleMobileSearch = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowMobileSearch(prev => !prev);
    if (!showMobileSearch) {
      setShowMobileMenu(false);
      setShowMobileNotifications(false);
    }
  };

  const handleSignInClick = () => {
    setShowSignInModal(true);
  };

  const navLinks = [
    { href: '/', label: 'Home', icon: Home },
    { href: '/events', label: 'Events', icon: Calendar },
    { href: '/product-hunt', label: 'Product Hunt', icon: LucideBox },
    { href: '/about', label: 'About', icon: LucideHammer },
  ];

  const allLinks = isAdmin === true
    ? [...navLinks, { href: '/admin', label: 'Admin Panel', icon: LayoutGrid }]
    : navLinks;

  return (
    <>
      {/* Desktop Navbar - Top Position */}
      <nav className="sticky top-0 z-40 border-b h-16 border-border bg-background/90 backdrop-blur-lg shadow-lg hidden md:flex">
        <div className="max-w-8xl mx-auto w-full h-full relative flex items-center px-4">

          {/* Left: Logo + Search */}
          <div className="flex items-center gap-4 w-1/3 min-w-0">
            <Link href="/" className="text-2xl flex items-center h-full text-foreground font-medium whitespace-nowrap">
              Pulchowk Events
            </Link>
            <form onSubmit={handleSearch} className="flex-1 max-w-sm">
              <div className="relative">
                <input
                  type="search"
                  name="search"
                  placeholder="Search anything..."
                  className="w-full bg-secondary border border-border rounded-full py-2 pl-4 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <SearchIcon size={18} />
                </button>
              </div>
            </form>
          </div>

          {/* Center: Nav Links */}
          <div className="absolute left-1/2 transform -translate-x-1/2 flex h-full items-center">
            <div className="flex items-center">
              {navLinks.map((link) => {
                const isActive = activeNav === link.href;
                const Icon = link.icon;

                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`flex items-center justify-center h-16 w-16 border-b-4 transition-colors ${
                      isActive
                        ? 'border-green-500 text-green-600 dark:text-green-400'
                        : 'border-transparent hover:bg-accent text-muted-foreground'
                    }`}
                    title={link.label}
                  >
                    <Icon size={24} />
                  </Link>
                );
              })}

              {isAdmin && (
                <Link
                  href="/admin"
                  className={`flex items-center justify-center h-16 w-16 border-b-4 transition-colors ${
                    activeNav === '/admin'
                      ? 'border-green-500 text-green-600 dark:text-green-400'
                      : 'border-transparent hover:bg-accent text-muted-foreground'
                  }`}
                  title="Admin Panel"
                >
                  <LayoutGrid size={24} />
                </Link>
              )}
            </div>
          </div>

          {/* Right: Theme + Notifications + Profile */}
          <div className="flex items-center justify-end w-1/3 space-x-3 ml-auto">
            <ThemeToggle />
            {session && <NotificationDropdown />}
            {session ? (
              <div className="relative" ref={menuRef} onClick={handleAvatarClick}>
                <div className="flex items-center space-x-3 cursor-pointer">
                  <div className="relative w-10 h-10">
                    <Image
                      src={session.user.image || '/default-avatar.png'}
                      alt={session.user?.name || 'User avatar'}
                      className="rounded-full border border-border"
                      fill
                      sizes="40px"
                    />
                    <span className="absolute -bottom-0 -left-1 w-3 h-3 rounded-full bg-green-500 border-2 border-background"></span>
                  </div>
                </div>

                {showMenu && (
                  <div className="absolute right-0 mt-2 w-60 bg-popover border border-border rounded-lg shadow-lg z-50">
                    <div className="p-3 border-b border-border">
                      <div className="flex items-center space-x-3">
                        <div className="relative w-12 h-12">
                          <Image
                            src={session.user.image || '/default-avatar.png'}
                            alt={session.user?.name || 'User avatar'}
                            className="rounded-full"
                            fill
                            sizes="48px"
                          />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{session.user?.name || 'Anonymous'}</p>
                          <p className="text-xs text-muted-foreground">See your profile</p>
                        </div>
                      </div>
                    </div>
                    <Link
                      href={`/profile/${session.user.id}`}
                      className="block px-4 py-3 text-sm text-foreground hover:bg-accent flex items-center gap-3"
                    >
                      <div className="bg-muted p-2 rounded-full">
                        <Users size={16} />
                      </div>
                      <span>Profile</span>
                    </Link>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        signOut();
                      }}
                      className="w-full px-4 py-3 text-sm text-left text-foreground hover:bg-accent border-t border-border flex items-center gap-3"
                    >
                      <div className="bg-muted p-2 rounded-full">
                        <X size={16} />
                      </div>
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignInClick}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Top Header - Simplified */}
      <div className="md:hidden sticky top-0 z-40 border-b h-14 border-border bg-background/90 backdrop-blur-lg shadow-lg flex items-center justify-between px-4">
        <Link href="/" className="text-xl flex items-center">
          <span className="text-foreground font-medium">Pulchowk Events</span>
        </Link>

        <div className="flex items-center space-x-3">
          {session && (
            <>
              <div className="relative" ref={searchRef}>
                <button
                  onClick={toggleMobileSearch}
                  className="text-foreground p-2 rounded-full hover:bg-accent"
                  aria-label="Search"
                >
                  <SearchIcon size={20} />
                </button>

                {showMobileSearch && (
                  <div className="absolute -right-24 mt-2 w-screen max-w-xs bg-popover border border-border rounded-lg shadow-lg z-50">
                    <div className="p-3">
                      <form onSubmit={handleSearch} className="w-full">
                        <div className="relative">
                          <input
                            type="search"
                            name="search"
                            placeholder="Search..."
                            className="w-full bg-secondary border border-border rounded-full py-2 pl-4 pr-10 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                            autoFocus
                          />
                          <button
                            type="submit"
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          >
                            <SearchIcon size={18} />
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative" ref={notificationRef}>
                <button
                  onClick={toggleMobileNotifications}
                  className="text-foreground p-2 rounded-full hover:bg-accent"
                  aria-label="Show notifications"
                >
                  <Bell size={20} />
                </button>

                {showMobileNotifications && (
                  <div className="absolute mt-2 w-screen max-w-sm bg-popover border border-border rounded shadow-lg z-50 -right-4">
                    <div className="p-2">
                      <NotificationDropdown isMobile={true} />
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          <ThemeToggle />

          <button
            className="text-foreground p-1 md:hidden"
            onClick={() => {
              setShowMobileMenu(!showMobileMenu);
              setShowMobileNotifications(false);
              setShowMobileSearch(false);
            }}
            aria-label="Toggle mobile menu"
          >
            {showMobileMenu ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Bottom Navigation - Facebook Style */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 border-t border-border bg-background/95 backdrop-blur-lg shadow-lg">
        <div className="flex items-center justify-around h-16">
          {navLinks.map((link) => {
            const isActive = activeNav === link.href;
            const Icon = link.icon;

            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center justify-center flex-1 h-full border-t-2 transition-colors ${
                  isActive
                    ? 'border-green-500 text-green-600 dark:text-green-400'
                    : 'border-transparent text-muted-foreground'
                }`}
              >
                <div className="flex items-center justify-center">
                  <Icon size={22} />
                </div>
              </Link>
            );
          })}

          {session ? (
            <Link
              href={`/profile/${session.user.id}`}
              className={`flex items-center justify-center flex-1 h-full border-t-2 transition-colors ${
                activeNav.includes('/profile')
                  ? 'border-green-500'
                  : 'border-transparent'
              }`}
            >
              <div className="relative w-6 h-6">
                <Image
                  src={session.user.image || '/default-avatar.png'}
                  alt={session.user?.name || 'User avatar'}
                  className={`rounded-full border ${
                    activeNav.includes('/profile')
                      ? 'border-green-500'
                      : 'border-border'
                  }`}
                  fill
                  sizes="24px"
                />
              </div>
            </Link>
          ) : (
            <button
              onClick={handleSignInClick}
              className="flex items-center justify-center flex-1 h-full"
            >
              <LucideCircleUser size={22} className="text-muted-foreground" />
            </button>
          )}

          {isAdmin && (
            <Link
              href="/admin"
              className={`flex items-center justify-center flex-1 h-full border-t-2 transition-colors ${
                activeNav === '/admin'
                  ? 'border-green-500 text-green-600 dark:text-green-400'
                  : 'border-transparent text-muted-foreground'
              }`}
            >
              <div className="flex items-center justify-center">
                <LayoutGrid size={22} />
              </div>
            </Link>
          )}
        </div>
      </nav>

      {/* Mobile Full Screen Menu */}
      {showMobileMenu && (
        <div className="md:hidden fixed inset-0 z-30 bg-background/95 pt-16 pb-16">
          <div className="px-4 py-6 space-y-4">
            <form onSubmit={handleSearch} className="w-full mb-4">
              <div className="relative">
                <input
                  type="search"
                  name="search"
                  placeholder="Search..."
                  className="w-full bg-secondary border border-border rounded-full py-3 pl-5 pr-12 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
                <button
                  type="submit"
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <SearchIcon size={20} />
                </button>
              </div>
            </form>

            {session ? (
              <div className="flex items-center space-x-3 p-4 bg-card border border-border rounded-lg">
                <div className="relative w-12 h-12">
                  <Image
                    src={session.user.image || '/default-avatar.png'}
                    alt={session.user?.name || 'User avatar'}
                    className="rounded-full border border-border"
                    fill
                    sizes="48px"
                  />
                </div>
                <div>
                  <p className="font-semibold text-foreground">{session.user?.name || 'Anonymous'}</p>
                  <p className="text-xs text-muted-foreground">{session.user?.email}</p>
                </div>
              </div>
            ) : (
              <button
                onClick={handleSignInClick}
                className="w-full bg-green-600 hover:bg-green-700 transition-colors text-white rounded-lg py-3 px-4 text-center font-medium"
              >
                Sign In
              </button>
            )}

            <div className="space-y-1 mt-4">
              {allLinks.map((link) => {
                const Icon = link.icon;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="flex items-center space-x-3 py-3 px-4 hover:bg-accent rounded-lg text-foreground"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Icon size={22} className="text-muted-foreground" />
                    <span className="font-medium">{link.label}</span>
                  </Link>
                );
              })}
            </div>

            {session && (
              <button
                onClick={() => {
                  signOut();
                  setShowMobileMenu(false);
                }}
                className="flex items-center space-x-3 py-3 px-4 mt-6 text-red-500 dark:text-red-400 w-full hover:bg-accent rounded-lg border border-border"
              >
                <X size={22} />
                <span className="font-medium">Sign Out</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Sign In Modal */}
      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </>
  );
}