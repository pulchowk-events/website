import Link from 'next/link';
import { ClientVoteButton } from './ClientVoteButton';

interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  created_at: string;
  approved: boolean;
  posted_by: string;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg flex flex-col gap-4 items-start">
      <div className="flex items-center space-x-4">
        <div className="flex-grow">
          <Link href={`/product-hunt/${product.url}`} className="block">
            <h3 className="text-xl font-bold hover:text-white/80 transition-colors">
              {product.name}
            </h3>
            <p className="text-gray-400 mt-1">{product.description}</p>
          </Link>
        </div>
        
        <div className="ml-4">

        </div>
      </div>
      <ClientVoteButton productId={product.id} />
    </div>
  );
}