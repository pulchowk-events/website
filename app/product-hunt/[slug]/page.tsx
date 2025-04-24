// This is an ***** of how you *would* use React.use() in a Server Component
// This specific ***** won't directly apply to your existing client component
// but illustrates the concept for future scenarios.

import React from 'react';
import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import { ClientVoteButton } from '@/app/components/ClientVoteButton';

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  // In a Server Component, params is a promise-like object.
  // React.use() would be used to unwrap it.
  const { slug } = params; // Direct access is still supported for now

  // If params were a Promise, you would do:
  // const { slug } = await params; // Or React.use(params) in a Server Component

  const { data: product, error } = await supabase
    .from('products')
    .select('id, name, description, url, created_at')
    .eq('url', slug)
    .single();

  if (error || !product) {
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-20 text-center text-red-500">
          Product not found.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-3xl mx-auto py-16 px-4">
        <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
        <p className="text-lg text-gray-300 mb-6">{product.description}</p>
        <p className="text-sm text-gray-400">Created on: {new Date(product.created_at).toDateString()}</p>

        <div className="mt-6 flex gap-4 text-white">
          <ClientVoteButton productId={product.id} />
        </div>
      </div>
    </Layout>
  );
}