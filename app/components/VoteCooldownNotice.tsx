'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export default function VoteCooldownNotice() {
  const { data: session } = useSession();
  const [timeLeft, setTimeLeft] = useState<string | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAdmin() {
      if (!session?.user?.email) return;
      const { data } = await supabase
        .from('admins')
        .select('email')
        .eq('email', session.user.email)
        .single();

      setIsAdmin(!!data);
    }

    async function fetchVoteTime() {
      if (!session?.user?.id) return;

      const { data, error } = await supabase
        .from('users')
        .select('last_voted_at')
        .eq('id', session.user.id)
        .single();

      if (error || !data?.last_voted_at) {
        setTimeLeft(null);
        return;
      }

      const lastVoted = new Date(data.last_voted_at).getTime();
      const now = new Date().getTime();
      const diff = 24 * 60 * 60 * 1000 - (now - lastVoted);

      if (diff > 0 || isAdmin) {
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeLeft(`${pad(hours)}h ${pad(minutes)}m ${pad(seconds)}s`);
      } else {
        setTimeLeft("00h 00m 00s");
      }
    }

    function pad(num: number): string {
      return num.toString().padStart(2, '0');
    }

    checkAdmin().then(fetchVoteTime);

    // Auto-refresh timer every second
    const interval = setInterval(() => {
      checkAdmin().then(fetchVoteTime);
    }, 1000);

    return () => clearInterval(interval);
  }, [session, isAdmin]);

  if (!timeLeft) return null;

return (
  <div
    className={`bg-black-100 border border-gray-800 text-gray-300 h-10 flex flex-row gap-2 items-center py-2 px-4 rounded-full transition text-sm w-fit font-medium ${
      isAdmin || timeLeft === '00h 00m 00s' ? 'opacity-0' : 'opacity-100'
    }`}
  >
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
      <g fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
        <path d="M10 2h4m-2 12l3-3" />
        <circle cx="12" cy="14" r="8" />
      </g>
    </svg>
    <span className="font-semibold">{timeLeft}</span>
  </div>
);

}
