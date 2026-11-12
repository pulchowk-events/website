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
    <article className="product-card">
      <Link href={'/product-hunt/' + product.url} className="product-card__logo-wrap">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt={product.name}
            width={80}
            height={80}
            unoptimized
            className="product-card__logo"
          />
        ) : (
          <span className="product-card__logo-fallback">{product.name.charAt(0)}</span>
        )}
      </Link>

      <div className="product-card__body">
        <Link href={'/product-hunt/' + product.url} className="product-card__title-link">
          <h3 className="product-card__title">{product.name}</h3>
          <p className="product-card__desc">{product.description}</p>
        </Link>
        <ClientVoteButton productId={product.id} />
      </div>

      <Link
        href={'/product-hunt/' + product.url}
        className="product-card__arrow"
        aria-label={'Open ' + product.name}
      >
        <ArrowUpRight size={16} />
      </Link>
    </article>
  );
}
