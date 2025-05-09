// components/Navbar.tsx

'use client';

import Link from 'next/link';
import { useSession, signIn, signOut } from 'next-auth/react';
import { useEffect, useState } from 'react';

export default function Navbar() {
  const { data: session, status } = useSession();
  const [isAdmin, setIsAdmin] = useState<boolean | null>(null); // null indicates loading

useEffect(() => {
  const checkAdminStatus = async () => {
    if (!session?.user?.email) return setIsAdmin(false);

    try {
      const response = await fetch(`/api/admin/checkAdmin?email=${session.user.email}`);

      // Log the response text to inspect it
      const responseText = await response.text();
      console.log('API Response:', responseText);

      // Attempt to parse as JSON
      const data = JSON.parse(responseText);

      setIsAdmin(data.isAdmin);
    } catch (error) {
      console.error('Error checking admin status:', error);
      setIsAdmin(false);
    }
  };

  if (status === 'authenticated') {
    checkAdminStatus();
  }
}, [session, status]);


  return (
    <nav className="sticky top-0 z-50 border-b border-gray-700 py-4 px-6 bg-black">
      <div className="max-w-6xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl">
          <span className="text-white font-medium">Pulchowk Events</span>
        </Link>

        <div className="flex items-center space-x-6">
          <Link href="/product-hunt" className="hover:text-white/80 transition-colors">
            Product Hunt
          </Link>
          <Link href="/about" className="hover:text-white/80 transition-colors">
            About
          </Link>
          {isAdmin && (
            <Link href="/admin" className="hover:text-white/80 transition-colors">
              Admin Panel
            </Link>
          )}
          {session ? (
            <>
              <span className="text-white">Hello, {session.user?.name}</span>
              <button
                onClick={() => signOut()}
                className="bg-red-500 hover:bg-red-600 text-white py-2 px-4 rounded"
              >
                Sign Out
              </button>
            </>
          ) : (
            <button
              onClick={() => signIn('discord')}
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded"
            >
              Sign In with Discord
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
