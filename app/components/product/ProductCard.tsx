import Link from 'next/link';
import Image from 'next/image';
import { ClientVoteButton } from '../vote/ClientVoteButton';
import { ArrowUpRight } from 'lucide-react';

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

export default function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-white/5 hover:bg-white/10 p-5 rounded-xl transition-colors">
      <div className="flex items-start justify-between w-full">
        <div className="flex items-start space-x-4 flex-grow">
          <div className="w-24 h-24 flex-shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={96}
                height={96}
                unoptimized
                className="rounded-lg object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-white/10 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl font-bold">{product.name.charAt(0)}</span>
              </div>
            )}
          </div>
          
          <div className="flex flex-col gap-2.5">
            <Link href={`/product-hunt/${product.url}`} className="block flex flex-col gap-2">
              <div className="flex flex-col">
                <h3 className="text-xl font-semibold text-white hover:text-white/90 transition-colors">
                  {product.name}
                </h3>
                <p className="text-gray-400 mt-1 line-clamp-2">{product.description}</p>
              </div>
            </Link>
            <ClientVoteButton productId={product.id} />
          </div>
        </div>

        <Link 
          href={`/product-hunt/${product.url}`}
          className="ml-4 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors group"
        >
          <ArrowUpRight 
            className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" 
          />
        </Link>
      </div>
    </div>
  );
}