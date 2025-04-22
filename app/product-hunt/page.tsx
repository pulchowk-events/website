import { supabase } from '../lib/supabase'
import { ProductCard } from '../components/ProductCard'
import Layout from '../components/layout/Layout'
import VoteCooldownNotice from '../components/VoteCooldownNotice';


interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  created_at: string;
  approved: boolean;
  upvotes: number;
  downvotes: number;
}

export default async function ProductHuntPage() {
  const { data: rawProducts, error } = await supabase
    .from('products')
    .select('*, votes(type)')
    .eq('approved', true);

  if (error) {
    console.error('Error fetching products:', error);
    return null;
  }

  const products: Product[] = rawProducts.map((product: any) => {
    const votes = product.votes || [];
    const upvotes = votes.filter((v: any) => v.type === 'up').length;
    const downvotes = votes.filter((v: any) => v.type === 'down').length;

    return {
      id: product.id,
      name: product.name,
      description: product.description,
      url: product.url,
      created_at: product.created_at,
      approved: product.approved,
      upvotes,
      downvotes,
    };
  });

  return (
<Layout>
  <div className="max-w-6xl mx-auto py-12 px-6">
 

    <div className="flex justify-between items-center align-middle mb-8">
      <h1 className="text-3xl font-bold">Products</h1>
      <div className= "flex flex-row gap-2 ">   
        <div>
          <VoteCooldownNotice />
            </div>
          <a
              href="https://forms.google.com/your-form-link" 
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white text-black hover:bg-gray-100 font-medium py-2 px-4 h-10 rounded-full transition"
            >
              + Add Product
            </a>
    </div>
 
    </div>

    <div className="space-y-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  </div>
</Layout>

  );
}
