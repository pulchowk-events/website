// app/products/[slug]/page.tsx

import React from 'react';
import { redirect } from 'next/navigation';
import Layout from '@/app/components/layout/Layout';
import { ClientVoteButton } from '@/app/components/ClientVoteButton';
import { RemoveButton } from '@/app/components/RemoveProduct';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';

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
    .select('id, name, description, url, created_at')
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

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        <p className="text-lg text-gray-300 mb-6">{product.description}</p>
        <p className="text-sm text-gray-400">Created on: {creationDate}</p>

        <div className="mt-6 flex gap-4 text-white">
          <ClientVoteButton productId={product.id} />
          {isAdmin && (
            <RemoveButton
              productId={product.id}
              productName={product.name}
            />
          )}
        </div>
      </div>
    </Layout>
  );
}
