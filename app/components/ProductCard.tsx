import { VoteButton } from './VoteButton';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { supabase } from '../lib/supabase';

interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  created_at: string;
  approved: boolean;
}

export async function ProductCard({ product }: { product: Product }) {
  const session = await getServerSession(authOptions);

  // Get the most recent vote by the user (to check if the user already voted)
  const { data: lastVote } = session?.user?.id
    ? await supabase
        .from('votes')
        .select('type, created_at')
        .eq('user_id', session.user.id)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null };

  // Get the user's last voted timestamp
  const { data: user } = session?.user?.id
    ? await supabase
        .from('users')
        .select('last_voted_at')
        .eq('id', session.user.id)
        .single()
    : { data: null };

  return (
    <div className="bg-gray-800 p-6 rounded-lg flex flex-col gap-4 items-start">
      <div className="flex items-center space-x-4">
        <div className="flex-grow">
          <a href={product.url} className="block">
            <h3 className="text-xl font-bold hover:text-primary transition-colors">
              {product.name}
            </h3>
            <p className="text-gray-400 mt-1">{product.description}</p>
          </a>
        </div>
        
        <div className="ml-4">
          <button className="text-sm bg-primary hover:bg-primary-dark text-white py-1 px-3 rounded-full transition">
            Join
          </button>
        </div>
      </div>
              <VoteButton 
          productId={product.id}
          initialUpvotes={0}  // These will be fetched dynamically
          initialDownvotes={0}
          userLastVoteType={lastVote?.type}
          lastVotedAt={user?.last_voted_at}
        />
    </div>
  );
}
