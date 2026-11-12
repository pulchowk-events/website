'use client';

import { useVotes } from '@/app/lib/VoteContext';
import { useSession } from 'next-auth/react';
import { useEffect, useRef, useState } from 'react';
import SignInModal from '@/app/components/signIn/SignInModal';

function VoteIcon({ direction, filled }: { direction: 'up' | 'down'; filled: boolean }) {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      className={'vote__icon' + (filled ? ' vote__icon--filled' : '')}
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      {direction === 'up' ? (
        <path d="M16 12l-4-4l-4 4M12 16V8" />
      ) : (
        <path d="M12 8v8M8 12l4 4l4-4" />
      )}
    </svg>
  );
}

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
    userVotes,
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
  const isLoadingData = status === 'loading' || isVotesLoading;
  const cooldownActive = !!session?.user?.id && !canVote && !isAdmin && !!timeRemaining;

  const handleVoteAttempt = (voteType: 'upvote' | 'downvote') => {
    if (!session?.user?.id) {
      setShowSignInModal(true);
      return;
    }
    handleVote(productId, voteType);
  };

  if (status === 'loading') {
    return (
      <div className="vote" aria-busy="true">
        <span className="skeleton" style={{ width: 28, height: 28, borderRadius: 99 }} />
        <span className="skeleton" style={{ width: 20, height: 14 }} />
        <span className="skeleton" style={{ width: 28, height: 28, borderRadius: 99 }} />
      </div>
    );
  }

  const title = cooldownActive && timeRemaining ? 'You can vote again in ' + timeRemaining : undefined;
  const disabled = loading || isLoadingData;

  return (
    <>
      <div className="vote">
        <button
          type="button"
          onClick={() => handleVoteAttempt('upvote')}
          disabled={disabled}
          className={
            'vote__btn vote__btn--up' +
            (userVoteType === 'upvote' ? ' vote__btn--active' : '') +
            (cooldownActive ? ' vote__btn--cooldown' : '')
          }
          title={title}
          aria-label="Upvote"
          aria-pressed={userVoteType === 'upvote'}
        >
          <VoteIcon direction="up" filled={userVoteType === 'upvote'} />
        </button>

        {isVotesLoading ? (
          <span className="vote__count vote__count--loading">–</span>
        ) : (
          <span className="vote__count">{totalVotes}</span>
        )}

        <button
          type="button"
          onClick={() => handleVoteAttempt('downvote')}
          disabled={disabled}
          className={
            'vote__btn vote__btn--down' +
            (userVoteType === 'downvote' ? ' vote__btn--active' : '') +
            (cooldownActive ? ' vote__btn--cooldown' : '')
          }
          title={title}
          aria-label="Downvote"
          aria-pressed={userVoteType === 'downvote'}
        >
          <VoteIcon direction="down" filled={userVoteType === 'downvote'} />
        </button>

        {showLoginMessage && !session?.user?.id && (
          <p className="vote__hint">Sign in to vote</p>
        )}
      </div>

      <SignInModal
        isOpen={showSignInModal}
        onClose={() => setShowSignInModal(false)}
      />
    </>
  );
}
