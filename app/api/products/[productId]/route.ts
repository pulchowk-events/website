import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/auth';
import { supabase } from '@/app/lib/supabase';

export const dynamic = 'force-dynamic';

export async function PUT(
  request: Request,
  { params }: { params: { productId: string } }
) {
  try {
    // 1. Parse and validate parameters
    const { productId } = params;
    const numericProductId = Number(productId);
    
    if (isNaN(numericProductId)) {
      return NextResponse.json(
        { error: 'Invalid product ID format' },
        { status: 400 }
      );
    }

    // 2. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id || !session.user.email) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // 3. Get existing product data
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('posted_by, image_url')
      .eq('id', numericProductId)
      .single();

    if (productError || !product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // 4. Check admin privileges
    let isAdmin = false;
    try {
      const adminCheck = await fetch(
        `${process.env.NEXTAUTH_URL}/api/admin/checkAdmin?email=${encodeURIComponent(session.user.email)}`
      );
      const adminResult = await adminCheck.json();
      isAdmin = adminResult.isAdmin;
    } catch (error) {
      console.error('Admin check failed:', error);
    }

    // 5. Authorization check
    if (!isAdmin && product.posted_by !== session.user.id) {
      return NextResponse.json(
        { error: 'Unauthorized to update this product' },
        { status: 403 }
      );
    }

    // 6. Process form data
    const formData = await request.formData();
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const url = formData.get('url') as string;
    const imageFile = formData.get('image') as File | null;
    const redirectUrl = formData.get('redirect_url') as string;


    // 7. Validate inputs
    if (!name || !description || !url) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (redirectUrl) {
  try {
    new URL(redirectUrl);
  } catch {
    return NextResponse.json(
      { error: 'Invalid redirect URL format' },
      { status: 400 }
    );
  }
}

    const urlRegex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
    if (!urlRegex.test(url)) {
      return NextResponse.json(
        { error: 'URL must be lowercase with hyphens only' },
        { status: 400 }
      );
    }

    // 8. Handle image upload
    let imagePath = product.image_url;
    
    if (imageFile) {
      try {
        // Basic size validation
        const imageSizeMB = imageFile.size / (1024 * 1024);
        if (imageSizeMB > 1) {
          return NextResponse.json(
            { error: 'Image must be less than 1MB' },
            { status: 400 }
          );
        }

        // Generate unique filename
        const fileExtension = imageFile.name.split('.').pop();
        const fileName = `product-${numericProductId}-${Date.now()}.${fileExtension}`;

        // Upload new image
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, imageFile, {
            cacheControl: '3600',
            upsert: false,
            contentType: imageFile.type
          });

        if (uploadError) throw uploadError;

        // Get public URL
        const { data: publicUrl } = supabase.storage
          .from('product-images')
          .getPublicUrl(uploadData.path);

        // Delete old image if exists
        if (product.image_url) {
          const oldFileName = product.image_url.split('/product-images/').pop();
          if (oldFileName) {
            await supabase.storage
              .from('product-images')
              .remove([oldFileName]);
          }
        }

        imagePath = publicUrl.publicUrl;

      } catch (uploadError) {
        console.error('Image upload failed:', uploadError);
        return NextResponse.json(
          { error: 'Failed to upload image' },
          { status: 500 }
        );
      }
    }

    // 9. Update product in database
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
      return NextResponse.json(
        { error: updateError.message },
        { status: 500 }
      );
    }

    // 10. Return success response
    return NextResponse.json(
      { 
        success: true,
        data: {
          name,
          url,
          image_url: imagePath
        }
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}