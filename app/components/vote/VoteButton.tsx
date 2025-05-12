'use client';

import { useVotes } from '@/app/lib/VoteContext';
import { useSession, signIn } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import SignInModal from '@/app/components/signIn/SignInModal';

export function VoteButton({ productId }: { productId: number }) {
  const {
    productVotes,
    handleVote,
    canVote,
    isAdmin,
    timeRemaining,
    loadingStates,
    votesLoading,
    refreshVotes,
    showLoginMessage,
    setShowLoginMessage,
    userVotes
  } = useVotes();

  const { data: session, status } = useSession();
  const loading = loadingStates[productId] || false;
  const isVotesLoading = votesLoading[productId] || false;
  const hasInitialized = useRef(false);
  const [showSignInModal, setShowSignInModal] = useState(false);

  // Only fetch votes once when the component mounts or productId changes
  useEffect(() => {
    if (!hasInitialized.current) {
      refreshVotes(productId);
      hasInitialized.current = true;
    }
  }, [productId, refreshVotes]);

  const votes = productVotes[productId] || { upvotes: 0, downvotes: 0 };
  const userVoteType = userVotes[productId];
  const totalVotes = votes.upvotes - votes.downvotes;

  // Enhanced loading check to include vote data loading
  const isLoadingData =
    status === 'loading' || 
    isVotesLoading;

  // Handle vote attempt when not logged in
  const handleVoteAttempt = (voteType: 'upvote' | 'downvote') => {
    if (!session?.user?.id) {
      // Show the sign-in modal instead of just a message
      setShowSignInModal(true);
      return;
    }
    
    // If logged in, proceed with normal vote handling
    handleVote(productId, voteType);
  };

  // Show loading state for votes count and buttons
  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-gray-600 animate-pulse" />
        <p className="text-sm text-gray-400 animate-pulse">Loading session...</p>
      </div>
    );
  }

  // Check if user can vote (either they're logged in and can vote, or they're an admin)
  const canUserVote = (session?.user?.id && canVote) || isAdmin;
  
  // Button is disabled during loading or if user has already voted and cooldown is active
  const isDisabled = isLoadingData || loading || (session?.user?.id && !canUserVote);

  return (
    <>
      <div className="flex flex-row items-center gap-0">
        <button
          onClick={() => handleVoteAttempt('upvote')}
          disabled={isLoadingData || loading}
          className="px-2 py-1 rounded-full font-medium text-sm hover:cursor-pointer"
          title={session?.user?.id && !canVote && timeRemaining ? `You can vote again in ${timeRemaining}` : ''}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className={`transition ${
              isDisabled
                ? 'stroke-gray-400'
                : userVoteType === 'upvote'
                ? 'stroke-green-600 fill-green-600'
                : 'stroke-green-500 hover:stroke-green-600'
            }`}
          >
            <g fill={userVoteType === 'upvote' ? 'none' : 'none'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="m16 12l-4-4l-4 4m4 4V8" />
            </g>
          </svg>
        </button>

        {isVotesLoading ? (
          <p className="text-sm font-semibold text-gray-400 animate-pulse w-6 text-center">-</p>
        ) : (
          <p className="text-sm font-semibold text-gray-300">{totalVotes}</p>
        )}

        <button
          onClick={() => handleVoteAttempt('downvote')}
          disabled={isLoadingData || loading}
          className="px-2 py-1 rounded-full font-medium text-sm hover:cursor-pointer"
          title={session?.user?.id && !canVote && timeRemaining ? `You can vote again in ${timeRemaining}` : ''}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            className={`transition ${
              isDisabled
                ? 'stroke-gray-400'
                : userVoteType === 'downvote'
                ? 'stroke-red-600 fill-red-600'
                : 'stroke-red-500 hover:stroke-red-600'
            }`}
          >
            <g fill={userVoteType === 'downvote' ? 'currentColor' : 'none'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8m-4-4l4 4l4-4" />
            </g>
          </svg>
        </button>

        {showLoginMessage && !session?.user?.id && (
          <p className="text-red-500 text-sm mt-1 ml-2">Please log in to vote</p>
        )}
      </div>

      {/* Sign In Modal */}
      <SignInModal 
        isOpen={showSignInModal} 
        onClose={() => setShowSignInModal(false)} 
      />
    </>
  );
}