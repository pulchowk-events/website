// app/products/[slug]/page.tsx

import React from 'react';
import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import { ClientVoteButton } from '@/app/components/ClientVoteButton';

interface Props {
  params: { slug: string };
}

export default async function ProductPage({ params }: Props) {
  try {
    // Safely extract slug
    const slug = params?.slug;
    console.log("Slug:", slug);

    if (!slug || typeof slug !== 'string') {
      console.error("Slug is undefined, empty, or not a string");
      return (
        <Layout>
          <div className="max-w-3xl mx-auto py-20 text-center text-red-500">
            Invalid product URL.
          </div>
        </Layout>
      );
    }

    // Try fetching from Supabase
    let product = null;
    let error = null;

    try {
      const result = await supabase
        .from('products')
        .select('id, name, description, url, created_at')
        .eq('url', slug)
        .single();

      product = result.data;
      error = result.error;

      console.log("Product Query Result:", { product, error });
    } catch (fetchError) {
      console.error("Unexpected error while querying Supabase:", fetchError);
      return (
        <Layout>
          <div className="max-w-3xl mx-auto py-20 text-center text-red-500">
            Failed to load product data.
          </div>
        </Layout>
      );
    }

    if (error || !product) {
      console.error("Supabase returned error or product is null:", error);
      return (
        <Layout>
          <div className="max-w-3xl mx-auto py-20 text-center text-red-500">
            Product not found.
          </div>
        </Layout>
      );
    }

    // Safely render the page
    let creationDate = 'Unknown';
    try {
      creationDate = new Date(product.created_at).toDateString();
    } catch (dateError) {
      console.error("Failed to format product creation date:", dateError);
    }

    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-16 px-4">
          <h1 className="text-4xl font-bold mb-4">{product.name}</h1>
          <p className="text-lg text-gray-300 mb-6">{product.description}</p>
          <p className="text-sm text-gray-400">Created on: {creationDate}</p>

          <div className="mt-6 flex gap-4 text-white">
            {/* Safely render vote button */}
            {product.id ? (
              <ClientVoteButton productId={product.id} />
            ) : (
              <p className="text-red-400">Invalid product ID</p>
            )}
          </div>
        </div>
      </Layout>
    );
  } catch (unexpectedError) {
    console.error("Unhandled error in ProductPage:", unexpectedError);
    return (
      <Layout>
        <div className="max-w-3xl mx-auto py-20 text-center text-red-500">
          Internal server error. Please try again later.
        </div>
      </Layout>
    );
  }
}
