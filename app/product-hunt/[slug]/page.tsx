// app/products/[slug]/page.tsx

import React from 'react';
import { redirect } from 'next/navigation';
import Layout from '@/app/components/layout/Layout';
import { ClientVoteButton } from '@/app/components/vote/ClientVoteButton';
import { RemoveButton } from '@/app/components/product/RemoveProduct';
import EditButton from '@/app/components/product/EditProduct';
import { Comments } from '@/app/components/comments/CommentSection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import Image from 'next/image';


interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  const slug = params?.slug;

  if (!slug || typeof slug !== 'string') {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-20 text-center text-red-500">
          Invalid product URL.
        </div>
      </Layout>
    );
  }

  const supabase = createServerSupabaseClient();

  // Get product data
  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, description, url, created_at, posted_by, image_url')
    .eq('url', slug)
    .single();

  if (error || !product) {
    console.error("Product fetch error:", error);
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-20 text-center text-red-500">
          Product not found.
        </div>
      </Layout>
    );
  }

  const creationDate = new Date(product.created_at).toDateString();

  const session = await getServerSession(authOptions);

  const { data: adminData } = await supabase
    .from('admins')
    .select('email')
    .eq('email', session?.user?.email)
    .single();

  const isAdmin = !!adminData;
  const isOwner = session?.user?.id === product.posted_by;

return (
  <Layout>
    <div className="max-w-7xl mx-auto py-16 px-8 dotted-border-vertical border-x">
      <div className="flex flex-col md:flex-row gap-8 mb-8">
        {/* Image Section */}
        <div className="w-full md:w-48 h-48 flex-shrink-0">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={48}
              height={48}
              unoptimized // Required if domain not added to next.config.js
              className="rounded-lg object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
              <span className="text-gray-400 text-sm">No Image</span>
            </div>
          )}
        </div>

        {/* Content Section */}
        <div className="flex-grow">
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-lg text-gray-300 mb-6">{product.description}</p>
          <p className="text-sm text-gray-400">
            Created on: {new Date(product.created_at).toLocaleDateString()}
          </p>

          <div className="mt-6 flex gap-4 text-white">
            <ClientVoteButton productId={product.id} />
            {(isAdmin || isOwner) && (<>
                <EditButton product={product} />
                <RemoveButton
                  productId={product.id}
                  productName={product.name}
                  isOwner={isOwner}
                />
              </>
            )}
          </div>
        </div>
      </div>

      <Comments productId={product.id} />
    </div>
  </Layout>
);

}
