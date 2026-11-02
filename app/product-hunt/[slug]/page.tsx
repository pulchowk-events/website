import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Layout from '@/app/components/layout/Layout';
import { ClientVoteButton } from '@/app/components/vote/ClientVoteButton';
import { RemoveButton } from '@/app/components/product/RemoveProduct';
import EditButton from '@/app/components/product/EditProduct';
import { Comments } from '@/app/components/comments/CommentSection';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/auth';
import { createServerSupabaseClient } from '@/app/lib/supabase-server';
import { getProductBySlug } from '@/app/lib/queries';
import JsonLd from '@/app/components/seo/JsonLd';
import { SITE_URL, breadcrumbSchema } from '@/app/lib/seo';
import Image from 'next/image';
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
    title: `${product.name} — Student Project`,
    description: description || `Check out ${product.name} on Pulchowk Events Product Hunt.`,
    alternates: { canonical: `/product-hunt/${slug}` },
    openGraph: {
      title: product.name,
      description,
      type: 'website',
      url: `/product-hunt/${slug}`,
      images: product.image_url
        ? [product.image_url]
        : [`${SITE_URL}/product-hunt/${slug}/opengraph-image`],
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description,
      images: product.image_url
        ? [product.image_url]
        : [`${SITE_URL}/product-hunt/${slug}/opengraph-image`],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();

  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await getServerSession(authOptions);

  const supabase = createServerSupabaseClient();
  const { data: adminData } = await supabase
    .from('admins')
    .select('email')
    .eq('email', session?.user?.email)
    .single();

  const isAdmin = !!adminData;
  const isOwner = session?.user?.id === product.posted_by;

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: product.name,
    description: (product.description || '').slice(0, 500),
    image: product.image_url || `${SITE_URL}/product-hunt/${slug}/opengraph-image`,
    url: `${SITE_URL}/product-hunt/${slug}`,
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
    { name: 'Product Hunt', url: `${SITE_URL}/product-hunt` },
    { name: product.name },
  ]);

  return (
    <Layout>
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <div className="max-w-7xl mx-auto py-16 px-8">
        <div className="flex flex-col md:flex-row gap-8 mb-8">
          <div className="w-full md:w-48 h-48 flex-shrink-0">
            {product.image_url ? (
              <Image
                src={product.image_url}
                alt={product.name}
                width={192}
                height={192}
                unoptimized
                className="rounded-lg object-cover w-full h-full"
              />
            ) : (
              <div className="w-full h-full bg-muted rounded-lg flex items-center justify-center">
                <span className="text-muted-foreground text-sm">No Image</span>
              </div>
            )}
          </div>

          <div className="flex-col flex gap-1 sm:gap-10">
            <div className="flex flex-col gap-1">
              <h1 className="text-4xl font-bold text-foreground">{product.name}</h1>
              <p className="text-lg text-foreground">{product.description}</p>
              <p className="text-sm text-muted-foreground">
                Created on: {new Date(product.created_at).toLocaleDateString()}
              </p>
            </div>

            <div className="mt-6 flex gap-4 text-foreground">
              <ClientVoteButton productId={product.id} />
              {(isAdmin || isOwner) && (
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
                  className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                >
                  <ExternalLink className="w-4 h-4" />
                  <div className="hidden sm:block">View Product</div>
                </a>
              )}
            </div>
          </div>
        </div>

        <Comments productId={product.id} />
      </div>
    </Layout>
  );
}