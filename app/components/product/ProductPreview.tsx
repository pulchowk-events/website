"use client";

import Image from "next/image";
import { formatDateLong } from "@/app/lib/formatDate";
import Markdown from "@/app/components/ui/Markdown";
import { useSession } from "next-auth/react";

interface Props {
  name: string;
  description: string;
  imagePreviewUrl?: string | null;
  imageUrl?: string | null;
  createdAt?: string;
  makerName?: string | null;
}

function shorten(text: string, max: number): string {
  const trimmed = text.trim();
  if (trimmed.length <= max) return trimmed;
  return trimmed.slice(0, max).trim() + "…";
}

export function ProductPreview({ name, description, imagePreviewUrl, imageUrl, createdAt, makerName }: Props) {
  const { data: session } = useSession();
  const showImage = imagePreviewUrl || imageUrl;
  const maker = makerName || session?.user?.name || "You";
  const launchLine = createdAt ? formatDateLong(createdAt) : "today";
  const tagline = shorten(description, 160);

  return (
    <article className="pd pd--preview">
      <header className="pd__head">
        <span className="pd__logo">
          {showImage ? (
            <Image src={showImage} alt="" width={96} height={96} unoptimized />
          ) : (
            <span className="pd__logo-initial">{(name.charAt(0) || "?").toUpperCase()}</span>
          )}
        </span>
        <div className="pd__head-body">
          <h1 className="pd__title">
            {name.trim() || <span style={{ color: "var(--text-3)", fontWeight: 400 }}>Untitled project</span>}
          </h1>
          {tagline && <p className="pd__tagline">{tagline}</p>}
          <p className="pd__meta">
            Launched {launchLine} · by {maker}
          </p>
        </div>
      </header>

      {description.trim() && (
        <section className="pd__body">
          <Markdown content={description} />
        </section>
      )}
    </article>
  );
}
