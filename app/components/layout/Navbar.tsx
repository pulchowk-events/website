'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { Menu, X, Bell } from 'lucide-react';
import NotificationDropdown from '@/app/components/layout/NotificationDropdown';
import SignInModal from '@/app/components/signIn/SignInModal';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null indicates loading
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showMobileNotifications, setShowMobileNotifications] = useState(false);
  const [showSignInModal, setShowSignInModal] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const notificationRef = useRef<HTMLDivElement>(null);
  

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

        // Attempt to parse as JSON
        const data = await response.json();
        // Explicitly check for boolean true
        setIsAdmin(data.isAdmin === true);
      } catch (error) {
        console.error('Error checking admin status:', error);
        setIsAdmin(false);
      }
    };

    if (status === 'authenticated') {
      checkAdminStatus();
    }
    else {
      setIsAdmin(false);
    }
  }, [session, status]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setShowMobileNotifications(false);
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
    // Close the menu when opening notifications
    if (!showMobileNotifications) {
      setShowMobileMenu(false);
    }
  };

  const handleSignInClick = () => {
    setShowSignInModal(true);
  };

  // Update the navLinks array definition
  const baseNavLinks = [
    { href: '/lounge', label: 'Lounge' },
    { href: '/product-hunt', label: 'Product Hunt' },
    { href: '/about', label: 'About' },
  ];

  // Create a filtered navLinks array that depends on admin status
  const navLinks = isAdmin === true ? [...baseNavLinks, { href: '/admin', label: 'Admin Panel' }] : baseNavLinks;

  return (
    <>
      <nav className="sticky top-0 z-40 border-b h-16 dotted-border-horizontal border-gray-700 sm:px-6 bg-black bg-opacity-60 backdrop-blur-lg shadow-lg">
        <div className="sm:max-w-7xl mx-auto flex h-full justify-between items-center border-x px-4 md:px-8 dotted-border-vertical">
          <Link href="/" className="text-2xl h-full items-center flex">
            <span className="text-white font-medium">Pulchowk Events</span>
          </Link>

          {/* Mobile action buttons */}
          <div className="flex items-center space-x-4 md:hidden">
            {/* Mobile notification button */}
            {session && (
              <div className="relative" ref={notificationRef}>
                <button 
                  onClick={toggleMobileNotifications}
                  className="text-white p-2 rounded-full hover:bg-zinc-800"
                  aria-label="Show notifications"
                >
                  <Bell size={20} />
                </button>
                
                {/* Mobile notification dropdown */}
                {showMobileNotifications && (
                  <div className="absolute  mt-2 w-screen max-w-sm bg-zinc-900 border border-zinc-800 rounded shadow-lg z-50 -right-16">
                    <div className="p-2">
                      <NotificationDropdown isMobile={true} />
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Mobile menu button */}
            <button 
              className="text-white p-1"
              onClick={() => {
                setShowMobileMenu(!showMobileMenu);
                setShowMobileNotifications(false);
              }}
              aria-label="Toggle mobile menu"
            >
              {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-12">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href} 
                className="hover:text-white/80 transition-colors"
              >
                {link.label}
              </Link>
            ))}
            {session && <NotificationDropdown />}
            {session ? (
              <div className="relative" ref={menuRef} onClick={handleAvatarClick}>
                {/* Avatar block */}
                <div className="flex items-center space-x-3 pl-8 cursor-pointer border-l border-zinc-900/80 dotted-border-vertical h-full">
                  {/* Avatar with green status dot */}
                  <div className="relative w-10 h-10">
                    <Image
                      src={session.user.image || '/default-avatar.png'}
                      alt={session.user?.name || 'User avatar'}
                      className="rounded-full border border-zinc-700"
                      fill
                      sizes="40px"
                    />
                    <span className="absolute -bottom-0 -left-1 w-3 h-3 rounded-full bg-green-500 border-2 border-zinc-800"></span>
                  </div>

                  {/* Username and status */}
                  <div className="flex flex-col leading-tight">
                    <span className="text-sm font-medium text-white">{session.user?.name || 'Anonymous'}</span>
                    <span className="text-xs text-zinc-400">Online</span>
                  </div>
                </div>

                {/* Dropdown Menu */}
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-40 bg-zinc-900 border border-zinc-800 rounded shadow-lg z-50">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        signOut();
                      }}
                      className="w-full px-4 py-2 text-sm text-center text-white hover:bg-zinc-800"
                    >
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <button
                onClick={handleSignInClick}
                className="relative inline-flex h-10 w-24 overflow-hidden rounded-md p-[0.8px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-50"
              >
                <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#A0E9FF_0%,#3B82F6_50%,#A0E9FF_100%)]" />
                <span className="inline-flex h-full w-full items-center justify-center rounded-md bg-blue-500 text-sm font-medium text-white backdrop-blur-xl hover:bg-blue-600 transition-colors duration-200">
                  Sign In
                </span>
              </button>
            )}
          </div>
        </div>

        {/* Mobile Navigation Menu */}
        {showMobileMenu && (
          <div className="md:hidden bg-black bg-opacity-95 absolute left-0 right-0 border-b border-gray-700">
            <div className="px-4 py-3 space-y-3">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href} 
                  className="block py-2 hover:text-white/80 transition-colors"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {link.label}
                </Link>
              ))}
              
              {session ? (
                <div className="pt-2 border-t border-gray-800">
                  <div className="flex items-center space-x-3 py-2">
                    <div className="relative w-8 h-8">
                      <Image
                        src={session.user.image || '/default-avatar.png'}
                        alt={session.user?.name || 'User avatar'}
                        className="rounded-full border border-zinc-700"
                        fill
                        sizes="32px"
                      />
                    </div>
                    <span className="text-sm font-medium text-white">{session.user?.name || 'Anonymous'}</span>
                  </div>
                  <button
                    onClick={() => signOut()}
                    className="w-full mt-2 text-sm text-left text-red-400 py-2"
                  >
                    Sign Out
                  </button>
                </div>
              ) : (
                <button onClick={handleSignInClick} className="relative inline-flex h-12 overflow-hidden rounded-full p-[1px] focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2 focus:ring-offset-blue-50">
                  <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#93c5fd_0%,#2563eb_50%,#93c5fd_100%)]" />
                  <span className="inline-flex h-full w-full cursor-pointer items-center justify-center rounded-full bg-blue-600 hover:bg-blue-700 px-16 py-1 text-sm font-medium text-white backdrop-blur-3xl">
                    Sign In
                  </span>
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Sign In Modal */}
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)} 
      />
    </>
  );
}