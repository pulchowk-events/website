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

  useEffect(() => {
    if (!hasInitialized.current) {
      refreshVotes(productId);
      hasInitialized.current = true;
    }
  }, [productId, refreshVotes]);

  const votes = productVotes[productId] || { upvotes: 0, downvotes: 0 };
  const userVoteType = userVotes[productId];
  const totalVotes = votes.upvotes - votes.downvotes;

  const isLoadingData =
    status === 'loading' ||
    isVotesLoading;

  const handleVoteAttempt = (voteType: 'upvote' | 'downvote') => {
    if (!session?.user?.id) {
      setShowSignInModal(true);
      return;
    }
    handleVote(productId, voteType);
  };

  if (status === 'loading') {
    return (
      <div className="flex items-center gap-2">
        <div className="h-6 w-6 rounded-full bg-muted animate-pulse" />
        <p className="text-sm text-muted-foreground animate-pulse">Loading session...</p>
      </div>
    );
  }

  const canUserVote = (session?.user?.id && canVote) || isAdmin;
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
                ? 'stroke-muted-foreground/50'
                : userVoteType === 'upvote'
                ? 'stroke-green-600 dark:stroke-green-500 fill-green-600 dark:fill-green-500'
                : 'stroke-green-600 dark:stroke-green-500 hover:stroke-green-700 dark:hover:stroke-green-400'
            }`}
          >
            <g fill={userVoteType === 'upvote' ? 'none' : 'none'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="m16 12l-4-4l-4 4m4 4V8" />
            </g>
          </svg>
        </button>

        {isVotesLoading ? (
          <p className="text-sm font-semibold text-muted-foreground animate-pulse w-6 text-center">-</p>
        ) : (
          <p className="text-sm font-semibold text-foreground">{totalVotes}</p>
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
                ? 'stroke-muted-foreground/50'
                : userVoteType === 'downvote'
                ? 'stroke-red-600 dark:stroke-red-500 fill-red-600 dark:fill-red-500'
                : 'stroke-red-600 dark:stroke-red-500 hover:stroke-red-700 dark:hover:stroke-red-400'
            }`}
          >
            <g fill={userVoteType === 'downvote' ? 'currentColor' : 'none'} strokeLinecap="round" strokeLinejoin="round" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 8v8m-4-4l4 4l4-4" />
            </g>
          </svg>
        </button>

        {showLoginMessage && !session?.user?.id && (
          <p className="text-red-600 dark:text-red-500 text-sm mt-1 ml-2">Please log in to vote</p>
        )}
      </div>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </>
  );
}