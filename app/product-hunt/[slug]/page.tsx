// app/product-hunt/[slug]/page.tsx

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
import { ExternalLink } from 'lucide-react';

interface Props {
  params: Promise<{ slug: string }>;
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;

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

  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, description, url, created_at, posted_by, image_url, redirect_url')
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
      <div className="max-w-7xl mx-auto py-16 px-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-full md:w-48 h-48 flex-shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={48}
                height={48}
                unoptimized
                className="rounded-lg object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-gray-700 rounded-lg flex items-center justify-center">
                <span className="text-gray-400 text-sm">No Image</span>
              </div>
            )}
          </div>

          <div className="flex-col flex gap-1 sm:gap-10">
            <div className='flex flex-col gap-1'>
              <h1 className="text-4xl font-bold">{product.name}</h1>
              <p className="text-lg text-gray-300">{product.description}</p>
              <p className="text-sm text-gray-400">
                Created on: {new Date(product.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-6 flex gap-4 text-white">
              <ClientVoteButton productId={product.id} />
              {(isAdmin || isOwner) && (
                <>
                  <EditButton product={product} />
                  <RemoveButton
                    productId={product.id}
                    productName={product.name}
                    isOwner={isOwner}
                  />
                </>
              )}

              {product.redirect_url && (
                <a
                  href={product.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <div className="hidden sm:block">
                    View Product
                  </div>
                </a>
              )}
            </div>
          </div>
        </div>

        <Comments productId={product.id} />
      </div>
    </Layout>
  );
}