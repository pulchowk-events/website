import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { ProjectDetailActions } from "@/app/components/product/ProjectDetailActions";
import { Comments } from "@/app/components/comments/CommentSection";
import JsonLd from "@/app/components/seo/JsonLd";
import { getProductBySlug, getSavedIds } from "@/app/lib/queries";
import { isAdmin } from "@/app/lib/isAdmin";
import { formatDateLong } from "@/app/lib/formatDate";
import { SITE_URL, breadcrumbSchema } from "@/app/lib/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  if (!slug) return { title: "Project Not Found" };
  const product = await getProductBySlug(slug);
  if (!product) return { title: "Project Not Found" };
  const description = (product.description || "").slice(0, 160).replace(/\\s+/g, " ").trim();
  return {
    title: product.name + " — Student Project",
    description: description || "Check out " + product.name + " on Pulchowk Events.",
    alternates: { canonical: "/product-hunt/" + slug },
    openGraph: {
      title: product.name,
      description,
      type: "website",
      url: "/product-hunt/" + slug,
      images: product.image_url ? [product.image_url] : [SITE_URL + "/product-hunt/" + slug + "/opengraph-image"],
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.image_url ? [product.image_url] : [SITE_URL + "/product-hunt/" + slug + "/opengraph-image"],
    },
  };
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params;
  if (!slug) notFound();
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const session = await getServerSession(authOptions);
  const [adminFlag, saves] = await Promise.all([
    session?.user?.email ? isAdmin(session.user.email) : Promise.resolve(false),
    getSavedIds(session?.user?.id, "project"),
  ]);

  const productJsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: product.name,
    description: (product.description || "").slice(0, 500),
    image: product.image_url || SITE_URL + "/product-hunt/" + slug + "/opengraph-image",
    url: SITE_URL + "/product-hunt/" + slug,
    applicationCategory: "WebApplication",
    operatingSystem: "Any",
    offers: { "@type": "Offer", price: "0", priceCurrency: "NPR" },
  };

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Projects", url: SITE_URL + "/product-hunt" },
    { name: product.name },
  ]);

  return (
    <Layout railContext="projects">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div id="portal-root" />

      <article className="pd">
        <Link href="/product-hunt" className="ev-detail__back">
          <ArrowLeft size={14} />
          Projects
        </Link>

        <header className="pd__head">
          <span className="pd__logo">
            {product.image_url ? (
              <Image src={product.image_url} alt="" width={96} height={96} unoptimized />
            ) : (
              <span className="pd__logo-initial">{product.name.charAt(0).toUpperCase()}</span>
            )}
          </span>
          <div className="pd__head-body">
            <h1 className="pd__title">{product.name}</h1>
            {product.description && <p className="pd__tagline">{product.description}</p>}
            <p className="pd__meta">
              Launched {formatDateLong(product.created_at)}
              {product.users?.name && <> · by {product.users.name}</>}
            </p>
          </div>
        </header>

        <ProjectDetailActions
          product={product}
          isSaved={saves.has(String(product.id))}
          isAdmin={adminFlag}
        />

        {product.description && (
          <section className="pd__body">
            <p>{product.description}</p>
          </section>
        )}

        <section className="pd__comments">
          <Comments productId={product.id} />
        </section>
      </article>
    </Layout>
  );
}
