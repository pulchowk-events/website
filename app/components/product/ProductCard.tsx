import Link from 'next/link';
import Image from 'next/image';
import { ClientVoteButton } from '../vote/ClientVoteButton';

interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  created_at: string;
  approved: boolean;
  posted_by: string;
  image_url: string | null;
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-gray-800 p-6 rounded-lg flex flex-col gap-4 items-start">
      <div className="flex items-start space-x-4 w-full">
        <div className="w-24 h-24 flex-shrink-0">
          {product.image_url ? (
            <Image
              src={product.image_url}
              alt={product.name}
              width={96}
              height={96}
              unoptimized // Important for Supabase or external URLs
              className="rounded-lg object-cover w-full h-full"
            />
          ) : (
            <div className="w-full h-full bg-gray-700 rounded-lg" />
          )}
        </div>
        
        <div className="flex-grow">
          <Link href={`/product-hunt/${product.url}`} className="block flex flex-col gap-2">
            <div className="flex flex-col">
            <h3 className="text-xl font-bold hover:text-white/80 transition-colors">
              {product.name}
            </h3>
            <p className="text-gray-400 mt-1">{product.description}</p>
            </div>
          </Link>
            <ClientVoteButton productId={product.id} />

        </div>
      </div>

    </div>
  );
}
