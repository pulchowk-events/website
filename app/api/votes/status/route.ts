import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';

export async function GET(request: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ 
      canVote: false,
      isAdmin: false,
      timeRemaining: null,
      authenticated: false
    });
  }

  try {
    const supabase = createServerSupabaseClient();
    
    // Check if user is an admin
    const adminRes = await supabase
      .from('admins')
      .select('email')
      .eq('email', session.user.email)
      .single();
    
    const isAdmin = !!adminRes.data;

    // If admin, they can always vote
    if (isAdmin) {
      return NextResponse.json({
        canVote: true,
        isAdmin: true,
        timeRemaining: null,
        authenticated: true
      });
    }

    // Get last voted time for regular users
    const userVoteTimeRes = await supabase
      .from('users')
      .select('last_voted_at')
      .eq('id', session.user.id)
      .single();

    const lastVotedAt = userVoteTimeRes.data?.last_voted_at;
    
    // Calculate cooldown
    let canVote = true;
    let timeRemaining = null;

    if (lastVotedAt) {
      const now = Date.now();
      const lastVoteTime = new Date(lastVotedAt).getTime();
      const diff = now - lastVoteTime;
      const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours
      
      if (diff < COOLDOWN) {
        canVote = false;
        const remainingMs = COOLDOWN - diff;
        const hours = Math.floor(remainingMs / (1000 * 60 * 60));
        const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
        timeRemaining = `${hours}h ${minutes}m`;
      }
    }

    return NextResponse.json({
      canVote,
      isAdmin,
      timeRemaining,
      authenticated: true,
      lastVotedAt
    });

  } catch (error) {
    console.error('Error checking vote status:', error);
    return NextResponse.json(
      { error: 'Failed to check vote status' },
      { status: 500 }
    );
  }
}