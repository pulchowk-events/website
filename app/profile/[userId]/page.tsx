import { getServerSession } from "next-auth";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { authOptions } from "@/auth";
import { supabase } from "@/app/lib/supabase";
import { isAdmin } from "@/app/lib/isAdmin";
import Layout from "@/app/components/layout/Layout";
import ProfileContent from "@/app/components/profile/ProfileContent";
import { SITE_URL } from "@/app/lib/seo";

interface Props {
  params: Promise<{ userId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { userId } = await params;
  if (!userId) return { title: "Profile Not Found" };

  const { data } = await supabase
    .from("users")
    .select("name")
    .eq("id", userId)
    .single();

  const name = data?.name;
  const title = name ? name + String.fromCharCode(39) + "s Profile" : "Profile";
  const description = name
    ? "See " + name + String.fromCharCode(39) + "s activity on Pulchowk Events."
    : "Community profile on Pulchowk Events.";

  return {
    title,
    description,
    alternates: { canonical: "/profile/" + userId },
    robots: { index: false, follow: true },
    openGraph: { title, description, type: "profile", url: SITE_URL + "/profile/" + userId },
    twitter: { card: "summary", title, description },
  };
}

export default async function ProfilePage({ params }: Props) {
  const { userId } = await params;
  const session = await getServerSession(authOptions);

  const [{ data: userData, error: userError }, { data: prefsData }] = await Promise.all([
    supabase.from("users").select("id, name, image, bio, created_at").eq("id", userId).single(),
    supabase.from("user_preferences").select("profile_private").eq("user_id", userId).maybeSingle(),
  ]);

  if (userError || !userData) notFound();

  const isOwnProfile = session?.user?.id === userId;
  const viewerIsAdmin = session?.user?.email ? await isAdmin(session.user.email) : false;
  const isPrivate = Boolean(prefsData?.profile_private);
  const hideActivity = isPrivate && !isOwnProfile && !viewerIsAdmin;

  let stats = { posts: 0, comments: 0, products: 0 };
  if (!hideActivity) {
    const [postsRes, commentsRes, productsRes] = await Promise.all([
      supabase.from("lounge_posts").select("*", { count: "exact", head: true }).eq("author_id", userId),
      supabase.from("lounge_comments").select("*", { count: "exact", head: true }).eq("user_id", userId),
      supabase.from("products").select("*", { count: "exact", head: true }).eq("posted_by", userId),
    ]);
    stats = {
      posts: postsRes.count || 0,
      comments: commentsRes.count || 0,
      products: productsRes.count || 0,
    };
  }

  return (
    <Layout railContext="utility">
      <ProfileContent
        user={userData}
        stats={stats}
        isOwnProfile={isOwnProfile}
        isPrivate={hideActivity}
      />
    </Layout>
  );
}
