"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import Markdown from "@/app/components/ui/Markdown";
import { formatDateLong } from "@/app/lib/formatDate";
import { ProjectDetailActions } from "./ProjectDetailActions";
import { ProductComposer } from "./ProductComposer";
import { Comments } from "@/app/components/comments/CommentSection";
import StructuredDescription from "@/app/components/ui/StructuredDescription";

interface Product {
  id: number;
  name: string;
  description: string;
  url: string;
  image_url: string | null;
  redirect_url: string | null;
  votes: number | null;
  posted_by: string;
  created_at: string;
  users?: { name: string | null; image: string | null } | null;
}

interface Props {
  product: Product;
  isSaved: boolean;
  isAdmin: boolean;
  userId?: string;
  initialEditMode?: boolean;
}

function shorten(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max).trim() + "…";
}

export function ProductDetail({ product, isSaved, isAdmin, userId, initialEditMode = false }: Props) {
  const router = useRouter();
  const [editOpen, setEditOpen] = useState(initialEditMode);

  useEffect(() => { setEditOpen(initialEditMode); }, [initialEditMode]);

  if (editOpen) {
    return (
      <article className="pd">
        <Link href="/product-hunt" className="ev-detail__back">
          <ArrowLeft size={14} />
          Projects
        </Link>
        <ProductComposer
          userId={userId}
          productId={product.id}
          initialValues={{
            name: product.name,
            description: product.description,
            url: product.url,
            image_url: product.image_url,
            redirect_url: product.redirect_url,
            created_at: product.created_at,
            maker_name: product.users?.name || null,
          }}
          onCancel={() => setEditOpen(false)}
          onSaved={() => { setEditOpen(false); router.refresh(); }}
        />
      </article>
    );
  }

  const tagline = shorten(product.description || "", 160);

  return (
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
          {tagline && <p className="pd__tagline">{tagline}</p>}
          <p className="pd__meta">
            Launched {formatDateLong(product.created_at)}
            {product.users?.name && <> · by {product.users.name}</>}
          </p>
        </div>
      </header>

      <ProjectDetailActions
        product={product}
        isSaved={isSaved}
        isAdmin={isAdmin}
        onEdit={() => setEditOpen(true)}
      />

      {product.description && (
        <section className="pd__body">
          <StructuredDescription content={product.description} />
        </section>
      )}

      <section className="pd__comments">
        <Comments productId={product.id} />
      </section>
    </article>
  );
}
