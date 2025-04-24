'use client';

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
  useCallback,
} from 'react';
import { supabase } from './supabase';
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
  const [lastVotedAt, setLastVotedAt] = useState<string | null>(null);
  const [userDataFetched, setUserDataFetched] = useState(false);

  // This function checks the cooldown and updates canVote accordingly
  const checkVoteCooldown = useCallback((lastVoted: string | null) => {
    if (!lastVoted || isAdmin) {
      setCanVote(!!session?.user?.id);
      setTimeRemaining(null);
      return;
    }

    const now = Date.now();
    const lastVoteTime = new Date(lastVoted).getTime();
    const diff = now - lastVoteTime;
    const COOLDOWN = 24 * 60 * 60 * 1000;

    if (diff >= COOLDOWN) {
      setCanVote(true);
      setTimeRemaining(null);
    } else {
      setCanVote(false);
      const remainingMs = COOLDOWN - diff;
      const hours = Math.floor(remainingMs / (1000 * 60 * 60));
      const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      setTimeRemaining(`${hours}h ${minutes}m`);
    }
  }, [isAdmin, session?.user?.id]);

  // Fetch admin status and last voted time only when session changes
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    
    // If not logged in, set defaults and exit
    if (!session?.user?.email || !session?.user?.id) {
      setCanVote(false);
      setIsAdmin(false);
      setUserDataFetched(true);
      return;
    }

    let isMounted = true;
    const fetchUserData = async () => {
      try {
        // Check if admin
        const adminRes = await supabase
          .from('admins')
          .select('email')
          .eq('email', session.user.email)
          .single();

        if (!isMounted) return;
        
        if (adminRes.data) {
          setIsAdmin(true);
          setCanVote(true);
        } else {
          setIsAdmin(false);
        }

        // Get last voted time
        const userVoteTimeRes = await supabase
          .from('users')
          .select('last_voted_at')
          .eq('id', session.user.id)
          .single();

        if (!isMounted) return;
        
        const lastVotedTime = userVoteTimeRes.data?.last_voted_at || null;
        setLastVotedAt(lastVotedTime);
        
        // Now that we have the lastVotedAt, determine if the user can vote
        checkVoteCooldown(lastVotedTime);
        
        setUserDataFetched(true);
      } catch (error) {
        console.error('Error fetching user data:', error);
        if (isMounted) {
          setCanVote(false);
          setUserDataFetched(true);
        }
      }
    };

    fetchUserData();
    
    return () => {
      isMounted = false;
    };
  }, [session, sessionStatus, checkVoteCooldown]);

  // Setup interval for cooldown timer (separate from data fetching)
  useEffect(() => {
    if (!session?.user?.id || isAdmin) return;
    
    const interval = setInterval(() => {
      checkVoteCooldown(lastVotedAt);
    }, 60 * 1000);
    
    return () => clearInterval(interval);
  }, [lastVotedAt, session?.user?.id, isAdmin, checkVoteCooldown]);

  // Fetch votes for a product - using useCallback to avoid regenerating this function
  const fetchVotesForProduct = useCallback(async (productId: number) => {
    setVotesLoading(prev => ({ ...prev, [productId]: true }));
    
    try {
      const { data, error } = await supabase
        .from('votes')
        .select('type, user_id')
        .eq('product_id', productId);

      if (error) throw error;

      if (data) {
        const up = data.filter(v => v.type === 'upvote').length;
        const down = data.filter(v => v.type === 'downvote').length;

        setProductVotes(prev => ({
          ...prev,
          [productId]: { upvotes: up, downvotes: down },
        }));

        if (session?.user?.id) {
          const userVote = data.find(v => v.user_id === session.user.id)?.type as VoteType || null;
          setUserVotes(prev => ({
            ...prev,
            [productId]: userVote,
          }));
        }
      }
    } catch (error) {
      console.error(`Error fetching votes for product ${productId}:`, error);
    } finally {
      setVotesLoading(prev => ({ ...prev, [productId]: false }));
    }
  }, [session?.user?.id]);

  // Memoize refreshVotes to avoid regenerating on each render
  const refreshVotes = useCallback(async (productId: number) => {
    await fetchVotesForProduct(productId);
  }, [fetchVotesForProduct]);

  // Handle vote logic
  const handleVote = async (productId: number, type: VoteType) => {
    if (sessionStatus === 'loading' || !userDataFetched) {
      return; // Block votes until session and initial checks are complete
    }
    
    if (!session?.user?.id) {
      setShowLoginMessage(true);
      return;
    }

    if (!canVote && !isAdmin) return;

    // Set loading state immediately
    setLoadingStates(prev => ({ ...prev, [productId]: true }));
    
    // For non-admins, immediately disable voting
    if (!isAdmin) {
      setCanVote(false);
    }

    const currentVote = userVotes[productId];
    if (currentVote === type) {
      setLoadingStates(prev => ({ ...prev, [productId]: false }));
      return; // Prevent duplicate votes
    }

    try {
      // Attempt to insert the vote
      const { error } = await supabase.from('votes').insert({
        user_id: session.user.id,
        product_id: productId,
        type,
      });

      if (error) throw error;

      // Optimistically update UI state
      setUserVotes(prev => ({
        ...prev,
        [productId]: type,
      }));
      
      setProductVotes(prev => {
        const votes = prev[productId] || { upvotes: 0, downvotes: 0 };
        return {
          ...prev,
          [productId]: {
            upvotes: type === 'upvote' ? votes.upvotes + 1 : votes.upvotes,
            downvotes: type === 'downvote' ? votes.downvotes + 1 : votes.downvotes,
          },
        };
      });

      // Update total vote count in the product table
      await supabase.rpc('increment_vote_count', { pid: productId, type });

      // Update the last voted timestamp
      const timestamp = new Date().toISOString();
      await supabase.from('users').update({ last_voted_at: timestamp }).eq('id', session.user.id);
      
      // Update last voted time
      setLastVotedAt(timestamp);
      
      // Refresh the actual vote counts
      refreshVotes(productId);
    } catch (error) {
      console.error('Error voting:', error);
      // Reset canVote if voting fails and user is not admin
      if (!isAdmin) {
        checkVoteCooldown(lastVotedAt);
      }
    } finally {
      // Reset loading state
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