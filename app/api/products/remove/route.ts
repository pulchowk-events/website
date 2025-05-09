// app/api/admin/remove-product/route.ts
import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email || !session.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { productId } = await request.json();

    // Fetch product details including posted_by
    const { data: product, error: fetchError } = await supabase
      .from('products')
      .select('image_url, posted_by')
      .eq('id', productId)
      .single();

    if (fetchError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Check admin status
    const adminCheck = await fetch(
      `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`
    );
    const { isAdmin } = await adminCheck.json();

    const isOwner = product.posted_by === session.user.id;

    if (!isAdmin && !isOwner) {
      return NextResponse.json(
        { error: 'Unauthorized to remove this product' },
        { status: 403 }
      );
    }

    // Delete associated votes
    const { error: voteError } = await supabase
      .from('votes')
      .delete()
      .eq('product_id', productId);

    if (voteError) {
      return NextResponse.json(
        { error: 'Failed to remove votes' },
        { status: 500 }
      );
    }

    // Delete product image
    if (product.image_url) {
      try {
        let filePath: string | null = null;

        if (product.image_url.includes('/storage/v1/object/')) {
          const publicBucketPath = product.image_url.split('/public/')[1];
          if (publicBucketPath) {
            const bucketAndPath = publicBucketPath.split('/');
            filePath = bucketAndPath.slice(1).join('/');
          }
        } else if (product.image_url.includes('/product-images/')) {
          filePath = product.image_url.split('/product-images/')[1];
        } else {
          const urlParts = product.image_url.split('/');
          filePath = urlParts[urlParts.length - 1];
        }

        if (filePath) {
          filePath = decodeURIComponent(filePath);
          const { error: storageError } = await supabase.storage
            .from('product-images')
            .remove([filePath]);

          if (storageError) {
            console.error('Image deletion failed:', storageError);
          }
        }
      } catch (error) {
        console.error('Image cleanup error:', error);
      }
    }

    // Delete product record
    const { error: productError } = await supabase
      .from('products')
      .delete()
      .eq('id', productId);

    if (productError) {
      return NextResponse.json(
        { error: 'Failed to remove product' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true }, { status: 200 });

  } catch (error) {
    console.error('Product removal error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
