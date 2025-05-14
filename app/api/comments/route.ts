// app/api/comments/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase'; // Regular Supabase client
import { insertNotification } from '@/lib/notifications';


export async function POST(request: Request) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { comment, product_id } = await request.json();

  if (!comment?.trim() || !product_id) {
    return NextResponse.json(
      { error: 'Comment and product ID are required' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .insert({
        comment: comment.trim(),
        product_id,
        user_id: session.user.id,
      })
      .select()
      .single();

    if (error) throw error;

        if (product_id) {
      const { data: product } = await supabase
        .from('products')
        .select('posted_by, name, url')
        .eq('id', product_id)
        .single();

      if (product) {
        await insertNotification(supabase, {
          user_id: product.posted_by,
          type: 'product_comment',
          title: `${session.user.name} commented on your product "${product.name}"`,
          link: `/product-hunt/${product.url}`,
          source_user_id: session.user.id
        });
      }
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const productId = searchParams.get('product_id');
  
  if (!productId) {
    return NextResponse.json(
      { error: 'Product ID is required' },
      { status: 400 }
    );
  }

  try {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('product_id', productId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json(data || []);
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}