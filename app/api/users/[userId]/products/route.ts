import { NextResponse } from 'next/server';
import { supabase } from '@/app/lib/supabase';

export async function GET(
  request: Request,
  { params }: { params: { userId: string } }
) {
  try {
    // Step 1: Get products by the user
    const { data: products, error: productsError } = await supabase
      .from('products')
      .select('*')
      .eq('posted_by', params.userId)
      .order('created_at', { ascending: false });

    if (productsError) throw productsError;

    const productIds = products?.map(p => p.id) || [];

    if (productIds.length === 0) {
      return NextResponse.json({ products: [] });
    }

    // Step 2: Get all votes for those products
    const { data: votes, error: votesError } = await supabase
      .from('votes')
      .select('product_id');

    if (votesError) throw votesError;

    // Step 3: Count votes per product_id
    const voteCountMap: Record<number, number> = {};

    for (const vote of votes) {
      if (productIds.includes(vote.product_id)) {
        voteCountMap[vote.product_id] = (voteCountMap[vote.product_id] || 0) + 1;
      }
    }

    // Step 4: Merge into product list
    const productsWithVoteCount = products.map(product => ({
      ...product,
      votes_count: voteCountMap[product.id] || 0,
    }));

    return NextResponse.json({ products: productsWithVoteCount });
  } catch (error) {
    console.error('Error fetching user products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch user products' },
      { status: 500 }
    );
  }
}
