import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';
import { isAdmin } from '@/app/lib/isAdmin';
import { revalidateTag } from 'next/cache';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ productId: string }> }
) {
  try {
    const { productId } = await params;
    const numericProductId = Number(productId);
    if (isNaN(numericProductId)) {
      return NextResponse.json({ error: 'Invalid product ID format' }, { status: 400 });
    }

    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const { data: product, error: productError } = await supabase
      .from('products')
      .select('posted_by, image_url')
      .eq('id', numericProductId)
      .single();

    if (productError || !product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    const admin = await isAdmin(session.user.email);
    if (!admin && product.posted_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this product' },
        { status: 403 }
      );
    }

    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const url = formData.get('url') as string;
    const imageFile = formData.get('image') as File | null;
    const redirectUrl = formData.get('redirect_url') as string;

    if (!name || !description || !url) {
      return NextResponse.json({ error: 'All fields are required' }, { status: 400 });
    }

    if (redirectUrl) {
      try {
        new URL(redirectUrl);
      } catch {
        return NextResponse.json({ error: 'Invalid redirect URL format' }, { status: 400 });
      }
    }

    const urlRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!urlRegex.test(url)) {
      return NextResponse.json(
        { error: 'URL must be lowercase with hyphens only' },
        { status: 400 }
      );
    }

    let imagePath = product.image_url;
    if (imageFile) {
      try {
        const imageSizeMB = imageFile.size / (1024 * 1024);
        if (imageSizeMB > 0.1) {
          return NextResponse.json({ error: 'Image must be less than 100KB — resize first' }, { status: 400 });
        }
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = 'product-' + numericProductId + '-' + Date.now() + '.' + fileExtension;

        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageFile.type,
          });

        if (uploadError) throw uploadError;

        const { data: publicUrl } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);

        if (product.image_url) {
          const oldFileName = product.image_url.split('/product-images/').pop();
          if (oldFileName) {
            await supabase.storage.from('product-images').remove([oldFileName]);
          }
        }

        imagePath = publicUrl.publicUrl;
      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        const detail = uploadError instanceof Error ? uploadError.message : (uploadError as { message?: string })?.message;
        return NextResponse.json({ error: 'Failed to upload image', details: detail }, { status: 500 });
      }
    }

    const { error: updateError } = await supabase
      .from('products')
      .update({
        name,
        description,
        url,
        image_url: imagePath,
        redirect_url: redirectUrl || null,
      })
      .eq('id', numericProductId);

    if (updateError) {
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    revalidateTag("products", "max");

    return NextResponse.json(
      { success: true, data: { name, url, image_url: imagePath } },
      { status: 200 }
    );
  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
