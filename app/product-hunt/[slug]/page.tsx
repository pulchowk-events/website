import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Layout from '@/app/components/layout/Layout';
import { ClientVoteButton } from '@/app/components/vote/ClientVoteButton';
import { RemoveButton } from '@/app/components/product/RemoveProduct';
import EditButton from '@/app/components/product/EditProduct';
import { Comments } from '@/app/components/comments/CommentSection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { getProductBySlug } from '@/app/lib/queries';
import { isAdmin } from '@/app/lib/isAdmin';
import { formatDateLong } from '@/app/lib/formatDate';
import JsonLd from '@/app/components/seo/JsonLd';
import { SITE_URL, breadcrumbSchema } from '@/app/lib/seo';
import { ExternalLink } from 'lucide-react';

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return { title: 'Product Not Found' };

  const product = await getProductBySlug(slug);
  if (!product) return { title: 'Product Not Found' };

  const description = (product.description || '').slice(0, 160).replace(/\s+/g, ' ').trim();

  return {
    title: product.name + ' — Student Project',
    description: description || 'Check out ' + product.name + ' on Pulchowk Events Product Hunt.',
    alternates: { canonical: '/product-hunt/' + slug },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      url: '/product-hunt/' + slug,
      images: product.image_url
        ? [product.image_url]
        : [SITE_URL + '/product-hunt/' + slug + '/opengraph-image'],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.image_url
        ? [product.image_url]
        : [SITE_URL + '/product-hunt/' + slug + '/opengraph-image'],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await getServerSession(authOptions);
  const admin = await isAdmin(session?.user?.email);
  const isOwner = session?.user?.id === product.posted_by;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: (product.description || '').slice(0, 500),
    image: product.image_url || SITE_URL + '/product-hunt/' + slug + '/opengraph-image',
    url: SITE_URL + '/product-hunt/' + slug,
    applicationCategory: 'WebApplication',
    operatingSystem: 'Any',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'NPR',
    },
  };

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: 'Home', url: SITE_URL },
    { name: 'Product Hunt', url: SITE_URL + '/product-hunt' },
    { name: product.name },
  ]);

  return (
    <Layout>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="w">
        <div className="product-detail">
          <div className="product-detail__media">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={192}
                height={192}
                unoptimized
                className="product-detail__img"
              />
            ) : (
              <div className="product-detail__fallback">
                <span>{product.name.charAt(0)}</span>
              </div>
            )}
          </div>

          <div className="product-detail__body">
            <h1 className="product-detail__title">{product.name}</h1>
            <p className="product-detail__desc">{product.description}</p>
            <p className="product-detail__date">Created on {formatDateLong(product.created_at)}</p>

            <div className="product-detail__actions">
              <ClientVoteButton productId={product.id} />
              {(admin || isOwner) && (
                <>
                  <EditButton product={product} />
                  <RemoveButton
                    productId={product.id}
                    productName={product.name}
                    isOwner={isOwner}
                  />
                </>
              )}
              {product.redirect_url && (
                <a
                  href={product.redirect_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn--secondary"
                >
                  <span className="btn__label">
                    <ExternalLink size={16} style={{ marginRight: 8 }} />
                    View product
                  </span>
                  <span className="btn__label btn__label--dup" aria-hidden="true">
                    <ExternalLink size={16} style={{ marginRight: 8 }} />
                    View product
                  </span>
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="product-detail__comments">
          <Comments productId={product.id} />
        </div>
      </div>
    </Layout>
  );
}
