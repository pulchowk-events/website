// app/components/ProductCard.tsx

import { VoteButton } from './VoteButton';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/auth';
import { supabase } from '../lib/supabase';

interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  votes: number;
  created_at: string;
}

export async function ProductCard({ product }: { product: Product }) {
  const session = await getServerSession(authOptions);
  
  const { data: lastVote } = session?.user?.id 
    ? await supabase
        .from('votes')
        .select('created_at')
        .eq('user_id', session.user.id)
        .eq('product_id', product.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
    : { data: null };

  return (
    <div className="bg-gray-800 p-6 rounded-lg flex items-start">
      <VoteButton 
        productId={product.id}
        initialVotes={product.votes}
        userLastVoteTime={lastVote?.created_at}
      />
      
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
  );
}