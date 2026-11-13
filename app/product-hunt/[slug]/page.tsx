import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import { ProductDetail } from "@/app/components/product/ProductDetail";
import JsonLd from "@/app/components/seo/JsonLd";
import { getProductBySlug, getSavedIds } from "@/app/lib/queries";
import { isAdmin } from "@/app/lib/isAdmin";
import { SITE_URL, breadcrumbSchema } from "@/app/lib/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ edit?: string }>;
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
      card: "summary",
      title: product.name,
      description,
      images: product.image_url ? [product.image_url] : [SITE_URL + "/product-hunt/" + slug + "/opengraph-image"],
    },
  };
}

export default async function ProductPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const sp = await searchParams;
  const initialEditMode = sp.edit === "true";
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
    { name: "Product Hunt", url: SITE_URL + "/product-hunt" },
    { name: product.name },
  ]);

  return (
    <Layout railContext="projects">
      <JsonLd data={productJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />

      <div id="portal-root" />

      <ProductDetail
        product={product}
        isSaved={saves.has(String(product.id))}
        isAdmin={adminFlag}
        userId={session?.user?.id}
        initialEditMode={initialEditMode}
      />
    </Layout>
  );
}
