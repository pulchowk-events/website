import { supabase } from '../lib/supabase'
import { ProductCard } from '../components/ProductCard'
import Layout from '../components/layout/Layout'

interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  votes: number;
  created_at: string;
  approved: boolean;
}

export default async function ProductHuntPage() {
  const { data: products, error } = await supabase
    .from('products')
    .select('*')
    .eq('approved', true)
    .order('votes', { ascending: false });

  if (error) {
    console.error('Error fetching products:', error);
  }

  return (
    <Layout>
      <div className="max-w-6xl mx-auto py-12 px-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Products</h1>
          <a 
            href="https://forms.google.com/your-form-link" 
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white text-black hover:bg-gray-100 font-medium py-2 px-4 rounded-full transition"
          >
            + Add Product
          </a>
        </div>

        <div className="space-y-4">
          {products?.map((product: Product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </Layout>
  )
}
