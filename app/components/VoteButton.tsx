'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useSession } from 'next-auth/react';

export function VoteButton({
  productId,
  initialUpvotes,
  initialDownvotes,
  userLastVoteType,
  lastVotedAt,
}: {
  productId: number;
  initialUpvotes?: number;
  initialDownvotes?: number;
  userLastVoteType?: 'upvote' | 'downvote';
  lastVotedAt?: string;
}) {
  const [upvotes, setUpvotes] = useState<number | null>(initialUpvotes ?? null);
  const [downvotes, setDownvotes] = useState<number | null>(initialDownvotes ?? null);
  const [loading, setLoading] = useState(false);
  const [canVote, setCanVote] = useState(false);
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);

  const { data: session } = useSession();

  // Check if the user is an admin
  useEffect(() => {
    if (session?.user?.email) {
      const checkAdminStatus = async () => {
        const { data, error } = await supabase
          .from('admins')
          .select('email')
          .eq('email', session.user.email)
          .single();

        if (data && !error) {
          setIsAdmin(true);
          setCanVote(true); // Admins can always vote
        } else {
          setIsAdmin(false);
        }
      };

      checkAdminStatus();
    }
  }, [session?.user?.email]);

  // Check if user can vote based on cooldown
  useEffect(() => {
    if (!session?.user?.id) return;
    
    const checkVoteCooldown = () => {
      if (isAdmin) {
        setCanVote(true);
        return;
      }
      
      if (!lastVotedAt) {
        // First time voting or no previous vote
        setCanVote(true);
        return;
      }
      
      const lastVotedTime = new Date(lastVotedAt).getTime();
      const currentTime = new Date().getTime();
      const timeDiff = currentTime - lastVotedTime;
      const timeLimit = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
      
      if (timeDiff >= timeLimit) {
        // 24 hours have passed
        setCanVote(true);
        setTimeRemaining(null);
      } else {
        // Still in cooldown
        setCanVote(false);
        
        // Calculate time remaining
        const remainingMs = timeLimit - timeDiff;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        setTimeRemaining(`${hours}h ${minutes}m`);
      }
    };
    
    checkVoteCooldown();
    // Set interval to update cooldown timer
    const interval = setInterval(checkVoteCooldown, 60000); // Update every minute
    
    return () => clearInterval(interval);
  }, [lastVotedAt, session, isAdmin]);

  // Fetch votes
  useEffect(() => {
    async function fetchVotes() {
      const { data, error } = await supabase
        .from('votes')
        .select('type')
        .eq('product_id', productId);

      if (error) {
        console.error(error);
        return;
      }

      const up = data?.filter((vote: any) => vote.type === 'upvote').length || 0;
      const down = data?.filter((vote: any) => vote.type === 'downvote').length || 0;

      setUpvotes(up);
      setDownvotes(down);
    }

    fetchVotes();
  }, [productId]);

  async function handleVote(type: 'upvote' | 'downvote') {
    if (!session?.user?.id) {
      setShowLoginMessage(true);
      return;
    }

    if (!canVote) return;

    setLoading(true);

    // Record the vote
    const { error } = await supabase.from('votes').insert({
      user_id: session.user.id,
      product_id: productId,
      type,
    });

    if (!error) {
      // Update the UI counts
      if (type === 'upvote') {
        setUpvotes((prev) => (prev ?? 0) + 1);
      } else {
        setDownvotes((prev) => (prev ?? 0) + 1);
      }

      // Update vote count on product
      await supabase.rpc('increment_vote_count', { pid: productId, type });
      
      // Update user's last voted timestamp
      await supabase
        .from('users')
        .update({ last_voted_at: new Date().toISOString() })
        .eq('id', session.user.id);
      
      // Update local state to prevent voting again until refresh
      setCanVote(isAdmin); // Only admins can vote multiple times
    }

    setLoading(false);
  }

  const isDisabled = loading || !canVote || !session?.user?.id;

  const totalVotes = upvotes !== null && downvotes !== null ? upvotes - downvotes : 'N/A';

  return (
      <div className="flex flex-row items-center gap-0">
      <button
        onClick={() => handleVote('upvote')}
        disabled={isDisabled}
        className="px-2 py-1 rounded-full font-medium text-sm hover:cursor-pointer"
        title={!canVote && timeRemaining ? `You can vote again in ${timeRemaining}` : ''}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className={`transition ${
            isDisabled ? 'stroke-gray-400' : 'stroke-green-500 hover:stroke-green-600'
          }`}
        >
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="m16 12l-4-4l-4 4m4 4V8" />
          </g>
        </svg>
      </button>

      <p className="text-sm font-semibold text-gray-300">{totalVotes}</p>

      <button
        onClick={() => handleVote('downvote')}
        disabled={isDisabled}
        className="px-2 py-1 rounded-full font-medium text-sm  hover:cursor-pointer"
        title={!canVote && timeRemaining ? `You can vote again in ${timeRemaining}` : ''}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          className={`transition ${
            isDisabled ? 'stroke-gray-400' : 'stroke-red-500 hover:stroke-red-600'
          }`}
        >
          <g fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 8v8m-4-4l4 4l4-4" />
          </g>
        </svg>
      </button>

      {showLoginMessage && !session?.user?.id && (
        <p className="text-red-500 text-sm mt-1">Please log in to vote</p>
      )}
    </div>

  );
}