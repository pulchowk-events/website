import { supabase } from '@/app/lib/supabase';
import Layout from '@/app/components/layout/Layout';
import { ProductCard } from '@/app/components/ProductCard';
import ClientVoteCooldownNotice from '@/app/components/ClientVoteCooldown';

export const dynamic = 'force-dynamic';

interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  created_at: string;
  approved: boolean;
}

export default async function ProductHuntPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('approved', true)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
    return (
      <Layout>
        <div className="max-w-4xl mx-auto py-20 text-center text-red-500">
          Error loading products.
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-10 px-4">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
          <ClientVoteCooldownNotice />
        </div>
        <div className="grid gap-6">
          {products && products.length > 0 ? (
            products.map((product: Product) => (
              <ProductCard key={product.id} product={product} />
            ))
          ) : (
            <p className="text-center text-gray-400">No products found.</p>
          )}
        </div>
      </div>
    </Layout>
  );
}
