import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";
import Layout from "@/app/components/layout/Layout";
import PostContent from "@/app/components/lounge/PostContent";
import JsonLd from "@/app/components/seo/JsonLd";
import { getLoungePostById, getSavedIds, getPostVoteForUser } from "@/app/lib/queries";
import { isAdmin } from "@/app/lib/isAdmin";
import { SITE_URL, breadcrumbSchema } from "@/app/lib/seo";

export const revalidate = 60;

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  if (!id) return { title: "Post Not Found" };
  const post = await getLoungePostById(id);
  if (!post) return { title: "Post Not Found" };
  const description = (post.content || "").slice(0, 160).replace(/\\s+/g, " ").trim();
  return {
    title: post.title + " — Lounge",
    description: description || "Community post: " + post.title,
    alternates: { canonical: "/lounge/" + id },
    openGraph: {
      title: post.title,
      description,
      type: "article",
      url: "/lounge/" + id,
      publishedTime: post.created_at,
      modifiedTime: post.updated_at || post.created_at,
    },
    twitter: { card: "summary", title: post.title, description },
  };
}

export default async function PostPage({ params }: Props) {
  const { id: postId } = await params;
  if (!postId) notFound();
  const post = await getLoungePostById(postId);
  if (!post) notFound();

  const session = await getServerSession(authOptions);
  const [adminFlag, saves, myVote] = await Promise.all([
    session?.user?.email ? isAdmin(session.user.email) : Promise.resolve(false),
    getSavedIds(session?.user?.id, "post"),
    session?.user?.id ? getPostVoteForUser(postId, session.user.id) : Promise.resolve(undefined),
  ]);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "DiscussionForumPosting",
    headline: post.title,
    articleBody: post.content,
    datePublished: post.created_at,
    dateModified: post.updated_at || post.created_at,
    url: SITE_URL + "/lounge/" + postId,
    author: post.users?.name
      ? { "@type": "Person", name: post.users.name }
      : { "@type": "Organization", name: "Pulchowk Events", url: SITE_URL },
    publisher: {
      "@type": "Organization",
      name: "Pulchowk Events",
      logo: { "@type": "ImageObject", url: SITE_URL + "/logo.svg" },
    },
  };

  const breadcrumbJsonLd = breadcrumbSchema([
    { name: "Home", url: SITE_URL },
    { name: "Lounge", url: SITE_URL + "/lounge" },
    { name: post.title },
  ]);

  return (
    <Layout railContext="lounge">
      <JsonLd data={articleJsonLd} />
      <JsonLd data={breadcrumbJsonLd} />
      <PostContent
        post={post as any}
        isAdmin={adminFlag}
        isAuthor={session?.user?.id === post.author_id}
        isSaved={saves.has(postId)}
        myVote={myVote}
        userId={session?.user?.id}
      />
    </Layout>
  );
}
