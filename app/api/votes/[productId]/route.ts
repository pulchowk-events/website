import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { insertNotification } from '@/lib/notifications';


// Interface for Vote
export interface Vote {
  id: number;
  user_id: string;
  product_id: number;
  type: 'upvote' | 'downvote';
  created_at: string;
}

// GET handler for retrieving votes for a specific product
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  // Access params safely
  const { productId } = await context.params;
  const productIdNum = parseInt(productId);
  
  if (isNaN(productIdNum)) {
    return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
  }

  const supabase = createServerSupabaseClient();
  const session = await getServerSession(authOptions);

  try {
    // Get all votes for this product
    const { data, error } = await supabase
      .from('votes')
      .select('type, user_id')
      .eq('product_id', productIdNum);

    if (error) throw error;

    // Count upvotes and downvotes
    const upvotes = data.filter(v => v.type === 'upvote').length;
    const downvotes = data.filter(v => v.type === 'downvote').length;

    // If user is logged in, check if they've voted for this product
    let userVote = null;
    if (session?.user?.id) {
      userVote = data.find(v => v.user_id === session.user.id)?.type || null;
    }

    return NextResponse.json({ upvotes, downvotes, userVote });
  } catch (error) {
    console.error(`Error fetching votes for product ${productIdNum}:`, error);
    return NextResponse.json({ error: 'Failed to fetch votes' }, { status: 500 });
  }
}

// POST handler for adding a vote
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ productId: string }> }
) {
  try {
    // Await the params
    const { productId } = await context.params;
    const productIdNum = parseInt(productId);
  
    if (isNaN(productIdNum)) {
      return NextResponse.json({ error: 'Invalid product ID' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { type } = await request.json();
    if (type !== 'upvote' && type !== 'downvote') {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    const supabase = createServerSupabaseClient();

    // Check if user is an admin
    const adminRes = await supabase
      .from('admins')
      .select('email')
      .eq('email', session.user.email)
      .single();
    
    const isAdmin = !!adminRes.data;

    // If not admin, check cooldown
    if (!isAdmin) {
      const userVoteTimeRes = await supabase
        .from('users')
        .select('last_voted_at')
        .eq('id', session.user.id)
        .single();

      const lastVotedAt = userVoteTimeRes.data?.last_voted_at;
      
      if (lastVotedAt) {
        const now = Date.now();
        const lastVoteTime = new Date(lastVotedAt).getTime();
        const diff = now - lastVoteTime;
        const COOLDOWN = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
        
        if (diff < COOLDOWN) {
          const remainingMs = COOLDOWN - diff;
          const hours = Math.floor(remainingMs / (1000 * 60 * 60));
          const minutes = Math.floor((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
          return NextResponse.json(
            { error: 'Cooldown period active', timeRemaining: `${hours}h ${minutes}m` },
            { status: 429 }
          );
        }
      }
    }

    // Insert the vote
    const { error: voteError } = await supabase.from('votes').insert({
      user_id: session.user.id,
      product_id: productIdNum,
      type,
    });

    if (voteError) throw voteError;

        
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('posted_by, name, url')
      .eq('id', productIdNum)
      .single();

    if (productError) {
      console.error('Error fetching product details:', productError);
    } else if (product && product.posted_by !== session.user.id) {
      try {
        await insertNotification(supabase, {
          user_id: product.posted_by,
          type: 'product_vote',
          title: `${session.user.name} ${type}d your product "${product.name}"`,
          link: `/product-hunt/${product.url}`,
          source_user_id: session.user.id
        });
      } catch (notificationError) {
        console.error('Error creating notification:', notificationError);
        // Don't throw - we don't want to fail the vote if notification fails
      }
    }

    // Increment vote count - first try RPC for efficiency, fall back to manual count if RPC unavailable
    try {
      await supabase.rpc('increment_vote_count', { pid: productIdNum, type });
    } catch (rpcError) {
      console.log('RPC function not available, falling back to manual vote counting');
      
      // Count votes directly if RPC fails
      const { data: voteCount } = await supabase
        .from('votes')
        .select('type')
        .eq('product_id', productIdNum);
      
      if (voteCount) {
        const upvotes = voteCount.filter(v => v.type === 'upvote').length;
        const downvotes = voteCount.filter(v => v.type === 'downvote').length;
        
        // Update the products table directly
        await supabase
          .from('products')
          .update({ 
            upvote_count: upvotes, 
            downvote_count: downvotes 
          })
          .eq('id', productIdNum);
      }
    }

    // Update last_voted_at timestamp (skip for admins if desired)
    if (!isAdmin) {
      const timestamp = new Date().toISOString();
      await supabase
        .from('users')
        .update({ last_voted_at: timestamp })
        .eq('id', session.user.id);
    }

    // Get updated counts
    const { data: updatedVotes } = await supabase
      .from('votes')
      .select('type')
      .eq('product_id', productIdNum);

    const upvotes = updatedVotes?.filter(v => v.type === 'upvote').length || 0;
    const downvotes = updatedVotes?.filter(v => v.type === 'downvote').length || 0;




    return NextResponse.json({ 
      success: true, 
      upvotes,
      downvotes,
      userVote: type,
      isAdmin,
      timeRemaining: isAdmin ? null : '24h 0m'  // Reset cooldown for non-admins
    });

  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json({ error: 'Failed to process vote' }, { status: 500 });
  }
}