'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { useSession } from 'next-auth/react';

type VoteType = 'upvote' | 'downvote';

interface VoteState {
  productVotes: Record<number, { upvotes: number; downvotes: number }>;
  userVotes: Record<number, VoteType | null>;
  canVote: boolean;
  isAdmin: boolean;
  timeRemaining: string | null;
  loadingStates: Record<number, boolean>;
  votesLoading: Record<number, boolean>;
}

interface VoteContextType extends VoteState {
  handleVote: (productId: number, type: VoteType) => Promise<void>;
  refreshVotes: (productId: number) => Promise<void>;
  showLoginMessage: boolean;
  setShowLoginMessage: (show: boolean) => void;
}

const VoteContext = createContext<VoteContextType | null>(null);

export function useVotes() {
  const context = useContext(VoteContext);
  if (!context) {
    throw new Error('useVotes must be used within a VoteProvider');
  }
  return context;
}

export function VoteProvider({ children }: { children: ReactNode }) {
  const { data: session, status: sessionStatus } = useSession();
  const [productVotes, setProductVotes] = useState<VoteState['productVotes']>({});
  const [userVotes, setUserVotes] = useState<VoteState['userVotes']>({});
  const [canVote, setCanVote] = useState<boolean>(false);
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  const [loadingStates, setLoadingStates] = useState<VoteState['loadingStates']>({});
  const [votesLoading, setVotesLoading] = useState<VoteState['votesLoading']>({});
  const [showLoginMessage, setShowLoginMessage] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  // Fetch user's vote status (can vote, is admin, etc.)
  const fetchVoteStatus = useCallback(async () => {
    if (sessionStatus === 'loading') return;
    
    if (!session?.user?.id) {
      setCanVote(false);
      setIsAdmin(false);
      return;
    }

    setStatusLoading(true);
    
    try {
      const response = await fetch('/api/votes/status');
      if (!response.ok) throw new Error('Failed to fetch vote status');
      
      const data = await response.json();
      
      setCanVote(data.canVote);
      setIsAdmin(data.isAdmin);
      setTimeRemaining(data.timeRemaining);
    } catch (error) {
      console.error('Error fetching vote status:', error);
    } finally {
      setStatusLoading(false);
    }
  }, [session?.user?.id, sessionStatus]);

  // Refresh vote status periodically if not admin and couldn't vote
  useEffect(() => {
    if (!session?.user?.id || isAdmin || canVote || statusLoading) return;
    
    const interval = setInterval(() => {
      fetchVoteStatus();
    }, 60 * 1000); // Update every minute
    
    return () => clearInterval(interval);
  }, [session?.user?.id, isAdmin, canVote, statusLoading, fetchVoteStatus]);

  // Initial fetch of vote status when session changes
  useEffect(() => {
    fetchVoteStatus();
  }, [fetchVoteStatus, sessionStatus]);

  // Fetch votes for a specific product
  const fetchVotesForProduct = useCallback(async (productId: number) => {
    setVotesLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const response = await fetch(`/api/votes/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch votes');
      
      const data = await response.json();
      
      setProductVotes(prev => ({
        ...prev,
        [productId]: { 
          upvotes: data.upvotes,
          downvotes: data.downvotes 
        },
      }));

      if (session?.user?.id) {
        setUserVotes(prev => ({
          ...prev,
          [productId]: data.userVote,
        }));
      }
    } catch (error) {
      console.error(`Error fetching votes for product ${productId}:`, error);
    } finally {
      setVotesLoading(prev => ({ ...prev, [productId]: false }));
    }
  }, [session?.user?.id]);

  // Function to refresh votes for a product
  const refreshVotes = useCallback(async (productId: number) => {
    await fetchVotesForProduct(productId);
  }, [fetchVotesForProduct]);

  // Handle voting
  const handleVote = async (productId: number, type: VoteType) => {
    if (sessionStatus === 'loading' || statusLoading) {
      return;
    }

    if (!session?.user?.id) {
      setShowLoginMessage(true);
      return;
    }

    if (!canVote && !isAdmin) return;

    setLoadingStates(prev => ({ ...prev, [productId]: true }));

    try {
      const response = await fetch(`/api/votes/${productId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type }),
      });

      if (!response.ok) {
        if (response.status === 429) { // Rate limit (cooldown)
          const data = await response.json();
          setTimeRemaining(data.timeRemaining);
          setCanVote(false);
          throw new Error(`Vote cooldown: ${data.timeRemaining} remaining`);
        }
        throw new Error('Failed to submit vote');
      }

      const data = await response.json();
      
      // Update state with response data
      setUserVotes(prev => ({
        ...prev,
        [productId]: data.userVote,
      }));

      setProductVotes(prev => ({
        ...prev,
        [productId]: {
          upvotes: data.upvotes,
          downvotes: data.downvotes,
        },
      }));

      // Update cooldown status for non-admins
      if (!data.isAdmin) {
        setCanVote(false);
        setTimeRemaining(data.timeRemaining);
      }

    } catch (error) {
      console.error('Error voting:', error);
      // Refresh status to ensure accurate state
      fetchVoteStatus();
    } finally {
      setLoadingStates(prev => ({ ...prev, [productId]: false }));
    }
  };

  return (
    <VoteContext.Provider
      value={{
        productVotes,
        userVotes,
        canVote,
        isAdmin,
        timeRemaining,
        loadingStates,
        votesLoading,
        handleVote,
        refreshVotes,
        showLoginMessage,
        setShowLoginMessage,
      }}
    >
      {children}
    </VoteContext.Provider>
  );
}